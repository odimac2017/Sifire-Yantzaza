<?php

namespace App\Http\Controllers;

use App\Models\ParteEmergencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\ValidarParteEmergenciaRequest;
use App\Models\CategoriaEmergencia;
use App\Models\Institucion;
use App\Models\Personal;
use App\Models\PersonalPuesto;
use App\Models\Plantilla;
use App\Models\Provincia;
use App\Services\MapaService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class ParteEmergenciaController extends Controller
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

        $partesEmergencias = ParteEmergencia::with([
            'parroquia:id,nombre',
            'personal.user:id,avatar'
        ])
        ->when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                  ->orWhere('categoria1', 'like', "%{$search}%")
                  ->orWhere('categoria2', 'like', "%{$search}%");
            });
        })
        ->whereYear('fecha_salida', $year)
        ->orderByRaw('CAST(numero AS UNSIGNED)')
        ->paginate(10)
        ->withQueryString();
        
        return inertia('partesEmergencias/index', [
            'partesEmergencias' => $partesEmergencias,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'filters' => [
                'search' => $search,
                'year' => $year,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {   
        $coordenadas = Institucion::select('latitud','longitud')
        ->first();

        $categorias = CategoriaEmergencia::with('childrens')
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

        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        $personales = Personal::with('titulo')
        ->where('estado', 'ACTIVO')
        ->orderBy('apellidos')
        ->orderBy('nombres')
        ->get()
        ->map(fn ($p) => [
            'id' => $p->id,
            'nombre' => strtoupper($p->nombre)
        ]);        

        $personalesPuestos = PersonalPuesto::with(['personal.titulo', 'puesto'])
        ->whereHas('personal', function ($q) {
            $q->where('estado', 'ACTIVO');
        })
        ->where('predeterminado', 1)
        ->join('personal', 'personal.id', 'personal_puestos.personal_id')
        ->orderBy('personal.apellidos')
        ->orderBy('personal.nombres')
        ->select('personal_puestos.*')
        ->get()
        ->map(function ($pp) {
            return [
                'id' => $pp->id,
                'nombre' => strtoupper(trim("{$pp->personal->nombre}, {$pp->puesto->nombre}")),
            ];
        });

        $ultimoNumero = ParteEmergencia::whereYear('fecha_salida', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        return inertia('partesEmergencias/create', [
            'coordenadas' => $coordenadas,
            'categorias' => $categorias,
            'provincias' => $provincias,
            'personales' => $personales,
            'personalesPuestos' => $personalesPuestos,
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT),
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarParteEmergenciaRequest $request, MapaService $mapaService)
    {
        $plantillaId = Plantilla::where('nombre', 'PARTE DE EMERGENCIA')
        ->where('predeterminado', 1)
        ->value('id');

        $categoriaEmergencia = CategoriaEmergencia::with('parent')
        ->findOrFail($request->categoria_id);

        $personalPuesto = PersonalPuesto::with(['personal.titulo','puesto'])
        ->where('personal_id', Auth::user()->personal->id)
        ->where('predeterminado', 1)
        ->firstOrFail();

        $personalPuestoOficial = PersonalPuesto::with(['personal.titulo','puesto'])
        ->findOrFail($request->personal_puesto_oficial_id);

        $validated = $request->validated();

        // Agregar campos automáticos
        $validated['plantilla_id'] = $plantillaId;
        $validated['personal_id'] = Auth::user()->personal->id;
        $validated['personal_puesto_id'] = $personalPuesto->id;
        $validated['categoria1'] = strtoupper($categoriaEmergencia->parent->nombre);
        $validated['categoria2'] = strtoupper($categoriaEmergencia->nombre);        
        $validated['nombre_personal'] = strtoupper($personalPuesto->personal->nombre);
        $validated['puesto_personal'] = strtoupper($personalPuesto->puesto->nombre);
        $validated['nombre_oficial'] = strtoupper($personalPuestoOficial->personal->nombre);
        $validated['puesto_oficial'] = strtoupper($personalPuestoOficial->puesto->nombre);
        $validated['numero'] = $request->numero;
        $validated['ruta_mapa'] = null; 

        if (!empty($validated['latitud']) && !empty($validated['longitud'])) {
            $rutaMapa = $mapaService->generarMapa(
                $validated['latitud'],
                $validated['longitud']
            );
            $validated['ruta_mapa'] = $rutaMapa;
        }
        
        // Crear parte
        $parteEmergencia = ParteEmergencia::create($validated);

        // Guardar personal QAP
        if (!empty($validated['personalesQap'])) {
            $personales = Personal::whereIn('id', $validated['personalesQap'])
                ->get()
                ->keyBy('id');

            $attachData = [];

            foreach ($validated['personalesQap'] as $id) {
                $attachData[$id] = [
                    'nombre_personal' => $personales[$id]->nombre ?? null,
                ];
            }

            $parteEmergencia->personalesQap()->attach($attachData);
        }

        return redirect()->route('partesemergencias.index', [
           'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Parte de emergencia creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ParteEmergencia $parteEmergencia)
    {        
        $parteEmergencia->load([
            'parroquia',
            'archivos:id,parte_emergencia_id,nombre,ruta,tipo,size'
        ]);        

        return inertia('partesEmergencias/show', [
            'parteEmergencia' => $parteEmergencia,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, ParteEmergencia $parteEmergencia)
    {
        // 👇 VALIDACIÓN DE SEGURIDAD
        if ($parteEmergencia->personal_id != Auth::user()->personal->id) {
            abort(403, 'No autorizado para editar este parte de emergencia.');
        }

        $categorias = CategoriaEmergencia::with('parent')
        ->whereNotNull('parent_id')
        ->orderBy('parent_id')
        ->orderBy('nombre')
        ->get()
        ->map(function ($categoria) {
            return [
                'id' => $categoria->id,
                'nombre' => $categoria->parent->nombre . ' - ' . $categoria->nombre,
            ];
        });

        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        $personales = Personal::with('titulo')
        ->where('estado', 'ACTIVO')
        ->orderBy('apellidos')
        ->orderBy('nombres')
        ->get()
        ->map(fn ($p) => [
            'id' => $p->id,
            'nombre' => strtoupper($p->nombre)
        ]);

        $personalesPuestos = PersonalPuesto::with(['personal.titulo', 'puesto'])
        ->where('personal_id', '!=', Auth::user()->personal->id)
        ->whereHas('personal', function ($q) {
            $q->where('estado', 'ACTIVO');
        })
        ->where('predeterminado', 1)
        ->join('personal', 'personal.id', 'personal_puestos.personal_id')
        ->orderBy('personal.apellidos')
        ->orderBy('personal.nombres')
        ->select('personal_puestos.*')
        ->get()
        ->map(function ($pp) {
            return [
                'id' => $pp->id,
                'nombre' => strtoupper(trim("{$pp->personal->nombre}, {$pp->puesto->nombre}")),
            ];
        });

        $personalesQap = $parteEmergencia->personalesQap
        ->pluck('id');

        return inertia('partesEmergencias/edit', [
            'categorias' => $categorias,
            'provincias' => $provincias,
            'personales' => $personales,
            'personalesPuestos' => $personalesPuestos,
            'parteEmergencia' => $parteEmergencia,
            'personalesQap' => $personalesQap,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarParteEmergenciaRequest $request, ParteEmergencia $parteEmergencia, MapaService $mapaService)
    {
        $plantillaId = Plantilla::where('nombre', 'PARTE DE EMERGENCIA')
        ->where('predeterminado', 1)
        ->value('id');

        $categoriaEmergencia = CategoriaEmergencia::with('parent')
        ->findOrFail($request->categoria_id);

        $personalPuesto = PersonalPuesto::with(['personal.titulo','puesto'])
        ->where('personal_id', Auth::user()->personal->id)
        ->where('predeterminado', 1)
        ->firstOrFail();       

        $personalPuestoOficial = PersonalPuesto::with(['personal.titulo','puesto'])
        ->findOrFail($request->personal_puesto_oficial_id);

        $validated = $request->validated();

        // Agregar campos automáticos   
        $validated['plantilla_id'] = $plantillaId;     
        $validated['personal_id'] = Auth::user()->personal->id;
        $validated['personal_puesto_id'] = $personalPuesto->id;
        $validated['categoria1'] = strtoupper($categoriaEmergencia->parent->nombre);
        $validated['categoria2'] = strtoupper($categoriaEmergencia->nombre);        
        $validated['nombre_personal'] = strtoupper($personalPuesto->personal->nombre);
        $validated['puesto_personal'] = strtoupper($personalPuesto->puesto->nombre);
        $validated['nombre_oficial'] = strtoupper($personalPuestoOficial->personal->nombre);
        $validated['puesto_oficial'] = strtoupper($personalPuestoOficial->puesto->nombre);
        $validated['ruta_mapa'] = null;

        if (!empty($validated['e_latitud']) && !empty($validated['e_longitud'])) {
            // Eliminar mapa anterior si existe
            if ($parteEmergencia->ruta_mapa) {
                $rutaAnterior = str_replace('storage/', '', $parteEmergencia->ruta_mapa);

                if (Storage::disk('public')->exists($rutaAnterior)) {
                    Storage::disk('public')->delete($rutaAnterior);
                }
            }

            // generar nuevo mapa
            $rutaMapa = $mapaService->generarMapa(
                $validated['latitud'],
                $validated['longitud']
            );
            $validated['ruta_mapa'] = $rutaMapa;
        }

        $parteEmergencia->update($validated);

        $personales = Personal::whereIn('id', $validated['personalesQap'] ?? [])
        ->get()
        ->keyBy('id');

        $parteEmergencia->personalesQap()->sync(
            collect($validated['personalesQap'] ?? [])
                ->mapWithKeys(fn ($id) => [
                    $id => ['nombre_personal' => $personales[$id]->nombre ?? null]
                ])
        );

        return redirect()->route('partesemergencias.index', [
           'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Parte de emergencia actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ParteEmergencia $parteEmergencia)
    {
        //
    }

    public function descargar($id)
    {
        $parteEmergencia = ParteEmergencia::findOrFail($id);

        $fecha = Carbon::parse($parteEmergencia->created_at);
        
        if ($parteEmergencia->ruta_pdf != null){
            $path = storage_path('app/private/' . $parteEmergencia->ruta_pdf);

            if (!file_exists($path)) {
                return back()->with('error', 'Archivo no encontrado');
            }

            return response()->download(
                $path,
                "Parte_Emergencia_{$parteEmergencia->numero}_{$fecha->year}.pdf"
            );
        }else{  
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($parteEmergencia->plantilla_id);
            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','parteEmergencia'));

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

            return $pdf->download("Parte_Emergencia_{$parteEmergencia->numero}_{$fecha->year}.pdf");     
        }
    }

    public function preview($id)
    {
        $parte = ParteEmergencia::findOrFail($id);

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($parte->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;

        if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {

            $pdf = Pdf::loadView($vista, compact('institucion','parte'))
                ->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');

        } else {

            $pdf = Pdf::loadView($vista, compact('institucion','parte'))
                ->setPaper([
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

        return $pdf->stream('preview.pdf');
    }
}
