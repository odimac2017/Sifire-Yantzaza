<?php

namespace App\Jobs;

use App\Mail\PermisoFuncionamientoMail;
use App\Models\PermisoFuncionamiento;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarPermisoFuncionamientoJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public $deleteWhenMissingModels = true;

    public function __construct(public PermisoFuncionamiento $permisoFuncionamiento) {}

    public function handle()
    {
        Log::info("Inicio Job permiso {$this->permisoFuncionamiento->id}");

        try {

            $this->permisoFuncionamiento->load('procesoPermiso.cliente');

            $email = $this->permisoFuncionamiento->procesoPermiso->cliente->email;

            if (!$email) {
                throw new \Exception('El cliente no tiene un correo registrado');
            }

            Mail::to($email)->send(
                new PermisoFuncionamientoMail(
                    $this->permisoFuncionamiento->withoutRelations()
                )
            );

            $this->permisoFuncionamiento->update([
                'correo_enviado_at' => now(),
                'correo_destinatario' => $email,
                'correo_estado' => 'ENVIADO',
                'correo_error' => null
            ]);

        } catch (\Throwable $e) {

            Log::error("Error enviando correo permiso Id {$this->permisoFuncionamiento->id}", [
                'error' => $e->getMessage()
            ]);

            $this->permisoFuncionamiento->update([
                'correo_estado' => 'ERROR',
                'correo_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}