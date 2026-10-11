<?php

namespace App\Observers;

use App\Jobs\GenerarPdfSolicitudInspeccionJob;
use App\Models\SolicitudInspeccion;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SolicitudInspeccionObserver
{
    public function created(SolicitudInspeccion $solicitud): void
    {
        //GenerarPdfSolicitudInspeccionJob::dispatch($solicitud->id)->onQueue('pdf');
    }

    public function updated(SolicitudInspeccion $solicitud): void
    {         
        if (
            $solicitud->wasChanged('ruta_pdf')
            && is_null($solicitud->ruta_pdf)
        ) {
            //GenerarPdfSolicitudInspeccionJob::dispatch($solicitud->id)->onQueue('pdf');
        }
    }

    public function deleted(SolicitudInspeccion $solicitud): void
    {
        $archivos = array_filter([
            $solicitud->ruta_pdf
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }
    }
}
