<?php

namespace App\Jobs;

use App\Models\Institucion;
use App\Models\Plantilla;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\SolicitudInspeccion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GenerarPdfSolicitudInspeccionJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $solicitudInspeccionId;

    public function __construct($solicitudInspeccionId)
    {
        $this->solicitudInspeccionId = $solicitudInspeccionId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->solicitudInspeccionId}");

        try {

            // 🔍 1. Obtener inspección
            $solicitudInspeccion = SolicitudInspeccion::find($this->solicitudInspeccionId);

            if (!$solicitudInspeccion) {
                Log::error("Solicitud de inspección no encontrada Id {$this->solicitudInspeccionId}");
                return;
            }

            // 📄 2. Generar PDF
            $solicitudInspeccion->fecha_solicitud = Carbon::parse($solicitudInspeccion->fecha_solicitud);
            
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($solicitudInspeccion->plantilla_id);

            // 📄 Vista dinámica
            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','solicitudInspeccion'));

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

            $pdf->render();

            $dompdf = $pdf->getDomPDF();
            $canvas = $dompdf->getCanvas();
            $fontMetrics = $dompdf->getFontMetrics();

            $fontNormal = $fontMetrics->getFont("Roboto", "normal");

            $canvas->page_text(510, 800, "Página {PAGE_NUM} de {PAGE_COUNT}", $fontNormal, 8, [0,0,0]);

            // 📅 Año de la solicitud de inspección
            $fecha = Carbon::parse($solicitudInspeccion->fecha_solicitud);
            $year = $fecha->year;

            // 📁 Rutas
            $filePath = "solicitudes_inspecciones/{$year}/{$solicitudInspeccion->numero}.pdf";

            // 📁 Crear carpeta si no existe
            Storage::makeDirectory("solicitudes_inspecciones/{$year}");

            // 💾 Guardar PDF
            Storage::put($filePath, $pdf->output());

            Log::info("📄 PDF generado: {$filePath}");

            // 💾 Guardar ruta PDF en BD
            $solicitudInspeccion->updateQuietly([
                'ruta_pdf' => $filePath
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error en GenerarPdfSolicitudInspeccionJob: " . $e->getMessage());
        }
    }
}