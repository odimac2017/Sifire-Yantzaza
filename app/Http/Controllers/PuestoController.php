<?php

namespace App\Http\Controllers;

use App\Models\Puesto;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarPuestoRequest;

use function Ramsey\Uuid\v1;

class PuestoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $puestos = Puesto::query()
        ->when($search, function ($query) use ($search) {
            $query->where('nombre', 'like', "%{$search}%");
        })
        ->orderBy('nombre')
        ->paginate(10)
        ->withQueryString();

        return inertia('puestos/index', [
            'puestos' => $puestos,
            'filters' => [
                'search' => $search
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        return inertia('puestos/create', [
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarPuestoRequest $request)
    {
        $validated = $request->validated();

        Puesto::create($validated);

        return redirect()->route('puestos.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Puesto creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Puesto $puesto)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Puesto $puesto)
    {
        return inertia('puestos/edit', [
            'puesto' => $puesto,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarPuestoRequest $request, Puesto $puesto)
    {
        $validated = $request->validated();

        $puesto->update($validated);

        return redirect()->route('puestos.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Puesto actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Puesto $puesto)
    {
        //
    }
}
