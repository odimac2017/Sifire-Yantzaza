<?php

namespace App\Http\Controllers;

use App\Http\Requests\ValidarInspeccionArchivoRequest;
use App\Models\Inspeccion;
use App\Models\InspeccionArchivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InspeccionArchivoController extends Controller
{
    public function store(ValidarInspeccionArchivoRequest $request, Inspeccion $inspeccion)
    {
        $file = $request->file('archivo');

        $ruta = $file->store('inspecciones', 'public');

        $inspeccion->archivos()->create([
            'nombre' => $file->getClientOriginalName(),
            'ruta' => $ruta,
            'tipo' => $file->getClientOriginalExtension() === 'pdf' ? 'pdf' : 'imagen',
            'size' => $file->getSize(),
        ]);

        return redirect()->route('inspecciones.show', [
            'inspeccion' => $inspeccion,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Archivo subido correctamente');
    }

    public function destroy(Request $request, InspeccionArchivo $inspeccionArchivo)
    {
        if ($inspeccionArchivo->ruta) {
            Storage::disk('public')->delete($inspeccionArchivo->ruta);
        }

        $inspeccion = $inspeccionArchivo->inspeccion;
        
        $inspeccionArchivo->delete();

        return redirect()->route('inspecciones.show', [
            'inspeccion' => $inspeccion,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'GENERADO'),
        ])->with('success', 'Archivo eliminado');
    }
}
