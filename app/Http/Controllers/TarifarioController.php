<?php

namespace App\Http\Controllers;

use App\Models\Tarifario;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarTarifarioRequest;

class TarifarioController extends Controller
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

        $tarifarios = Tarifario::query()
        ->with([
            'childrens' => function ($childQuery) use ($year) {
                $childQuery->with([
                    'tarifarioPeriodo' => function ($periodoQuery) use ($year) {
                        $periodoQuery
                            ->select('id', 'tarifario_id', 'valor', 'gl', 'cat', 'riesgo', 'valor_fijo')
                            ->where('periodo', $year);
                    },
                ]);
            },
        ])
        ->whereNull('parent_id')
        ->when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                // Buscar en tarifario padre
                $q->where('codigo', 'LIKE', "%{$search}%")
                ->orWhere('nombre', 'LIKE', "%{$search}%");

                // Buscar en tarifarios hijos
                $q->orWhereHas('childrens', function ($childQ) use ($search) {
                    $childQ->where('codigo', 'LIKE', "%{$search}%")
                    ->orWhere('nombre', 'LIKE', "%{$search}%");
                });
            });
        })
        ->orderBy('codigo')
        ->paginate(10)
        ->withQueryString();

        return inertia('tarifarios/index', [
            'tarifarios' => $tarifarios,
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
        $principales = Tarifario::select('id','nombre')        
        ->whereNull('parent_id')
        ->orderBy('nombre')
        ->get();

        return inertia('tarifarios/create', [
            'principales' => $principales,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarTarifarioRequest $request)
    {
        $validated = $request->validated();

        Tarifario::create($validated);

        return redirect()->route('tarifarios.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Tarifario creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tarifario $tarifario)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Tarifario $tarifario)
    {
        $principales = Tarifario::select('id','nombre')        
        ->whereNull('parent_id')
        ->orderBy('nombre')
        ->get();

        return inertia('tarifarios/edit', [
            'principales' => $principales,
            'tarifario' => $tarifario,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarTarifarioRequest $request, Tarifario $tarifario)
    {
        $validated = $request->validated();

        $tarifario->update($validated);

        return redirect()->route('tarifarios.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Tarifario actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tarifario $tarifario)
    {
        //
    }
}
