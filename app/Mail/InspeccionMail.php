<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\Inspeccion;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InspeccionMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inspeccion $inspeccion) {}

    public function build()
    {
        $inspeccion = $this->inspeccion;

        $fecha = Carbon::parse($inspeccion->fecha_inspeccion);
        
        $pdfPath = storage_path('app/private/'.$this->inspeccion->ruta_pdf_firmado);

        $configuracion = Configuracion::first();

        return $this->subject('Informe de inspección #' . $this->inspeccion->numero_formateado)
            ->view('emails.inspeccion', compact('inspeccion', 'configuracion'))
            ->attach($pdfPath, [
                'as' => "Informe_Inspeccion_{$inspeccion->numero_formateado}_{$fecha->year}.pdf",
                'mime' => 'application/pdf',
            ]);
    }
}
