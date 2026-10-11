<?php

namespace App\Http\Controllers;

use App\Models\CategoriaEmergencia;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarCategoriaEmergenciaRequest;

class CategoriaEmergenciaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $categorias = CategoriaEmergencia::with(['childrens:id,parent_id,codigo,nombre'])
        ->whereNull('parent_id')
        ->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                // Buscar en la categoría padre
                $q->where('codigo', 'LIKE', "%{$search}%")
                    ->orWhere('nombre', 'LIKE', "%{$search}%");

                // Buscar en las categorías hijas
                $q->orWhereHas('childrens', function ($childQuery) use ($search) {
                    $childQuery->where('codigo', 'LIKE', "%{$search}%")
                        ->orWhere('nombre', 'LIKE', "%{$search}%");
                });
            });
        })
        ->orderBy('nombre')
        ->paginate(10)
        ->withQueryString();

        return inertia('categoriasEmergencias/index', [
            'categorias' => $categorias,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $principales = CategoriaEmergencia::select('id','nombre')        
        ->whereNull('parent_id')
        ->orderBy('nombre')
        ->get();

        return inertia('categoriasEmergencias/create', [
            'principales' => $principales,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarCategoriaEmergenciaRequest $request)
    {
        $validated = $request->validated();

        CategoriaEmergencia::create($validated);

        return redirect()->route('categoriasEmergencias.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Categoría creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(CategoriaEmergencia $categoriaEmergencia)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, CategoriaEmergencia $categoriaEmergencia)
    {
        $principales = CategoriaEmergencia::select('id','nombre')        
        ->whereNull('parent_id')
        ->orderBy('nombre')
        ->get();

        return inertia('categoriasEmergencias/edit', [
            'principales' => $principales,
            'categoria' => $categoriaEmergencia,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarCategoriaEmergenciaRequest $request, CategoriaEmergencia $categoriaEmergencia)
    {
        $validated = $request->validated();

        $categoriaEmergencia->update($validated);

        return redirect()->route('categoriasEmergencias.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Categoría actualizada correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategoriaEmergencia $categoriaEmergencia)
    {
        //
    }
}
