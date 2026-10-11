<?php

namespace App\Jobs;

use App\Models\Configuracion;
use App\Models\Inspeccion;
use App\Models\Institucion;
use App\Models\Plantilla;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerarPdfInspeccionJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $inspeccionId;

    public function __construct($inspeccionId)
    {
        $this->inspeccionId = $inspeccionId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->inspeccionId}");

        try {
            $configuracion = Configuracion::first();

            $inspeccion = Inspeccion::find($this->inspeccionId);

            if (!$inspeccion) {
                Log::error("Inspección no encontrada Id {$this->inspeccionId}");
                return;
            }

            $year = Carbon::parse($inspeccion->fecha_inspeccion)->year;

            $file = "inspecciones/{$year}/{$inspeccion->numero}.pdf";

            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/inspecciones/' . $inspeccion->codigo_verificacion . '/verificar';         

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($inspeccion->plantilla_id);

            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','inspeccion','qrBase64'));

            $pdf->setPaper(
                $plantilla->tamano_papel,
                $plantilla->orientacion_papel ?? 'portrait'
            );      

            Storage::put($file, $pdf->output());

            $inspeccion->update([
                'ruta_pdf' => $file,
                'ruta_pdf_firmado' => null,
                'estado_firma' => 'PENDIENTE'
            ]);

            FirmarDocumentoJob::dispatch(
                \App\Models\Inspeccion::class,
                $inspeccion->id
            )->onQueue('firmas');

        } catch (\Throwable $e) {

            Log::error("Error generando PDF inspección", [
                'inspeccion_id' => $this->inspeccionId,
                'error' => $e->getMessage()
            ]);
        }
    }
}