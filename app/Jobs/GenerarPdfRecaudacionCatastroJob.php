<?php

namespace App\Jobs;

use App\Models\Configuracion;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\PermisoFuncionamiento;
use App\Models\Institucion;
use App\Models\Plantilla;
use App\Models\RecaudacionCatastro;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GenerarPdfRecaudacionCatastroJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $recaudacionId;

    public function __construct($recaudacionId)
    {
        $this->recaudacionId = $recaudacionId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->recaudacionId}");

        try {
            $configuracion = Configuracion::first();

            $recaudacionCatastro = RecaudacionCatastro::find($this->recaudacionId);

            if (!$recaudacionCatastro) {
                Log::error("Recaudación de catastro no encontrada Id {$this->recaudacionId}");
                return;
            }

            $year = Carbon::parse($recaudacionCatastro->fecha)->year;

            $file = "recaudaciones_catastros/{$year}/{$recaudacionCatastro->numero}.pdf";
           
            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/recaudacionescatastros/' . $recaudacionCatastro->codigo_verificacion . '/verificar';

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );             

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($recaudacionCatastro->plantilla_id);

            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','recaudacionCatastro','qrBase64'));

            $pdf->setPaper(
                $plantilla->tamano_papel,
                $plantilla->orientacion_papel ?? 'portrait'
            );          

            Storage::put($file, $pdf->output());

            $recaudacionCatastro->update([
                'ruta_pdf' => $file,
                'ruta_pdf_firmado' => null,
                'estado_firma' => 'PENDIENTE'
            ]);
            
            FirmarDocumentoJob::dispatch(
                \App\Models\RecaudacionCatastro::class,
                $recaudacionCatastro->id
            )->onQueue('firmas');
        
        } catch (\Exception $e) {
            
            Log::error("Error generando PDF recaudación catastro", [
                'recaudacion_id' => $this->recaudacionId,
                'error' => $e->getMessage()
            ]);
        }
    }
}