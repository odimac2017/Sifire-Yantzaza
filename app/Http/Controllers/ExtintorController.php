<?php

namespace App\Http\Controllers;

use App\Models\Extintor;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarExtintorRequest;
use Illuminate\Support\Facades\DB;

class ExtintorController extends Controller
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

        $extintores = Extintor::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica.parroquia',
            'procesoPermiso.inspeccion'
        ])
        ->when($search, function ($query) use ($search) {
            $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        })
        ->where('extintores.periodo', $year)
        ->orderBy('extintores.numero')
        ->paginate(10)
        ->withQueryString();

        return inertia('extintores/index', [
            'extintores' => $extintores,
            'filters' => [
                'search' => $search,
                'year' => $year,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Extintor $extintor)
    {
        return inertia('extintores/edit', [
            'extintor' => $extintor,
            'filters' => [
                'search' => trim($request->input('search', '')),
                'year' => (int) $request->input('year', now()->year),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarExtintorRequest $request, Extintor $extintor)
    {
        $validated = $request->validated();

        $extintor->update($validated);

        return redirect()->route('extintores.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Extintor actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function generar()
    {
        $ultimoNumero = Extintor::where('periodo', now()->year)
        ->max('numero');

        $numero = $ultimoNumero ? $ultimoNumero + 1 : 1;

        return response()->json([
            'numero' => str_pad($numero,7,'0',STR_PAD_LEFT)
        ]);
    }
}
