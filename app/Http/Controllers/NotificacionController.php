<?php

namespace App\Http\Controllers;

use App\Http\Requests\ValidarBoletaNotificacionRequest;
use Carbon\Carbon;
use App\Models\Inspeccion;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarNotificacionRequest;
use App\Models\Configuracion;
use App\Models\Personal;
use App\Models\Plantilla;
use Illuminate\Support\Facades\Auth;
use App\Models\Institucion;
use App\Models\Notificacion;
use App\Models\ProcesoPermiso;
use Barryvdh\DomPDF\Facade\Pdf;

class NotificacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->integer('year') ?: now()->year;
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null;

        $procesosPermisos = ProcesoPermiso::with([
            'cliente',
            'actividadEconomica.parroquia',
            'tipoPermiso:id,nombre',
            'inspeccionAprobada',
            'notificaciones',
        ])
        ->join('inspecciones as ia', function ($join) {
            $join->on('ia.proceso_permiso_id', '=', 'procesos_permisos.id')
                ->where('ia.estado', 'APROBADO');
        })
        ->when($search, function ($query) use ($search) {
            $query->whereHas('cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->when($estado && $estado !== 'ALL', function ($query) use ($estado) {
            $query->whereHas('notificaciones', fn ($q) => $q->where('estado', $estado));
        })
        ->whereNull('finished_at')
        ->whereHas('inspeccionAprobada', function ($query) use ($year) {
            $query->whereYear('fecha_inspeccion', $year)
                ->whereDate('plazo_permiso', '<', today());
        })
        ->orderBy('ia.fecha_inspeccion')
        ->orderBy('ia.numero')
        ->select('procesos_permisos.*')
        ->withCount('notificaciones')
        ->paginate(10)
        ->withQueryString();  
        
        $roles = Auth::user()->roles->pluck('id');

        return inertia('notificaciones/index', [
            'procesosPermisos' => $procesosPermisos,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'administrador' => $roles->contains(1),
            'supervisor' => $roles->contains(3),
            'inspector' => $roles->contains(4),
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
        // VALIDACIÓN DE SEGURIDAD
        if (!Auth::user()->roles->pluck('id')->intersect([1, 3])->isNotEmpty()) {
            abort(403, 'No autorizado para crear notificaciones.');
        }

        $procesoPermiso->load([
            'cliente.parroquia',
            'actividadEconomica.parroquia',
        ])->loadCount('notificaciones');

        $personales = Personal::whereHas('user.roles', function($query) {
            $query->where('rol_id', 4);
        })->get();

        $ultimoNumero = Notificacion::whereYear('created_at', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        return inertia('notificaciones/create', [
            'procesoPermiso' => $procesoPermiso,
            'personales' => $personales,
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT),
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => $request->input('year', now()->year),
                'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarNotificacionRequest $request)
    {
        $validated = $request->validated();
        
        // Obtener plantilla
        $plantillaId = Plantilla::where('nombre', 'BOLETA NOTIFICACION')
        ->where('predeterminado', 1)
        ->value('id');

        if (!$plantillaId) {
            abort(500, 'No existe plantilla predeterminada para BOLETA NOTIFICACION.');
        }
        
        // Obtener inspector
        $personal = Personal::findOrFail($validated['personal_id']);
        
        // Calcular número de notificación (seguridad)
        $numeroNotificacion = Notificacion::where(
            'proceso_permiso_id',
            $validated['proceso_permiso_id']
        )->count() + 1;

        if ($numeroNotificacion > 3) {
            abort(422, 'Este proceso ya tiene el máximo de notificaciones.');
        }       
        
        Notificacion::create([
            'plantilla_id' => $plantillaId,
            'proceso_permiso_id' => $validated['proceso_permiso_id'],
            'personal_id' => $validated['personal_id'],
            'nombre_personal' => strtoupper($personal->nombre),
            'numero' => $request->numero,
            'numero_notificacion' => $numeroNotificacion,
            'documento_representante_legal' => $validated['documento_representante_legal'],
            'nombre_representante_legal' => $validated['nombre_representante_legal'],
            'observaciones' => $validated['observaciones'],
        ]);

        return redirect()->route('notificaciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
        ])->with('success', 'Notificación creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Notificacion $notificacion)
    {        
        $notificacion->load([
            'procesoPermiso.cliente.parroquia',
            'procesoPermiso.actividadEconomica.parroquia',
            'archivos:id,notificacion_id,nombre,ruta,tipo,size'
        ]);  

        return inertia('notificaciones/show', [
            'notificacion' => $notificacion,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Notificacion $notificacion)
    {
        // VALIDACIÓN DE SEGURIDAD
        if (!Auth::user()->roles->pluck('id')->intersect([1, 3])->isNotEmpty()) {
            abort(403, 'No autorizado para editar notificaciones.');
        }

        $procesoPermiso = $notificacion->procesoPermiso()
        ->with([
            'cliente.parroquia',
            'actividadEconomica.parroquia',
        ])
        ->first();

        $personales = Personal::whereHas('user.roles', function($query) {
            $query->where('rol_id', 4);
        })->get();

        return inertia('notificaciones/edit', [
            'procesoPermiso' => $procesoPermiso,
            'notificacion' => $notificacion,
            'personales' => $personales,      
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarNotificacionRequest $request, Notificacion $notificacion)
    {
        $validated = $request->validated();    

        // Obtener inspector
        $personal = Personal::findOrFail($validated['personal_id']);
        
        $notificacion->update([
            'personal_id' => $validated['personal_id'],
            'nombre_personal' => strtoupper($personal->nombre),
            'documento_representante_legal' => $validated['documento_representante_legal'],
            'nombre_representante_legal' => $validated['nombre_representante_legal'],
            'observaciones' => $validated['observaciones'],
        ]);

        return redirect()->route('notificaciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'PROCESO'),
        ])->with('success', 'Notificación editada correctamente');        
    }

    public function entregar(Request $request, Notificacion $notificacion)
    {
        // VALIDACIÓN DE SEGURIDAD
        if (!Auth::user()->roles->contains('id', 4)) {
            abort(403, 'No autorizado para entregar boletas de notificación.');
        }

        $procesoPermiso = $notificacion->procesoPermiso()
        ->with([
            'cliente.parroquia',
            'actividadEconomica.parroquia',
        ])
        ->first();

        return inertia('notificaciones/boleta', [
            'procesoPermiso' => $procesoPermiso,
            'notificacion' => $notificacion, 
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
                'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
            ],
        ]);
    }

    public function boleta(ValidarBoletaNotificacionRequest $request, Notificacion $notificacion)
    {
        $validated = $request->validated();    

        // Determinar plazo según número de notificación
        switch ($request->numero_notificacion) {
            case 1:
                $dias = Configuracion::value('plazo_primera_notificacion');
                break;
            case 2:
                $dias = Configuracion::value('plazo_segunda_notificacion');
                break;
            default:
                $dias = Configuracion::value('plazo_tercera_notificacion');
                break;
        }
        
        $fecha_plazo = Carbon::now()->addWeekdays($dias);

        $notificacion->update([            
            'documento_representante_legal' => $validated['documento_representante_legal'],
            'nombre_representante_legal' => $validated['nombre_representante_legal'],
            'documento_persona_recibe' => $validated['documento_persona_recibe'],
            'nombre_persona_recibe' => $validated['nombre_persona_recibe'],
            'fecha_entrega' => now(),
            'fecha_plazo' => $fecha_plazo,
            'observaciones' => $validated['observaciones'],
            'estado' => 'ENTREGADO'
        ]);

        return redirect()->route('notificaciones.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
        ])->with('success', 'Boleta entregada correctamente');        
    }

    public function descargar($id)
    {
        $notificacion = Notificacion::findOrFail($id);

        $fecha = Carbon::parse($notificacion->fecha_entrega);

        if ($notificacion->ruta_pdf != null){
            $path = storage_path('app/private/' . $notificacion->ruta_pdf);

            if (!file_exists($path)) {
                return back()->with('error', 'Archivo no encontrado');
            }

            return response()->download(
                $path,
                "Boleta_Notificacion_{$notificacion->numero_formateado}_{$fecha->year}_firmado.pdf"
            );
        }else{
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($notificacion->plantilla_id);
            $vista = 'pdf.' . $plantilla->vista_blade;
            
            $pdf = Pdf::loadView($vista, compact('institucion','notificacion'));

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
           
            return $pdf->download("Boleta_Notificacion_{$notificacion->numero_formateado}_{$fecha->year}.pdf");
        }
    }

    public function preview($id)
    {
        $notificacion = Notificacion::findOrFail($id);

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($notificacion->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;

        $pdf = Pdf::loadView($vista, compact('institucion','notificacion'));

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
