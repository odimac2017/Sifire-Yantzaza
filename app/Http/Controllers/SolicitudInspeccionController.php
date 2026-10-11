<?php

namespace App\Http\Controllers;

use App\Models\SolicitudInspeccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ValidarSolicitudInspeccionRequest;
use App\Models\ActividadEconomica;
use App\Models\Cliente;
use App\Models\Inspeccion;
use App\Models\Institucion;
use App\Models\Personal;
use App\Models\Plantilla;
use App\Models\ProcesoPermiso;
use App\Models\Tarifario;
use App\Models\TipoInspeccionRequisito;
use App\Models\TipoPermiso;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class SolicitudInspeccionController extends Controller
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
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'GENERADO') : null;          

        $solicitudesInspecciones = SolicitudInspeccion::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica.parroquia',
            'procesoPermiso.tipoPermiso:id,nombre',
        ])
        ->when($search, function ($query) use ($search) {
            $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->whereYear('fecha_solicitud', $year)  
        ->when($estado, function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->orderby('fecha_solicitud')
        ->orderby('numero')
        ->paginate(10)
        ->withQueryString();

        return inertia('solicitudesInspecciones/index', [
            'solicitudesInspecciones' => $solicitudesInspecciones,
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
    public function create(Request $request)
    {        
        $searchCliente = trim($request->input('searchCliente', ''));

        $cliente = null;

        $tiposPermisos = TipoPermiso::select('id','nombre')
        ->where('estado', 'ACTIVO')
        ->get();

        $tarifarios = Tarifario::with('childrens')
        ->whereNull('parent_id')
        ->get()
        ->map(function ($parent) {
            return [
                'label' => $parent->nombre,
                'options' => $parent->childrens->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'nombre' => $child->nombre
                    ];
                })->values()
            ];
        });

        $personales = Personal::whereHas('user.roles', function($query) {
            $query->where('rol_id', 4);
        })->get();

        $ultimoNumero = SolicitudInspeccion::whereYear('fecha_solicitud', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        if ($searchCliente) {

            $cliente = Cliente::with(['parroquia'])
                ->where('documento', $searchCliente)
                ->first();

            if ($cliente) {
                $actividadesEconomicas = $cliente->actividadesEconomicas()
                ->where('estado', 'ACTIVO')
                ->with('parroquia')
                ->get();

                $cliente->actividades_economicas = $actividadesEconomicas;
            }
        }

        return inertia('solicitudesInspecciones/create', [
            'cliente' => $cliente,
            'tiposPermisos' => $tiposPermisos,
            'tarifarios' => $tarifarios,
            'personales' => $personales,
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT),
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->input('estado', 'GENERADO'),
            ],
        ]);
    }

    public function sugerirInspector(Request $request)
    {
        $fecha = $request->fecha;
        $limite = 30;

        $inspectores = Personal::with('user')
        ->select(
            'personal.id',
            'personal.user_id',
            DB::raw('COUNT(solicitudes_inspecciones.id) as total')
        )
        ->leftJoin('solicitudes_inspecciones', function ($join) use ($fecha) {
            $join->on('personal.id', '=', 'solicitudes_inspecciones.personal_id')
                ->whereDate('solicitudes_inspecciones.fecha_inspeccion', $fecha);
        })
        ->groupBy('personal.id', 'personal.user_id')
        ->having('total', '<', $limite)
        ->orderBy('total', 'asc')
        ->get();

        if ($inspectores->isEmpty()) {
            return response()->json(null);
        }

        $min = $inspectores->min('total');

        $inspector = $inspectores
        ->where('total', $min)
        ->random();

        return response()->json([
            'id' => $inspector->id,
            'nombre' => $inspector->nombre,
            'total' => $inspector->total,
            'limite' => $limite
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarSolicitudInspeccionRequest $request)
    {
        // Obtener plantilla
        $plantillaId = Plantilla::where('nombre', 'SOLICITUD DE INSPECCION')
        ->where('predeterminado', 1)
        ->value('id');

        if (!$plantillaId) {
            abort(500, 'No existe plantilla predeterminada para SOLICITUD DE INSPECCION.');
        }
        
        // Obtener inspector
        $personal = Personal::findOrFail($request->personal_id);
        
        $validated = $request->validated();

        $solicitudInspeccion = null;

        DB::transaction(function () use ($validated, $plantillaId, $personal, &$solicitudInspeccion, $request) {
            $procesoPermiso = ProcesoPermiso::create([
                'cliente_id' => $validated['cliente_id'],
                'actividad_economica_id' => $validated['actividad_economica_id'],
                'tipo_permiso_id' => $validated['tipo_permiso_id'],
                'tarifario_id' => $validated['tarifario_id'],
                'actualizacion_planos' => $validated['actualizacion_planos'],
            ]);
        
            $solicitudInspeccion = SolicitudInspeccion::create([
                'plantilla_id' => $plantillaId,
                'proceso_permiso_id' => $procesoPermiso->id,
                'personal_id' => $validated['personal_id'],
                'nombre_personal' => strtoupper($personal->nombre),
                'numero' => $request->numero,
                'fecha_solicitud' => now(),
                'fecha_inspeccion' => $validated['fecha_inspeccion'],
                'observaciones' => $validated['observaciones'],
            ]);

            // Actualizar fecha_inicio de la actividad económica
            ActividadEconomica::where('id', $validated['actividad_economica_id'])
                ->update([
                    'fecha_inicio' => $validated['fecha_inicio']
                ]);
        });

        return redirect()->route('solicitudesinspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Solicitud de inspección creada correctamente');
    }

    public function generarreinspeccion(Request $request, Inspeccion $inspeccion)
    {
        $procesoPermisoId = $inspeccion->proceso_permiso_id; 
    
        // Obtener plantilla
        $plantillaId = Plantilla::where('nombre', 'SOLICITUD DE INSPECCION')
        ->where('predeterminado', 1)
        ->value('id');

        $ultimoNumero = SolicitudInspeccion::whereYear('fecha_solicitud', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        $solicitudInspeccion = null;

        DB::transaction(function () use ($procesoPermisoId, $plantillaId, &$solicitudInspeccion, $inspeccion, $numero) {
            // ✅ Validar que no exista otra solicitud activa
            $existe = SolicitudInspeccion::where('proceso_permiso_id', $procesoPermisoId)
                ->where('estado', 'GENERADO')
                ->where('tipo_solicitud', 'RE')
                ->exists();

            if ($existe) {
                throw new \Exception('Ya existe una solicitud de reinspección generada.');
            }

            $solicitudInspeccion = SolicitudInspeccion::create([
                'plantilla_id' => $plantillaId,
                'proceso_permiso_id' => $procesoPermisoId,
                'personal_id' => $inspeccion->personal_id,
                'nombre_personal' => $inspeccion->nombre_personal,
                'tipo_solicitud' => 'RE',
                'numero' => $numero,
                'fecha_solicitud' => now(),
                'fecha_inspeccion' => now(),
                'observaciones' => '',
            ]);

            Inspeccion::where('id', $inspeccion->id)
            ->update(['procesado' => 1]);
        });

        return redirect()->route('inspecciones.novedades', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year)
        ])->with('success', 'Solicitud de reinspección creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, SolicitudInspeccion $solicitudInspeccion)
    {
        $solicitudInspeccion->load([
            'procesoPermiso.cliente.parroquia:id,nombre',
            'procesoPermiso.actividadEconomica.parroquia:id,nombre',
            'procesoPermiso.tipoPermiso:id,tipo_inspeccion_id,nombre',
            'procesoPermiso.requisitos:id,proceso_permiso_id,tipo_inspeccion_requisito_id,nombre,ruta,tipo,size',
            'procesoPermiso.requisitos.requisito:id,nombre',
            // tarifario padre
            'procesoPermiso.tarifario.parent:id,nombre',
            // tarifario hijo
            'procesoPermiso.tarifario:id,nombre,parent_id',
        ]);
        
        $tipoInspeccionId = $solicitudInspeccion
        ->procesoPermiso
        ->tipoPermiso
        ->tipo_inspeccion_id;

        $tiposInspeccionesRequisitos = TipoInspeccionRequisito::select('id','nombre')
        ->where('tipo_inspeccion_id', $tipoInspeccionId)
        ->where('estado', 'ACTIVO')
        ->orderBy('nombre')
        ->get();

        return inertia('solicitudesInspecciones/show', [
            'tiposInspeccionesRequisitos' => $tiposInspeccionesRequisitos,
            'solicitudInspeccion' => $solicitudInspeccion,
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
    public function edit(Request $request, SolicitudInspeccion $solicitudInspeccion)
    {
        $tiposPermisos = TipoPermiso::select('id','nombre')
        ->where('estado', 'ACTIVO')
        ->get();

        $tarifarios = Tarifario::with('childrens')
        ->whereNull('parent_id')
        ->get()
        ->map(function ($parent) {
            return [
                'label' => $parent->nombre,
                'options' => $parent->childrens->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'nombre' => $child->nombre
                    ];
                })->values()
            ];
        });

        $personales = Personal::whereHas('user.roles', function($query) {
            $query->where('rol_id', 4);
        })->get();

        $procesoPermiso = $solicitudInspeccion->procesoPermiso()
            ->with([
                'cliente.parroquia',
                'actividadEconomica.parroquia',
            ])
            ->first();

        return inertia('solicitudesInspecciones/edit', [
            'tiposPermisos' => $tiposPermisos,
            'tarifarios' => $tarifarios,
            'personales' => $personales,
            'procesoPermiso' => $procesoPermiso,
            'solicitudInspeccion' => $solicitudInspeccion,        
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
    public function update(ValidarSolicitudInspeccionRequest $request, SolicitudInspeccion $solicitudInspeccion)
    {
        // Obtener inspector
        $personal = Personal::findOrFail($request->personal_id);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $solicitudInspeccion, $personal) {
            $solicitudInspeccion->procesoPermiso->update([
                'tipo_permiso_id' => $validated['tipo_permiso_id'],
                'tarifario_id' => $validated['tarifario_id'],
                'actualizacion_planos' => $validated['actualizacion_planos'],
            ]);

            $solicitudInspeccion->update([
                'personal_id' => $validated['personal_id'],
                'nombre_personal' => strtoupper($personal->nombre),
                'fecha_inspeccion' => $validated['fecha_inspeccion'],
                'observaciones' => $validated['observaciones'],
                'ruta_pdf' => null
            ]);

            // Actualizar fecha_inicio de la actividad económica
            $solicitudInspeccion->procesoPermiso->actividadEconomica->update([
                'fecha_inicio' => $validated['fecha_inicio']
            ]);
        });

        return redirect()->route('solicitudesinspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Solicitud de inspección actualizada correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, SolicitudInspeccion $solicitudInspeccion)
    {
        if ($solicitudInspeccion->estado !== 'GENERADO') {
            return back()->with('error', 'Solo se pueden eliminar solicitudes de inspección en estado GENERADO.');
        }

        DB::transaction(function () use ($solicitudInspeccion) {

            $proceso = $solicitudInspeccion->procesoPermiso;

            $solicitudInspeccion->delete();
    
            if ($proceso) {
                $proceso->delete();
            }
    
        });

       return redirect()->route('solicitudesinspecciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Solicitud de inspección eliminada correctamente');
    }

    public function descargar($id)
    {
        $solicitudInspeccion = SolicitudInspeccion::findOrFail($id);

        $fecha = Carbon::parse($solicitudInspeccion->fecha_solicitud);
/*
        if ($solicitudInspeccion->ruta_pdf != null){
            $path = storage_path('app/private/' . $solicitudInspeccion->ruta_pdf);

            if (!file_exists($path)) {
                return back()->with('error', 'Archivo no encontrado');
            }

            return response()->download(
                $path,
                "Solicitud_Inspeccion_{$solicitudInspeccion->numero_formateado}_{$fecha->year}.pdf"
            );
        }else{*/
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($solicitudInspeccion->plantilla_id);
            $vista = 'pdf.' . $plantilla->vista_blade;
            
            $pdf = Pdf::loadView($vista, compact('institucion','solicitudInspeccion'));

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

            $pdf->render();

            $dompdf = $pdf->getDomPDF();
            $canvas = $dompdf->getCanvas();
            $fontMetrics = $dompdf->getFontMetrics();

            $fontNormal = $fontMetrics->getFont("Roboto", "normal");

            $canvas->page_text(510, 800, "Página {PAGE_NUM} de {PAGE_COUNT}", $fontNormal, 8, [0,0,0]);

            return $pdf->download("Solicitud_Inspeccion_{$solicitudInspeccion->numero_formateado}_{$fecha->year}.pdf"); 
       // }
    }

    public function preview($id)
    {
        $solicitudInspeccion = SolicitudInspeccion::findOrFail($id);

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($solicitudInspeccion->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;

        $pdf = Pdf::loadView($vista, compact('institucion','solicitudInspeccion'));

        return $pdf->stream('preview.pdf');
    }
}
