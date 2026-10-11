<?php

namespace App\Jobs;

use App\Mail\InspeccionMail;
use App\Models\Inspeccion;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarInformeInspeccionJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public $deleteWhenMissingModels = true;

    public function __construct(public Inspeccion $inspeccion) {}

    public function handle()
    {
        Log::info("Inicio Job inspección {$this->inspeccion->id}");

        try {

            $this->inspeccion->load('procesoPermiso.cliente');

            $email = $this->inspeccion->procesoPermiso->cliente->email;

            if (!$email) {
                throw new \Exception('El cliente no tiene correo registrado');
            }

            Mail::to($email)->send(
                new InspeccionMail(
                    $this->inspeccion->withoutRelations()
                )
            );

            $this->inspeccion->update([
                'correo_enviado_at' => now(),
                'correo_destinatario' => $email,
                'correo_estado' => 'ENVIADO',
                'correo_error' => null
            ]);

        } catch (\Throwable $e) {

            Log::error("Error enviando correo inspección {$this->inspeccion->id}", [
                'error' => $e->getMessage()
            ]);

            $this->inspeccion->update([
                'correo_estado' => 'ERROR',
                'correo_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}