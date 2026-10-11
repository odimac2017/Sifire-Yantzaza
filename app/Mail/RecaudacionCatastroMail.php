<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\RecaudacionCatastro;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RecaudacionCatastroMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public RecaudacionCatastro $recaudacionCatastro) {}

    public function build()
    {
        $recaudacionCatastro = $this->recaudacionCatastro;

        $fecha = Carbon::parse($recaudacionCatastro->fecha);
        
        $pdfPath = storage_path('app/private/'.$this->recaudacionCatastro->ruta_pdf_firmado);

        $configuracion = Configuracion::first();

        return $this->subject('Comprobante de recaudación de catastro #' . $this->recaudacionCatastro->numero_formateado)
            ->view('emails.recaudacionCatastro', compact('recaudacionCatastro', 'configuracion'))
            ->attach($pdfPath, [
                'as' => "Comprobante_Recaudacion_{$recaudacionCatastro->numero_formateado}_{$fecha->year}.pdf",
                'mime' => 'application/pdf',
            ]);
    }
}
