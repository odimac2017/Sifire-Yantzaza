<?php

namespace App\Http\Controllers;

use App\Models\ProcesoPermiso;
use App\Models\ProcesoPermisoRequisito;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarProcesoPersonalRequisitoRequest;
use Illuminate\Support\Facades\Storage;

class ProcesoPermisoRequisitoController extends Controller
{
    public function store(ValidarProcesoPersonalRequisitoRequest $request, ProcesoPermiso $procesoPermiso)
    {
        $existe = $procesoPermiso->requisitos()
        ->where('tipo_inspeccion_requisito_id', $request->tipo_inspeccion_requisito_id)
        ->exists();

        if ($existe) {
            return back()->withErrors([
                'tipo_inspeccion_requisito_id' => 'Este requisito ya fue cargado.'
            ]);
        }
        
        $file = $request->file('archivo');

        $ruta = $file->store('permisos_funcionamientos/requisitos', 'public');

        $procesoPermiso->requisitos()->create([
            'tipo_inspeccion_requisito_id' => $request->tipo_inspeccion_requisito_id,
            'nombre' => $file->getClientOriginalName(),
            'ruta' => $ruta,
            'tipo' => $file->getClientOriginalExtension() === 'pdf' ? 'pdf' : null,
            'size' => $file->getSize(),
        ]);

        return redirect()->route('solicitudesinspecciones.show', [
            $procesoPermiso->solicitudInspeccion->id,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Archivo subido correctamente');
    }

    public function destroy(Request $request, ProcesoPermisoRequisito $procesoPermisoRequisito)
    {
        if ($procesoPermisoRequisito->ruta) {
            Storage::disk('public')->delete($procesoPermisoRequisito->ruta);
        }

        $solicitudInspeccion = $procesoPermisoRequisito->procesoPermiso->solicitudInspeccion;
        
        $procesoPermisoRequisito->delete();

        return redirect()->route('solicitudesinspecciones.show', [
            'solicitudInspeccion' => $solicitudInspeccion,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Archivo eliminado');
    }
}
