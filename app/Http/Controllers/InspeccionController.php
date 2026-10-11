<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Inspeccion;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarInspeccionRequest;
use App\Jobs\EnviarInformeInspeccionJob;
use App\Jobs\GenerarPdfInspeccionJob;
use App\Models\Configuracion;
use App\Models\NotaCredito;
use App\Models\Personal;
use App\Models\Plantilla;
use App\Models\SolicitudInspeccion;
use Illuminate\Support\Facades\Auth;
use App\Models\Sbu;
use App\Models\Institucion;
use App\Models\ProcesoPermiso;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class InspeccionController extends Controller
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
        $estado = $request->input('estado', 'GENERADO');

        if ($estado === 'GENERADO') {
            $inspecciones = SolicitudInspeccion::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
            ]);
        } else {
            $inspecciones = Inspeccion::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
            ]);
        }
        
        $inspecciones = $inspecciones
        ->when($search, function ($query) use ($search) {
            $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->whereYear('fecha_inspeccion', $year)  
        ->when($estado, function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->orderby('fecha_inspeccion')
        ->orderby('numero')
        ->paginate(10)
        ->withQueryString();

        return inertia('inspecciones/index', [
            'inspecciones' => $inspecciones,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'filters' => [
                'search' => $search,
                'year' => $year,
                'estado' => $estado,
            ],
        ]);
    }

    public function novedades(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;

        $inspecciones = Inspeccion::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica.parroquia',
            'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
        ])
        ->when($search, function ($query) use ($search) {
            $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->whereYear('fecha_inspeccion', $year)  
        ->where('procesado', 0)
        ->orderby('fecha_inspeccion')
        ->orderby('numero')
        ->paginate(10)
        ->withQueryString();

        return inertia('inspecciones/novedades', [
            'inspecciones' => $inspecciones,
            'filters' => [
                'search' => $search,
                'year' => $year
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, SolicitudInspeccion $solicitudInspeccion)
    {
        if ($solicitudInspeccion->personal_id !== Auth::user()->personal?->id) {
            abort(403, 'No autorizado para crear este informe.');
        }

        $year = $solicitudInspeccion?->fecha_inspeccion
            ? Carbon::parse($solicitudInspeccion->fecha_inspeccion)->year
            : now()->year;

        $solicitudInspeccion->load([
            'procesoPermiso.cliente.parroquia',
            'procesoPermiso.actividadEconomica.parroquia',
            'procesoPermiso.tarifario.tarifarioPeriodo' => function ($query) use ($year) {
                $query->where('periodo', $year)
                    ->select('id', 'tarifario_id', 'valor', 'riesgo', 'valor_fijo');
            },
            'procesoPermiso.ultimaInspeccion',
        ]);

        $sbu = Sbu::where('periodo', $year)
        ->first();

        $ultimoNumero = Inspeccion::whereYear('fecha_inspeccion', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        $procesoPermiso = $solicitudInspeccion->procesoPermiso;

        $inspeccionPlanos = null;

        if ($procesoPermiso->actualizacion_planos == 1){
            $inspeccionPlanos = Inspeccion::whereHas('procesoPermiso', function ($query) use ($procesoPermiso) {
                $query->where('actividad_economica_id', $procesoPermiso->actividad_economica_id)
                    ->where('tipo_permiso_id', 4)
                    ->where('actualizacion_planos', 0);
            })
            ->where('estado', 'APROBADO')
            ->orderBy('fecha_inspeccion', 'DESC')
            ->first();
        }

        $notaCredito = NotaCredito::where('actividad_economica_id', $procesoPermiso->actividad_economica_id)
        ->first();

        $configuracion = Configuracion::first();

        $porcentajeMulta = $configuracion->activar_mes_cobro_multas <= now()->month ? $configuracion->porcentaje_multas : 0;

        $subtotalInspecciones = Inspeccion::where('proceso_permiso_id', $procesoPermiso->id)
        ->sum('subtotal');

        return inertia('inspecciones/create', [
            'solicitudInspeccion' => $solicitudInspeccion,
            'subtotalInspecciones' => $subtotalInspecciones,
            'sbu' => optional($sbu)->valor ?? 0,
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT),
            'inspeccionPlanos' => optional($inspeccionPlanos)->valor_inspeccion ?? 0,
            'saldoNotaCredito' => optional($notaCredito)->saldo ?? 0,
            'porcentajeReinspeccion' => $solicitudInspeccion->tipo_solicitud == 'RE' ? $configuracion->porcentaje_reinspeccion : 0,
            'porcentajeMulta' => $porcentajeMulta,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'GENERADO'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarInspeccionRequest $request)
    {
        // Obtener plantilla
        $plantillaId = Plantilla::where('nombre', 'INFORME DE INSPECCION')
        ->where('predeterminado', 1)
        ->value('id');
        
        // Obtener inspector
        $personal = Personal::where('id', Auth::user()->personal?->id)
        ->firstOrFail();

        $ultimoNumero = Inspeccion::whereYear('fecha_inspeccion', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        $dias = Configuracion::value('plazo_obtencion_permiso');
        $plazo_permiso = Carbon::now()->addWeekdays($dias);

        $porcentaje_planos = Configuracion::value('porcentaje_planos');

        $porcentaje_inspeccion = ProcesoPermiso::where('id', $request->proceso_permiso_id)
            ->value('actualizacion_planos') == 0
                ? 100
                : $porcentaje_planos;
        
        $codigo_verificacion = strtoupper(Str::random(12));
        
        $validated = $request->validated();

        $inspeccion = null;

        DB::transaction(function () use ($validated, $plantillaId, $personal, $numero, $plazo_permiso, $porcentaje_inspeccion, $codigo_verificacion, &$inspeccion, $request) {
            $inspeccion = Inspeccion::create([
                'plantilla_id' => $plantillaId,
                'proceso_permiso_id' => $request->proceso_permiso_id,
                'solicitud_inspeccion_id' => $request->solicitud_inspeccion_id,
                'personal_id' => $personal->id,
                'nombre_personal' => strtoupper($personal->nombre),
                'numero' => $numero,
                'fecha_inspeccion' => now(),
                'tipo_funcion' => $request->tipo_funcion,
                'tipo_cons_hormigon' => $request->tipo_cons_hormigon,
                'tipo_cons_metalica' => $request->tipo_cons_metalica,
                'tipo_cons_madera' => $request->tipo_cons_madera,
                'tipo_cons_otros' => $request->tipo_cons_otros,
                'tipo_comb_surtidores' => $request->tipo_comb_surtidores,
                'tipo_comb_diesel' => $request->tipo_comb_diesel,
                'tipo_comb_gasolina' => $request->tipo_comb_gasolina,
                'tipo_comb_cap_diesel' => $request->tipo_comb_cap_diesel,
                'tipo_comb_cap_gasolina' => $request->tipo_comb_cap_gasolina,
                'tipo_comb_transporte' => $request->tipo_comb_transporte,
                'tipo_comb_vehiculo' => $request->tipo_comb_vehiculo,
                'tipo_comb_placas' => $request->tipo_comb_placas,
                'tipo_comb_almacenamiento' => $request->tipo_comb_almacenamiento,
                'tipo_comb_venta' => $request->tipo_comb_venta,
                'tipo_extintor' => $request->tipo_extintor,
                'tipo_comb_extintor' => $request->tipo_comb_extintor,
                'tipo_comb_origen' => $request->tipo_comb_origen,
                'tipo_comb_destino' => $request->tipo_comb_origen,
                'tipo_comb_norma_inen' => $request->tipo_comb_norma_inen,
                'tipo_comb_observaciones' => $request->tipo_comb_observaciones,
                'inst_elec_buenas' => $request->inst_elec_buenas,
                'inst_elec_malas' => $request->inst_elec_malas,
                'inst_elec_internas' => $request->inst_elec_internas,
                'inst_elec_externas' => $request->inst_elec_externas,
                'inst_elec_generador' => $request->inst_elec_generador,
                'inst_elec_transformador' => $request->inst_elec_transformador,
                'vent_natural' => $request->vent_natural,
                'vent_mecanica' => $request->vent_mecanica,
                'vent_adecuada' => $request->vent_adecuada,
                'vent_escasa' => $request->vent_escasa,
                'area1' => $request->area1,
                'area2' => $request->area2,
                'area3' => $request->area3,
                'area4' => $request->area4,
                'area_total' => $validated['area_total'],
                'aforo_personas' => $request->aforo_personas,
                'sist_ince_detectores_humo' => $request->sist_ince_detectores_humo,
                'sist_ince_lamparas_emergencia' => $request->sist_ince_lamparas_emergencia,
                'sist_ince_gabinetes' => $request->sist_ince_gabinetes,
                'sist_ince_sprinklers' => $request->sist_ince_sprinklers,
                'sist_ince_alarma_incendio' => $request->sist_ince_alarma_incendio,
                'sist_ince_bombas_hidraulicas' => $request->sist_ince_bombas_hidraulicas,
                'sist_ince_bombas_impulsion' => $request->sist_ince_bombas_impulsion,
                'sist_ince_escaleras_emergencia' => $request->sist_ince_escaleras_emergencia,
                'sist_ince_puerta_escape' => $request->sist_ince_puerta_escape,
                'sist_ince_puertas_contra_fuego' => $request->sist_ince_puertas_contra_fuego,
                'sist_ince_senalizacion_emergencia' => $request->sist_ince_senalizacion_emergencia,
                'sist_ince_tanques_reserva_agua' => $request->sist_ince_tanques_reserva_agua,
                'sist_ince_espumogeno' => $request->sist_ince_espumogeno,
                'capacitacion_extintores' => $request->capacitacion_extintores,
                'observaciones' => $validated['observaciones'],
                'recomendaciones' => $validated['recomendaciones'],
                'porcentaje_inspeccion' => $porcentaje_inspeccion,
                'porcentaje_descuento' => $request->porcentaje_descuento,
                'valor_inspeccion' => $request->valor_inspeccion,
                'valor_descuento' => $request->valor_descuento,
                'valor_nota_credito' => $request->valor_nota_credito,
                'valor_multa' => $request->valor_multa,
                'subtotal' => $request->subtotal,
                'valor_total' => $request->valor_total,
                'estado' => $request->estado_informe,
                'exento_pago' => $request->exento_pago,
                'procesado' => $request->estado_informe == 'APROBADO' ? 1 : 0,
                'plazo_permiso' => $request->estado_informe == 'APROBADO' ? $plazo_permiso : null,
                'codigo_verificacion' => $codigo_verificacion
            ]);

            if (!empty($request->extintores)) {
                $procesoPermiso = ProcesoPermiso::findOrFail($request->proceso_permiso_id);

                $procesoPermiso->extintores()->createMany(
                    collect($request->extintores)->map(fn ($e) => [
                        ...$e,
                        'periodo' => now()->year,
                    ])->toArray()
                );
            }
        });

        return redirect()->route('inspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Informe de inspección creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Inspeccion $inspeccion)
    {        
        $inspeccion->load([
            'procesoPermiso.cliente.parroquia',
            'procesoPermiso.actividadEconomica.parroquia',
            'archivos:id,inspeccion_id,nombre,ruta,tipo,size'
        ]);  

        return inertia('inspecciones/show', [
            'inspeccion' => $inspeccion,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'GENERADO'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Inspeccion $inspeccion)
    {
        // 👇 VALIDACIÓN DE SEGURIDAD
        if ($inspeccion->personal_id !== Auth::user()->personal?->id) {
            abort(403, 'No autorizado para editar este informe.');
        }

        $year = $inspeccion->fecha_inspeccion
            ? Carbon::parse($inspeccion->fecha_inspeccion)->year
            : now()->year;

        $procesoPermiso = $inspeccion->procesoPermiso()
            ->with([
                'cliente.parroquia',
                'actividadEconomica.parroquia',
                'tarifario.tarifarioPeriodo' => function ($query) use ($year) {
                    $query->where('periodo', $year)
                        ->select('id', 'tarifario_id', 'valor', 'riesgo', 'valor_fijo');
                },
                'extintores'
            ])
            ->first();
        
        $sbu = Sbu::where('periodo', $year)
            ->first();

        $inspeccionPlanos = null;
        
        if ($procesoPermiso->actualizacion_planos == 1){
            $inspeccionPlanos = Inspeccion::whereHas('procesoPermiso', function ($query) use ($procesoPermiso) {
                $query->where('actividad_economica_id', $procesoPermiso->actividad_economica_id)
                    ->where('tipo_permiso_id', 4)
                    ->where('actualizacion_planos', 0);
            })
            ->where('estado', 'APROBADO')
            ->orderBy('fecha_inspeccion', 'DESC')
            ->first();
        }

        $notaCredito = NotaCredito::where('actividad_economica_id', $procesoPermiso->actividad_economica_id)
        ->first();

        $configuracion = Configuracion::first();

        $porcentajeMulta = $configuracion->activar_mes_cobro_multas <= now()->month ? $configuracion->porcentaje_multas : 0;

        $subtotalInspecciones = Inspeccion::where('proceso_permiso_id', $procesoPermiso->id)
        ->where('id', '!=', $inspeccion->id)
        ->sum('subtotal');

        return inertia('inspecciones/edit', [
            'procesoPermiso' => $procesoPermiso,
            'inspeccion' => $inspeccion,
            'sbu' => optional($sbu)->valor ?? 0,  
            'inspeccionPlanos' => optional($inspeccionPlanos)->valor_inspeccion ?? 0,
            'saldoNotaCredito' => optional($notaCredito)->saldo ?? 0,
            'porcentajeMulta' => $porcentajeMulta,
            'porcentajeReinspeccion' => $procesoPermiso->solicitudInspeccion->tipo_solicitud == 'RE' ? $configuracion->porcentaje_reinspeccion : 0,            
            'subtotalInspecciones' => $subtotalInspecciones,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'GENERADO'),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarInspeccionRequest $request, Inspeccion $inspeccion)
    {
        // Obtener inspector
        $personal = Personal::where('id', Auth::user()->personal?->id)
        ->firstOrFail();

        $firmantes = $inspeccion->firmantes()->count();
        
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $personal, $inspeccion, $firmantes) {
            $inspeccion->update([
                'personal_id' => $personal->id,
                'nombre_personal' => strtoupper($personal->nombre),
                'tipo_funcion' => $request->tipo_funcion,
                'tipo_cons_hormigon' => $request->tipo_cons_hormigon,
                'tipo_cons_metalica' => $request->tipo_cons_metalica,
                'tipo_cons_madera' => $request->tipo_cons_madera,
                'tipo_cons_otros' => $request->tipo_cons_otros,
                'tipo_comb_surtidores' => $request->tipo_comb_surtidores,
                'tipo_comb_diesel' => $request->tipo_comb_diesel,
                'tipo_comb_gasolina' => $request->tipo_comb_gasolina,
                'tipo_comb_cap_diesel' => $request->tipo_comb_cap_diesel,
                'tipo_comb_cap_gasolina' => $request->tipo_comb_cap_gasolina,
                'tipo_comb_transporte' => $request->tipo_comb_transporte,
                'tipo_comb_vehiculo' => $request->tipo_comb_vehiculo,
                'tipo_comb_placas' => $request->tipo_comb_placas,
                'tipo_comb_almacenamiento' => $request->tipo_comb_almacenamiento,
                'tipo_comb_venta' => $request->tipo_comb_venta,
                'tipo_extintor' => $request->tipo_extintor,
                'tipo_comb_extintor' => $request->tipo_comb_extintor,
                'tipo_comb_origen' => $request->tipo_comb_origen,
                'tipo_comb_destino' => $request->tipo_comb_origen,
                'tipo_comb_norma_inen' => $request->tipo_comb_norma_inen,
                'tipo_comb_observaciones' => $request->tipo_comb_observaciones,
                'inst_elec_buenas' => $request->inst_elec_buenas,
                'inst_elec_malas' => $request->inst_elec_malas,
                'inst_elec_internas' => $request->inst_elec_internas,
                'inst_elec_externas' => $request->inst_elec_externas,
                'inst_elec_generador' => $request->inst_elec_generador,
                'inst_elec_transformador' => $request->inst_elec_transformador,
                'vent_natural' => $request->vent_natural,
                'vent_mecanica' => $request->vent_mecanica,
                'vent_adecuada' => $request->vent_adecuada,
                'vent_escasa' => $request->vent_escasa,
                'area1' => $request->area1,
                'area2' => $request->area2,
                'area3' => $request->area3,
                'area4' => $request->area4,
                'area_total' => $validated['area_total'],
                'aforo_personas' => $request->aforo_personas,
                'sist_ince_detectores_humo' => $request->sist_ince_detectores_humo,
                'sist_ince_lamparas_emergencia' => $request->sist_ince_lamparas_emergencia,
                'sist_ince_gabinetes' => $request->sist_ince_gabinetes,
                'sist_ince_sprinklers' => $request->sist_ince_sprinklers,
                'sist_ince_alarma_incendio' => $request->sist_ince_alarma_incendio,
                'sist_ince_bombas_hidraulicas' => $request->sist_ince_bombas_hidraulicas,
                'sist_ince_bombas_impulsion' => $request->sist_ince_bombas_impulsion,
                'sist_ince_escaleras_emergencia' => $request->sist_ince_escaleras_emergencia,
                'sist_ince_puerta_escape' => $request->sist_ince_puerta_escape,
                'sist_ince_puertas_contra_fuego' => $request->sist_ince_puertas_contra_fuego,
                'sist_ince_senalizacion_emergencia' => $request->sist_ince_senalizacion_emergencia,
                'sist_ince_tanques_reserva_agua' => $request->sist_ince_tanques_reserva_agua,
                'sist_ince_espumogeno' => $request->sist_ince_espumogeno,
                'capacitacion_extintores' => $request->capacitacion_extintores,
                'observaciones' => $validated['observaciones'],
                'recomendaciones' => $validated['recomendaciones'],
                'porcentaje_descuento' => $request->porcentaje_descuento,
                'valor_inspeccion' => $request->valor_inspeccion,
                'valor_descuento' => $request->valor_descuento,
                'valor_nota_credito' => $request->valor_nota_credito,
                'valor_multa' => $request->valor_multa,
                'subtotal' => $request->subtotal,
                'valor_total' => $request->valor_total,
                'estado' => $request->estado_informe,
                'exento_pago' => $request->exento_pago,
                'procesado' => $request->estado_informe == 'APROBADO' ? 1 : 0,
                'estado_firma' => $firmantes > 0 ? 'PENDIENTE' : 'SIN_FIRMA'
            ]);

            if (!empty($request->extintores)) {
                $procesoPermiso = $inspeccion->procesoPermiso;

                $idsEnviados = collect($request->extintores)
                    ->pluck('id')
                    ->filter()
                    ->toArray();

                // 🔥 1. ELIMINAR LOS QUE YA NO EXISTEN
                $procesoPermiso->extintores()
                    ->whereNotIn('id', $idsEnviados)
                    ->delete();

                // 🔥 2. CREAR O ACTUALIZAR
                foreach ($request->extintores as $ext) {
                    $procesoPermiso->extintores()->updateOrCreate(
                        [
                            'id' => $ext['id'] ?? null
                        ],
                        [
                            'periodo' => now()->year,
                            'numero' => $ext['numero'],
                            'tipo' => $ext['tipo'],
                            'capacidad' => $ext['capacidad'],
                            'estado' => $ext['estado'],
                        ]
                    );
                }
            }
        });

        return redirect()->route('inspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Informe de inspección actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Inspeccion $inspeccion)
    {
        $inspeccion->firmantes()->delete();
    
        $inspeccion->delete();

        return redirect()->route('inspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Informe de inspección eliminado correctamente');
    }

    public function firmar($id)
    {
        $inspeccion = Inspeccion::findOrFail($id);

        GenerarPdfInspeccionJob::dispatch($inspeccion->id);
    
        return back()->with('success', 'El documento se está firmando en segundo plano');
    }
    
    public function descargar($id)
    {
        $inspeccion = Inspeccion::findOrFail($id);

        $fecha = Carbon::parse($inspeccion->fecha_inspeccion);

        if ($inspeccion->ruta_pdf_firmado != null){    
            $path = storage_path('app/private/' . $inspeccion->ruta_pdf_firmado);

            if (!file_exists($path)) {
                return back()->with('error', 'El informe de inspección no está firmado aún');
            }

            return response()->download(
                $path,
                "Informe_Inspeccion_{$inspeccion->numero_formateado}_{$fecha->year}_firmado.pdf"
            );
        }else{
            $configuracion = Configuracion::first();
            
            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/inspecciones/' . $inspeccion->codigo_verificacion . '/verificar';                    

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($inspeccion->plantilla_id);
            $vista = 'pdf.' . $plantilla->vista_blade;
            
            $pdf = Pdf::loadView($vista, compact('institucion','inspeccion','qrBase64'));

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

            return $pdf->download("Informe_Inspeccion_{$inspeccion->numero_formateado}_{$fecha->year}.pdf"); 
        }
    }

    public function verificar($codigo)
    {
        $inspeccion = Inspeccion::where(
            'codigo_verificacion',
            $codigo
        )->firstOrFail();

        return view('verificacion.inspeccion', compact('inspeccion'));
    }

    public function reenviarCorreo(Inspeccion $inspeccion)
    {
        if (!$inspeccion->ruta_pdf_firmado) {
            return back()->with('error', 'El informe de inspección no está firmado aún');
        }

        EnviarInformeInspeccionJob::dispatch($inspeccion)
            ->onQueue('correos');

        return back()->with('success', 'El correo se está enviando en segundo plano.');
    }

    public function preview($id)
    {
        $configuracion = Configuracion::first();

        $inspeccion = Inspeccion::findOrFail($id);

        $url = rtrim($configuracion->link_verificacion_qr, '/') . '/inspecciones/' . $inspeccion->codigo_verificacion . '/verificar';         

        $qrBase64 = base64_encode(
            (new \Endroid\QrCode\Builder\Builder(
                writer: new \Endroid\QrCode\Writer\PngWriter(),
                data: $url,
                size: 150,
                margin: 10
            ))->build()->getString()
        );

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($inspeccion->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;

        $pdf = Pdf::loadView($vista, compact('institucion','inspeccion','qrBase64'));

        return $pdf->stream('preview.pdf');
    }
}
