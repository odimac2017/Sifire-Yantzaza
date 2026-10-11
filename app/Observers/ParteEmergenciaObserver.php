<?php

namespace App\Observers;

use App\Jobs\GenerarPdfParteEmergenciaJob;
use App\Models\ParteEmergencia;
use Illuminate\Support\Facades\Storage;

class ParteEmergenciaObserver
{
    public function created(ParteEmergencia $parte): void
    {
        GenerarPdfParteEmergenciaJob::dispatch($parte->id)->onQueue('pdf');
    }

    public function updated(ParteEmergencia $parte): void
    {        
        GenerarPdfParteEmergenciaJob::dispatch($parte->id)->onQueue('pdf');
    }

    public function deleted(ParteEmergencia $parte): void
    {
        $archivos = array_filter([
            $parte->ruta_pdf
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }
    }
}
