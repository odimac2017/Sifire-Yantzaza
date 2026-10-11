<?php

namespace App\Http\Controllers;

use App\Models\Plantilla;
use App\Http\Requests\ValidarPlantillaRequest;
use App\Models\Personal;
use App\Models\PersonalPlantilla;
use Illuminate\Http\Request;

class PlantillaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $plantillas = Plantilla::query()
        ->when($search, function ($query) use ($search) {
            $query->where('nombre', 'like', "%{$search}%");
        })
        ->orderby('nombre')
        ->paginate(10)
        ->withQueryString();

        return inertia('plantillas/index', [
            'plantillas' => $plantillas,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Plantilla $plantilla)
    {
        $personales = Personal::with('puestoPredeterminado.puesto')
        ->where('estado', 'ACTIVO')
        ->get();

        $plantilla->load([
            'personalPlantilla.firmante'
        ]);
    
        return inertia('plantillas/edit', [
            'personales' => $personales, 
            'plantilla' => $plantilla,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateFirmantes(ValidarPlantillaRequest $request)
    {
        $validated = $request->validated();

        $ultimoOrden = PersonalPlantilla::where('plantilla_id', $validated['plantilla_id'])
            ->max('orden_firma');

        $validated['orden_firma'] = ($ultimoOrden ?? 0) + 1;

        PersonalPlantilla::create($validated);

        return back()->with('success','Firmante agregado correctamente');
    }
}
