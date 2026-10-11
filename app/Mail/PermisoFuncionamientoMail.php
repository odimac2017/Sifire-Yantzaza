<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\PermisoFuncionamiento;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PermisoFuncionamientoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PermisoFuncionamiento $permisoFuncionamiento) {}

    public function build()
    {
        $permisoFuncionamiento = $this->permisoFuncionamiento;

        $fecha = Carbon::parse($permisoFuncionamiento->fecha_expedicion);
        
        $pdfPath = storage_path('app/private/'.$this->permisoFuncionamiento->ruta_pdf_firmado);

        $configuracion = Configuracion::first();

        return $this->subject($this->permisoFuncionamiento->procesoPermiso->tipoPermiso->nombre ." #". $this->permisoFuncionamiento->numero_formateado)
            ->view('emails.permisoFuncionamiento', compact('permisoFuncionamiento', 'configuracion'))
            ->attach($pdfPath, [
                'as' => "Permiso_Funcionamiento_{$permisoFuncionamiento->numero_formateado}_{$fecha->year}.pdf",
                'mime' => 'application/pdf',
            ]);
    }
}
