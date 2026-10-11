<?php

namespace App\Observers;

use App\Jobs\GenerarPdfNotificacionJob;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Storage;

class NotificacionObserver
{
    public function created(Notificacion $notificacion): void
    {
        GenerarPdfNotificacionJob::dispatch($notificacion->id)->onQueue('pdf');
    }

    public function updated(Notificacion $notificacion): void
    {     
        if ($notificacion->estado === 'ENTREGADO') {   
            GenerarPdfNotificacionJob::dispatch($notificacion->id)->onQueue('pdf');
        }
    }

    public function deleted(Notificacion $notificacion): void
    {
        $archivos = array_filter([
            $notificacion->ruta_pdf
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }
    }
}
