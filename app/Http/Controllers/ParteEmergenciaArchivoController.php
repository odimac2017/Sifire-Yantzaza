<?php

namespace App\Http\Controllers;

use App\Models\ParteEmergencia;
use App\Models\ParteEmergenciaArchivo;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarParteEmergenciaArchivoRequest;
use Illuminate\Support\Facades\Storage;

class ParteEmergenciaArchivoController extends Controller
{
    public function store(ValidarParteEmergenciaArchivoRequest $request, ParteEmergencia $parteEmergencia)
    {
        $file = $request->file('archivo');

        $ruta = $file->store('partes_emergencias', 'public');

        $parteEmergencia->archivos()->create([
            'nombre' => $file->getClientOriginalName(),
            'ruta' => $ruta,
            'tipo' => $file->getClientOriginalExtension() === 'pdf' ? 'pdf' : 'imagen',
            'size' => $file->getSize(),
        ]);

        return redirect()->route('partesemergencias.show', [
            'parteEmergencia' => $parteEmergencia,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Archivo subido correctamente');
    }

    public function destroy(Request $request, ParteEmergenciaArchivo $parteEmergenciaArchivo)
    {
        if ($parteEmergenciaArchivo->ruta) {
            Storage::disk('public')->delete($parteEmergenciaArchivo->ruta);
        }

        $parteEmergencia = $parteEmergenciaArchivo->parteEmergencia;
        
        $parteEmergenciaArchivo->delete();

        return redirect()->route('partesemergencias.show', [
            'parteEmergencia' => $parteEmergencia,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
        ])->with('success', 'Archivo eliminado');
    }
}
