<?php

namespace App\Jobs;

use App\Models\Institucion;
use App\Models\ParteEmergencia;
use App\Models\Plantilla;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GenerarPdfParteEmergenciaJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $parteEmergenciaId;

    public function __construct($parteEmergenciaId)
    {
        $this->parteEmergenciaId = $parteEmergenciaId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->parteEmergenciaId}");

        try {

            // 🔍 1. Obtener inspección
            $parteEmergencia = ParteEmergencia::find($this->parteEmergenciaId);

            if (!$parteEmergencia) {
                Log::error("Parte de emergencia no encontrada Id {$this->parteEmergenciaId}");
                return;
            }

            // 📄 2. Generar PDF
            $institucion = Institucion::first();
            $plantilla = Plantilla::find($parteEmergencia->plantilla_id);

            // 📄 Vista dinámica
            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','parteEmergencia'));

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

            $pdf->render();

            $dompdf = $pdf->getDomPDF();
            $canvas = $dompdf->getCanvas();
            $fontMetrics = $dompdf->getFontMetrics();

            $fontNormal = $fontMetrics->getFont("Roboto", "normal");

            $canvas->page_text(510, 800, "Página {PAGE_NUM} de {PAGE_COUNT}", $fontNormal, 8, [0,0,0]);

            // 📅 Año del parte de emergencia
            $fecha = Carbon::parse($parteEmergencia->created_at);
            $year = $fecha->year;

            // 📁 Rutas
            $numero = (int) $parteEmergencia->numero;
            $filePath = "partes_emergencias/{$year}/{$numero}.pdf";

            // 📁 Crear carpeta si no existe
            Storage::makeDirectory("partes_emergencias/{$year}");

            // 💾 Guardar PDF
            Storage::put($filePath, $pdf->output());

            Log::info("PDF generado: {$filePath}");

            // 💾 Guardar ruta PDF en BD
            $parteEmergencia->update([
                'ruta_pdf' => $filePath
            ]);

        } catch (\Exception $e) {
            Log::error("Error en GenerarPdfParteEmergenciaJob: " . $e->getMessage());
        }
    }
}