<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Documento;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarClienteRequest;
use App\Models\ActividadEconomica;
use App\Models\Catastro;
use App\Models\Provincia;
use App\Models\TipoCliente;

class ClienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $clientes = Cliente::with([
            'parroquia:id,nombre'
        ])
        ->withCount('actividadesEconomicas')
        ->withCount('catastros')
        ->when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('clientes.documento', 'like', "%{$search}%")
                ->orWhere('clientes.nombre', 'like', "%{$search}%");
            });
        })
        ->orderby('clientes.nombre')
        ->paginate(10)
        ->withQueryString();

        return inertia('clientes/index', [
            'clientes' => $clientes,
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
        $documentos = Documento::select('id','nombre')
        ->get();

        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        $tipoCliente = TipoCliente::select('id','nombre')
        ->get();

        return inertia('clientes/create', [
            'documentos' => $documentos,
            'provincias' => $provincias,
            'tipoCliente' => $tipoCliente,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarClienteRequest $request)
    {
        $validated = $request->validated();

        Cliente::create($validated);

        return redirect()->route('clientes.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Cliente creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Cliente $cliente)
    {
        $cliente->load([
            'parroquia:id,nombre'
        ]);

        $actividadesEconomicas = ActividadEconomica::with([
            'parroquia:id,nombre'
        ])
        ->withCount('procesosPermisos')
        ->where('cliente_id', $cliente->id)
        ->orderBy('actividades_economicas.tipo_actividad')
        ->orderBy('actividades_economicas.fecha_inicio')
        ->get();

        return inertia('clientes/show', [
            'actividadesEconomicas' => $actividadesEconomicas,
            'cliente' => $cliente,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    public function catastro(Request $request, Cliente $cliente)
    {
        $cliente->load([
            'parroquia:id,nombre'
        ]);

        $catastros = Catastro::with([
            'parroquia:id,nombre'
        ])
        ->where('cliente_id', $cliente->id)
        ->orderBy('periodo')
        ->orderBy('clave_catastral')
        ->get();

        return inertia('clientes/catastro', [
            'catastros' => $catastros,
            'cliente' => $cliente,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Cliente $cliente)
    {
        $documentos = Documento::select('id','nombre')
        ->get();

        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        $tipoCliente = TipoCliente::select('id','nombre')
        ->get();
        
        return inertia('clientes/edit', [
            'documentos' => $documentos,
            'provincias' => $provincias,
            'tipoCliente' => $tipoCliente,
            'cliente' => $cliente,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarClienteRequest $request, Cliente $cliente)
    {
        $validated = $request->validated();

        $cliente->update($validated);

        return redirect()->route('clientes.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Cliente actualizado correctamente');
    }

    public function inactivar(Request $request, Cliente $cliente)
    {
        $cliente->update([
            'estado' => 'INACTIVO'
        ]);

        return redirect()->route('clientes.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Cliente inactivado correctamente');
    }

    public function reactivar(Request $request, Cliente $cliente)
    {
        $cliente->update([
            'estado' => 'ACTIVO'
        ]);

        return redirect()->route('clientes.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Cliente reactivado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Cliente $cliente)
    {
        $cliente->delete();

        return redirect()->route('clientes.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Cliente eliminado correctamente');
    }
}
