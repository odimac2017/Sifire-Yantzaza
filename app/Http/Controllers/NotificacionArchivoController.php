<?php

namespace App\Http\Controllers;

use App\Http\Requests\ValidarNotificacionArchivoRequest;
use App\Models\Notificacion;
use App\Models\NotificacionArchivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NotificacionArchivoController extends Controller
{
    public function store(ValidarNotificacionArchivoRequest $request, Notificacion $notificacion)
    {
        $file = $request->file('archivo');

        $ruta = $file->store('notificaciones', 'public');

        $notificacion->archivos()->create([
            'nombre' => $file->getClientOriginalName(),
            'ruta' => $ruta,
            'tipo' => $file->getClientOriginalExtension() === 'pdf' ? 'pdf' : 'imagen',
            'size' => $file->getSize(),
        ]);

        return redirect()->route('notificaciones.show', [
            'notificacion' => $notificacion,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
        ])->with('success', 'Archivo subido correctamente');
    }

    public function destroy(Request $request, NotificacionArchivo $notificacionArchivo)
    {
        if ($notificacionArchivo->ruta) {
            Storage::disk('public')->delete($notificacionArchivo->ruta);
        }

        $notificacion = $notificacionArchivo->notificacion;
        
        $notificacionArchivo->delete();

        return redirect()->route('notificaciones.show', [
            'notificacion' => $notificacion,
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->estado !== 'ALL' ? $request->input('estado', 'ALL') : null,
        ])->with('success', 'Archivo eliminado');
    }
}
