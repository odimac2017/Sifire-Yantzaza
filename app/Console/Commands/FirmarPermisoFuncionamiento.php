<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PermisoFuncionamientoFirmante;
use App\Models\PersonalPlantilla;
use App\Services\PdfSignerService;

class FirmarPermisoFuncionamiento extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:firmar-permiso-funcionamiento';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Firma automáticamente permisos de funcionamiento';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $firmante = PermisoFuncionamientoFirmante::where('estado_firma', 'pendiente')
            ->orderBy('id')
            ->first();

        if (!$firmante) {
            $this->info('No hay firmas pendientes');
            return;
        }

        $permiso = $firmante->permisoFuncionamiento;

        $plantilla = PersonalPlantilla::where('personal_id', $firmante->personal_id)->first();

        if (!$plantilla) {
            $firmante->update([
                'estado_firma' => 'error',
                'error_firma' => 'No existe plantilla de firma'
            ]);
            return;
        }

        $pdfInput = storage_path("app/permisos/{$permiso->pdf}");
        $pdfOutput = storage_path("app/permisos/tmp_{$permiso->pdf}");

        $certificado = storage_path("app/certificados/{$firmante->personal->certificado}");
        $password = $firmante->personal->password_certificado;

        $signer = new PdfSignerService();

        $resultado = $signer->firmar(
            $pdfInput,
            $pdfOutput,
            $certificado,
            $password,
            $plantilla->posicion_x_firma,
            $plantilla->posicion_y_firma
        );

        if ($resultado) {

            rename($pdfOutput, $pdfInput);

            $firmante->update([
                'estado_firma' => 'firmado',
                'fecha_firma' => now()
            ]);

            $this->info("Firmado correctamente");

        } else {

            $firmante->update([
                'estado_firma' => 'error',
                'error_firma' => 'Error al firmar'
            ]);

            $this->error("Error al firmar");
        }
    }
}
