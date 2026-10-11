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
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GenerarPdfPermisoFuncionamientoJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    protected $permisoId;

    public function __construct($permisoId)
    {
        $this->permisoId = $permisoId;
    }

    public function handle()
    {
        Log::info("Inicio Job ID: {$this->permisoId}");

        try {
            $configuracion = Configuracion::first();

            $permiso = PermisoFuncionamiento::find($this->permisoId);

            if (!$permiso) {
                Log::error("Permiso de Funcionamiento no encontrada Id {$this->permisoId}");
                return;
            }

            $year = Carbon::parse($permiso->created_at)->year;

            $file = "permisos_funcionamiento/{$year}/{$permiso->numero}.pdf";
            
            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/permisosfuncionamientos/' . $permiso->codigo_verificacion . '/verificar';

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );             

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($permiso->plantilla_id);

            $vista = 'pdf.' . $plantilla->vista_blade;

            $pdf = Pdf::loadView($vista, compact('institucion','permiso','qrBase64'));

            $pdf->setPaper(
                $plantilla->tamano_papel,
                $plantilla->orientacion_papel ?? 'portrait'
            );          

            Storage::put($file, $pdf->output());

            $permiso->update([
                'ruta_pdf' => $file,
                'ruta_pdf_firmado' => null,
                'estado_firma' => 'PENDIENTE'
            ]);
            
            FirmarDocumentoJob::dispatch(
                \App\Models\PermisoFuncionamiento::class,
                $permiso->id
            )->onQueue('firmas');
        
        } catch (\Exception $e) {
            
            Log::error("Error generando PDF permiso de funcionamiento", [
                'permiso_id' => $this->permisoId,
                'error' => $e->getMessage()
            ]);
        }
    }
}