<?php

namespace App\Http\Controllers;

use App\Models\ActividadEconomica;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarActividadEconomicaRequest;
use App\Models\Cliente;
use App\Models\Inspeccion;
use App\Models\Institucion;
use App\Models\Notificacion;
use App\Models\PermisoFuncionamiento;
use App\Models\Provincia;
use App\Services\MapaService;
use Illuminate\Support\Facades\Storage;

class ActividadEconomicaController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, $clienteId)
    {
        $coordenadas = Institucion::select('latitud','longitud')
        ->first();
        
        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();
        
        return inertia('actividadesEconomicas/create', [
            'coordenadas' => $coordenadas,
            'provincias' => $provincias,
            'clienteId' => $clienteId,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarActividadEconomicaRequest $request, MapaService $mapaService)
    {
        $validated = $request->validated();

        if (($validated['tipo_actividad'] ?? null) === 'E') {
            if (!empty($validated['e_latitud']) && !empty($validated['e_longitud'])) {
                $rutaMapa = $mapaService->generarMapa(
                    $validated['e_latitud'],
                    $validated['e_longitud']
                );
                $validated['e_ruta_mapa'] = $rutaMapa;
            }
        } else {
            $validated['e_latitud'] = null;
            $validated['e_longitud'] = null;
            $validated['e_ruta_mapa'] = null;
        }
      
        ActividadEconomica::create($validated);

        return redirect()->route('clientes.show', [
            'cliente' => $validated['cliente_id'],
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Actividad económica creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ActividadEconomica $actividadEconomica)
    {
        $cliente = Cliente::with([
            'parroquia:id,nombre'
        ])
        ->find($actividadEconomica->cliente_id);

        $actividadEconomica->load([
            'parroquia:id,nombre'
        ]);

        $inspecciones = Inspeccion::with([
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
            ])
            ->whereHas('procesoPermiso', function ($q) use ($actividadEconomica) {
                $q->where('actividad_economica_id', $actividadEconomica->id);
            })
            ->orderByDesc('fecha_inspeccion')
            ->get();
        
        $permisosFuncionamientos = PermisoFuncionamiento::with([
                'procesoPermiso.tipoPermiso',
            ])
            ->whereHas('procesoPermiso', function ($q) use ($actividadEconomica) {
                $q->where('actividad_economica_id', $actividadEconomica->id);
            })
            ->orderByDesc('fecha_expedicion')
            ->get();

        $notificaciones = Notificacion::with([
                'procesoPermiso',
            ])
            ->where('estado', 'ENTREGADO')
            ->whereHas('procesoPermiso', function ($q) use ($actividadEconomica) {
                $q->where('actividad_economica_id', $actividadEconomica->id);
            })
            ->orderByDesc('fecha_entrega')
            ->get();

        return inertia('actividadesEconomicas/show', [            
            'cliente' => $cliente,
            'actividadEconomica' => $actividadEconomica,
            'inspecciones' => $inspecciones,
            'permisosFuncionamientos' => $permisosFuncionamientos,
            'notificaciones' => $notificaciones,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, ActividadEconomica $actividadEconomica)
    {
        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        return inertia('actividadesEconomicas/edit', [  
            'provincias' => $provincias,
            'actividadEconomica' => $actividadEconomica,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarActividadEconomicaRequest $request, ActividadEconomica $actividadEconomica, MapaService $mapaService)
    {

        $validated = $request->validated();

        if (($validated['tipo_actividad'] ?? null) === 'E') {
            if (!empty($validated['e_latitud']) && !empty($validated['e_longitud'])) {
                // Eliminar mapa anterior si existe
                if ($actividadEconomica->e_ruta_mapa) {
                    $rutaAnterior = str_replace('storage/', '', $actividadEconomica->e_ruta_mapa);

                    if (Storage::disk('public')->exists($rutaAnterior)) {
                        Storage::disk('public')->delete($rutaAnterior);
                    }
                }

                // generar nuevo mapa
                $rutaMapa = $mapaService->generarMapa(
                    $validated['e_latitud'],
                    $validated['e_longitud']
                );
                $validated['e_ruta_mapa'] = $rutaMapa;
            }
        } else {
            $validated['e_latitud'] = null;
            $validated['e_longitud'] = null;
            $validated['e_ruta_mapa'] = null;
        }

        $actividadEconomica->update($validated);

        return redirect()->route('clientes.show', [
            'cliente' => $validated['cliente_id'],
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Actividad económica actualizada correctamente');
    }

    public function inactivar(Request $request, ActividadEconomica $actividadEconomica)
    {
        $actividadEconomica->update([
            'estado' => 'INACTIVO'
        ]);

        return redirect()->route('clientes.show', [
            'cliente' => $actividadEconomica->cliente_id,
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Actividad económica inactivada correctamente');
    }

    public function reactivar(Request $request, ActividadEconomica $actividadEconomica)
    {
        $actividadEconomica->update([
            'estado' => 'ACTIVO'
        ]);

        return redirect()->route('clientes.show', [
            'cliente' => $actividadEconomica->cliente_id,
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Actividad económica reactivada correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ActividadEconomica $actividadEconomica)
    {
        $actividadEconomica->delete();

        return redirect()->route('clientes.show', [
            'cliente' => $actividadEconomica->cliente_id,
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Actividad económica eliminada correctamente');
    }
}
