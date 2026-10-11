<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\PermisoFuncionamiento;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarPermisoFuncionamientoRequest;
use App\Jobs\EnviarPermisoFuncionamientoJob;
use Illuminate\Support\Facades\Auth;
use App\Models\Plantilla;
use App\Models\ProcesoPermiso;
use App\Models\Sbu;
use App\Jobs\GenerarPdfPermisoFuncionamientoJob;
use App\Models\Configuracion;
use App\Models\Inspeccion;
use App\Models\Institucion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PermisoFuncionamientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;
        $estado = $request->input('estado', 'APROBADO');

        $previousYear = $year - 1;

        if ($estado === 'APROBADO') {

            $fecha = 'fecha_inspeccion';

            $query = Inspeccion::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
            ])
            ->where('estado', $estado)
            ->whereHas('procesoPermiso', function ($q) {
                $q->whereNull('finished_at');
            })
            ->whereYear($fecha, $year);

        } else {  

            $query = PermisoFuncionamiento::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
            ])
            ->where(function ($query) use ($year, $previousYear, $estado) {
                // 1. permisos del año actual
                $query->where(function ($q) use ($year, $estado) {
                    $q->whereYear('fecha_expedicion', $year);
                    if ($estado) {
                        $q->where('estado', $estado);
                    }
                })

                // 2. permisos del año anterior creados este año
                ->orWhere(function ($q) use ($previousYear, $estado) {
                    $q->whereYear('fecha_expedicion', $previousYear)
                        ->where('pago_periodo_anterior', 1);
                    if ($estado) {
                        $q->where('estado', $estado);
                    }
                });
            });

            $fecha = 'fecha_expedicion';

        }

        $permisosFuncionamientos = $query
        ->when($search, function ($query) use ($search) {
            $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->orderBy('numero')
        ->orderBy($fecha)        
        ->paginate(10)
        ->withQueryString();
        
        $totales = PermisoFuncionamiento::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'EXPEDIDO' THEN 1 ELSE 0 END) as expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN 1 ELSE 0 END) as anulados,

            SUM(CASE WHEN estado = 'EXPEDIDO' THEN valor_total ELSE 0 END) as monto_expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN valor_total ELSE 0 END) as monto_anulados,

            SUM(valor_total) as monto_total
        ")
        ->where(function ($query) use ($year, $previousYear, $estado) {
            // 1. permisos del año actual
            $query->where(function ($q) use ($year, $estado) {
                $q->whereYear('fecha_expedicion', $year);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            })

            // 2. permisos del año anterior creados este año
            ->orWhere(function ($q) use ($previousYear, $estado) {
                $q->whereYear('fecha_expedicion', $previousYear)
                    ->where('pago_periodo_anterior', 1);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            });
        })
        ->first();

        return inertia('permisosFuncionamientos/index', [
            'permisosFuncionamientos' => $permisosFuncionamientos,
            'totales' => $totales,
            'filters' => [
                'search' => $search,
                'year' => $year,
                'estado' => $estado,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, ProcesoPermiso $procesoPermiso)
    {
        // 👇 VALIDACIÓN DE SEGURIDAD
        if (!Auth::user()->roles->contains('id', 5)) {
            abort(403, 'No autorizado para crear permisos de funcionamiento.');
        }

        $year = $procesoPermiso->inspeccion?->fecha_inspeccion
            ? Carbon::parse($procesoPermiso->inspeccion->fecha_inspeccion)->year
            : now()->year;

        $procesoPermiso->load([
            'cliente.parroquia',
            'actividadEconomica.parroquia',
            'inspeccionInicial',
            'reinspecciones',
            'tipoPermiso'
        ]);

        $valor_inspeccion = 0;
        $valor_nota_credito = 0;
        $valor_multa = 0;
        $valor_reinspeccion = 0;
        $valor_total = 0;

        if ($procesoPermiso->inspeccionInicial->exento_pago == 0){
            $valor_inspeccion = $procesoPermiso->inspeccionInicial->valor_inspeccion - $procesoPermiso->inspeccionInicial->valor_descuento ?? 0;
            $valor_nota_credito = $procesoPermiso->inspeccionInicial->valor_nota_credito ?? 0;
            $valor_multa = $procesoPermiso->inspeccionInicial->valor_multa ?? 0;
            $valor_reinspeccion = $procesoPermiso->reinspecciones->sum('valor_inspeccion');
            $valor_total = $valor_inspeccion + $valor_reinspeccion - $valor_nota_credito + $valor_multa;
        }

        $ultimoNumero = PermisoFuncionamiento::whereYear('created_at', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        $permisosFuncionamientos['actual'] = [
            'periodo' => $year,
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT),
            'valor_inspeccion' => $valor_inspeccion,
            'valor_reinspeccion' => $valor_reinspeccion,
            'valor_nota_credito' => $valor_nota_credito,
            'valor_multa' => $valor_multa,
            'valor_total' => $valor_total,
        ];

        if ($procesoPermiso->tipoPermiso->valida_permiso_anterior == 1){
            $previousYear = $year - 1;

            $permisoAnterior = PermisoFuncionamiento::whereYear('fecha_expedicion', $previousYear)
                ->whereHas('procesoPermiso', function ($query) use ($procesoPermiso) {
                    $query->where('actividad_economica_id', $procesoPermiso->actividad_economica_id);
                })
                ->where('estado', 'EXPEDIDO')
                ->first();

            if (!$permisoAnterior){
                // Si la actividad empezó este año, no se calcula permiso anterior
                if (date('Y', strtotime($procesoPermiso->actividadEconomica->fecha_inicio)) < $year) {  
                    $sbu = Sbu::where('periodo', $previousYear)
                        ->first();
                    
                    $area = $procesoPermiso->inspeccion->area_total;

                    $tarifario = $procesoPermiso->tarifario;

                    $tarifarioPeriodoAnterior = $tarifario->tarifarioPeriodo()
                        ->where('periodo', $previousYear)
                        ->select('id', 'tarifario_id', 'valor', 'riesgo', 'valor_fijo')
                        ->first();

                    if ($tarifarioPeriodoAnterior && $sbu) {
                        $valor = $tarifarioPeriodoAnterior->valor;
                        $riesgo = $tarifarioPeriodoAnterior->riesgo;
                        $valor_fijo = $tarifarioPeriodoAnterior->valor_fijo; 
                    }

                    $valor_inspeccion_anterior = $valor_fijo == 0 
                        ? ($area * $valor) + ($sbu->valor * $riesgo) 
                        : $valor;

                    $permisosFuncionamientos['anterior'] = [
                        'periodo' => $previousYear,
                        'numero' => str_pad($numero + 1,7,'0',STR_PAD_LEFT),
                        'valor_inspeccion' => $valor_inspeccion_anterior,
                        'valor_nota_credito' => 0,
                        'valor_multa' => 0,
                        'valor_total' => $valor_inspeccion_anterior,
                    ];
                }
            }
        }

        return inertia('permisosFuncionamientos/create', [
            'procesoPermiso' => $procesoPermiso,
            'permisosFuncionamientos' => $permisosFuncionamientos,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'APROBADO'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarPermisoFuncionamientoRequest $request)
    {
        $procesoPermiso = ProcesoPermiso::findOrFail($request->proceso_permiso_id);

        $year = $procesoPermiso->inspeccion?->fecha_inspeccion
            ? Carbon::parse($procesoPermiso->inspeccion->fecha_inspeccion)->year
            : now()->year;
    
        $ultimoNumero = PermisoFuncionamiento::whereYear('created_at', now()->year)
            ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        $codigo_verificacion1 = strtoupper(Str::random(12));

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $procesoPermiso, $year, $numero, $codigo_verificacion1, $request) {
            PermisoFuncionamiento::create([
                'plantilla_id' => $procesoPermiso->tipoPermiso?->plantilla_id,
                'proceso_permiso_id' => $request->proceso_permiso_id,
                'numero' => $numero,
                'valor_inspeccion' => $request->valor_inspeccion,
                'valor_reinspeccion' => $request->valor_reinspeccion,
                'valor_nota_credito' => $request->valor_nota_credito,
                'valor_multa' => $request->valor_multa,
                'valor_total' => $request->valor_total,
                'fecha_expedicion' => $validated['fecha_expedicion'],
                'fecha_caducidad' => $validated['fecha_caducidad'],
                'fecha_deposito' => $validated['fecha_deposito'],
                'documento_deposito' => $validated['documento_deposito'],
                'observaciones' => $validated['observaciones'],
                'codigo_verificacion' => $codigo_verificacion1
            ]);

            if ($procesoPermiso->tipoPermiso->valida_permiso_anterior == 1){
                $previousYear = $year - 1;

                $permisoAnterior = PermisoFuncionamiento::whereYear('fecha_expedicion', $previousYear)
                    ->whereHas('procesoPermiso', function ($query) use ($procesoPermiso) {
                        $query->where('actividad_economica_id', $procesoPermiso->actividad_economica_id);
                    })
                    ->where('estado', 'EXPEDIDO')
                    ->first();

                if (!$permisoAnterior){
                    // Si la actividad empezó este año, no se calcula permiso anterior
                    if (date('Y', strtotime($procesoPermiso->actividadEconomica->fecha_inicio)) < $year) {  
                        $sbu = Sbu::where('periodo', $previousYear)
                            ->first();
                        
                        $area = $procesoPermiso->inspeccion->area_total;

                        $tarifario = $procesoPermiso->tarifario;

                        $tarifarioPeriodoAnterior = $tarifario->tarifarioPeriodo()
                            ->where('periodo', $previousYear)
                            ->select('id', 'tarifario_id', 'valor', 'riesgo', 'valor_fijo')
                            ->first();

                        if ($tarifarioPeriodoAnterior && $sbu) {
                            $valor = $tarifarioPeriodoAnterior->valor;
                            $riesgo = $tarifarioPeriodoAnterior->riesgo;
                            $valor_fijo = $tarifarioPeriodoAnterior->valor_fijo; 
                        }

                        $valor_inspeccion_anterior = $valor_fijo == 0 
                            ? ($area * $valor) + ($sbu->valor * $riesgo) 
                            : $valor;

                        $codigo_verificacion2 = strtoupper(Str::random(12));

                        PermisoFuncionamiento::create([
                            'plantilla_id' => $procesoPermiso->tipoPermiso?->plantilla_id,
                            'proceso_permiso_id' => $request->proceso_permiso_id,
                            'numero' => $numero + 1,
                            'valor_inspeccion' => $valor_inspeccion_anterior,
                            'valor_reinspeccion' => 0,
                            'valor_nota_credito' => 0,
                            'valor_multa' => 0,
                            'valor_total' => $valor_inspeccion_anterior,
                            'fecha_expedicion' => $validated['fecha_expedicion'],
                            'fecha_caducidad' => $validated['fecha_caducidad'],
                            'fecha_deposito' => $validated['fecha_deposito'],
                            'documento_deposito' => $validated['documento_deposito'],
                            'observaciones' => null,
                            'pago_periodo_anterior' => 1,
                            'codigo_verificacion' => $codigo_verificacion2
                        ]);
                    }
                }
            }
        });

        return redirect()->route('permisosfuncionamientos.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'APROBADO'),
        ])->with('success', 'Permiso de funcionamiento creado correctamente');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, PermisoFuncionamiento $permisoFuncionamiento)
    {
        // 👇 VALIDACIÓN DE SEGURIDAD
        if (!Auth::user()->roles->contains('id', 5)) {
            abort(403, 'No autorizado para editar permisos de funcionamiento.');
        }

        $procesoPermiso = $permisoFuncionamiento->procesoPermiso()
        ->with([
            'cliente.parroquia',
            'actividadEconomica.parroquia',
        ])
        ->first();

        return inertia('permisosFuncionamientos/edit', [
            'procesoPermiso' => $procesoPermiso,
            'permisoFuncionamiento' => $permisoFuncionamiento,        
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'APROBADO'),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarPermisoFuncionamientoRequest $request, PermisoFuncionamiento $permisoFuncionamiento)
    {
        $firmantes = $permisoFuncionamiento->firmantes()->count();

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $permisoFuncionamiento, $firmantes) {
            $permisoFuncionamiento->update([
                'valor_inspeccion' => $request->valor_inspeccion,
                'valor_reinspeccion' => $request->valor_reinspeccion,
                'valor_nota_credito' => $request->valor_nota_credito,
                'valor_multa' => $request->valor_multa,
                'valor_total' => $request->valor_total,
                'fecha_expedicion' => $validated['fecha_expedicion'],
                'fecha_caducidad' => $validated['fecha_caducidad'],
                'fecha_deposito' => $validated['fecha_deposito'],
                'documento_deposito' => $validated['documento_deposito'],
                'observaciones' => $validated['observaciones'],
                'estado_firma' => $firmantes > 0 ? 'PENDIENTE' : 'SIN_FIRMA'
            ]);
        });

        return redirect()->route('permisosfuncionamientos.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'APROBADO'),
        ])->with('success', 'Permiso de funcionamiento actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function anular(Request $request, PermisoFuncionamiento $permisoFuncionamiento)
    {
        $permisoFuncionamiento->update([
            'estado' => 'ANULADO'
        ]);

        return redirect()->route('permisosfuncionamientos.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'APROBADO'),
        ])->with('success', 'Permiso de funcionamiento anulado correctamente');
    }

    public function firmar($id)
    {
        $permiso = PermisoFuncionamiento::findOrFail($id);

        GenerarPdfPermisoFuncionamientoJob::dispatch($permiso->id);
    
        return back()->with('success', 'El documento se está firmando en segundo plano');
    }
    
    public function descargar($id)
    {
        $permisoFuncionamiento = PermisoFuncionamiento::findOrFail($id);

        $fecha = Carbon::parse($permisoFuncionamiento->fecha_expedicion);

        if ($permisoFuncionamiento->ruta_pdf_firmado != null){
            $path = storage_path('app/private/' . $permisoFuncionamiento->ruta_pdf_firmado);

            if (!file_exists($path)) {
                return back()->with('error', 'El permiso de funcionamiento no está firmado aún');
            }

            return response()->download(
                $path,
                "Permiso_Funcionamiento_{$permisoFuncionamiento->numero_formateado}_{$fecha->year}_firmado.pdf"
            );
        }else{
            $configuracion = Configuracion::first();

            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/permisosfuncionamientos/' . $permisoFuncionamiento->codigo_verificacion . '/verificar';

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($permisoFuncionamiento->plantilla_id);
            $permiso = $permisoFuncionamiento;
            $vista = 'pdf.' . $plantilla->vista_blade;
            
            $pdf = Pdf::loadView($vista, compact('institucion','permiso','qrBase64'));

            if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {                
                $pdf->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');
            } else {
                $pdf->setPaper([
                    0,
                    0,
                    $plantilla->ancho,
                    $plantilla->alto
                ], $plantilla->orientacion_papel ?? 'portrait');
            }

            return $pdf->download("Permiso_Funcionamiento_{$permisoFuncionamiento->numero_formateado}_{$fecha->year}.pdf"); 
        }

    }

    public function verificar($codigo)
    {
        $permiso = PermisoFuncionamiento::where(
            'codigo_verificacion',
            $codigo
        )->firstOrFail();

        return view('verificacion.permiso', compact('permiso'));
    }

    public function reenviarCorreo(PermisoFuncionamiento $permisoFuncionamiento)
    {
        if (!$permisoFuncionamiento->ruta_pdf_firmado) {
            return back()->with('error', 'El permiso de funcionamiento no está firmado aún');
        }

        EnviarPermisoFuncionamientoJob::dispatch($permisoFuncionamiento)
            ->onQueue('correos');

        return back()->with('success', 'El correo se está enviando en segundo plano.');
    }

    public function preview($id)
    {
        $permiso = PermisoFuncionamiento::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica' => function ($query) {
                $query->with(['provincia', 'canton', 'parroquia']);
            },
            'procesoPermiso.inspeccionAprobada',
            'procesoPermiso.extintores',
            'plantilla',
        ])->findOrFail($id);

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($permiso->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;
        $pdf = Pdf::loadView($vista, compact('institucion','permiso'));

        if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {                
            $pdf->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');
        } else {
            $pdf->setPaper([
                0,
                0,
                $plantilla->ancho,
                $plantilla->alto
            ], $plantilla->orientacion_papel ?? 'portrait');
        }

        return $pdf->stream('preview.pdf');
    }
}
