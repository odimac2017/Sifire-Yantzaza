<?php

namespace App\Observers;

use App\Jobs\GenerarPdfRecaudacionCatastroJob;
use App\Models\PersonalPlantilla;
use App\Models\RecaudacionCatastro;
use Illuminate\Support\Facades\Storage;

class RecaudacionCatastroObserver
{
    public function created(RecaudacionCatastro $recaudacionCatastro): void
    {
        $this->gestionarFirmantes($recaudacionCatastro);

        logger($recaudacionCatastro);

        if ($recaudacionCatastro->estado_firma != 'SIN_FIRMA'){
            GenerarPdfRecaudacionCatastroJob::dispatch($recaudacionCatastro->id)->onQueue('pdf');
        }
    }

    public function deleted(RecaudacionCatastro $recaudacionCatastro): void
    {
        $archivos = array_filter([
            $recaudacionCatastro->ruta_pdf,
            $recaudacionCatastro->ruta_pdf_firmado,
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }
    }
   
    private function gestionarFirmantes(RecaudacionCatastro $recaudacionCatastro): void
    {
        // Evitar duplicados
        if ($recaudacionCatastro->firmantes()->exists()) {
            return;
        }

        $firmantes = PersonalPlantilla::where(
            'plantilla_id',
            $recaudacionCatastro->plantilla_id
        )->get();

        if ($firmantes->isEmpty()) {
            $recaudacionCatastro->updateQuietly([
                'estado_firma' => 'SIN_FIRMA',
            ]);
            return;
        }

        $sinFirmaElectronica = $firmantes->contains(function ($f) {
            return (int) $f->firma_electronica === 0;
        });

        if ($sinFirmaElectronica) {
            $recaudacionCatastro->updateQuietly([
                'estado_firma' => 'SIN_FIRMA',
            ]);
            return;
        }

        $recaudacionCatastro->firmantes()->createMany(
            $firmantes->map(fn ($f) => [
                'personal_id' => $f->personal_id,
                'orden_firma' => $f->orden_firma,
                'posicion_x_firma' => $f->posicion_x_firma,
                'posicion_y_firma' => $f->posicion_y_firma,
                'estado_firma' => 'PENDIENTE',
            ])->toArray()
        );
    }
}
