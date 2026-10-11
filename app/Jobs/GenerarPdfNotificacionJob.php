<?php

namespace App\Jobs;

use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Institucion;
use App\Models\Notificacion;
use App\Models\Plantilla;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GenerarPdfNotificacionJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $notificacionId;

    public function __construct($notificacionId)
    {
        $this->notificacionId = $notificacionId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->notificacionId}");

        try {

            // 🔍 1. Obtener inspección
            $notificacion = Notificacion::find($this->notificacionId);

            if (!$notificacion) {
                Log::error("Notificación no encontrada Id {$this->notificacionId}");
                return;
            }

            // 📄 2. Generar PDF            
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($notificacion->plantilla_id);

            // 📄 Vista dinámica
            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','notificacion'));

            // 📏 Configurar tamaño
            if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {
                $pdf->setPaper(
                    $plantilla->tamano_papel,
                    $plantilla->orientacion_papel ?? 'portrait'
                );
            } else {
                $pdf->setPaper([
                    0,
                    0,
                    $plantilla->ancho,
                    $plantilla->alto
                ], $plantilla->orientacion_papel ?? 'portrait');
            }

            // 📅 Año de la notificación
            $fecha = Carbon::parse($notificacion->fecha_entrega);
            $year = $fecha->year;

            // 📁 Rutas
            $filePath = "notificaciones/{$year}/{$notificacion->numero}.pdf";            

            // 📁 Crear carpeta si no existe
            Storage::makeDirectory("notificaciones/{$year}");

            // 💾 Guardar PDF
            Storage::put($filePath, $pdf->output());

            Log::info("📄 PDF generado: {$filePath}");

            // 💾 Guardar ruta PDF en BD
            $notificacion->update([
                'ruta_pdf' => $filePath
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error en GenerarPdfNotificacionJob: " . $e->getMessage());
        }
    }
}