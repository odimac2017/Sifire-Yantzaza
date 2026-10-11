<?php

namespace App\Jobs;

use App\Mail\RecaudacionCatastroMail;
use App\Models\RecaudacionCatastro;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarRecaudacionCatastroJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public $deleteWhenMissingModels = true;

    public function __construct(public RecaudacionCatastro $recaudacionCatastro) {}

    public function handle()
    {
        Log::info("Inicio Job recaudación {$this->recaudacionCatastro->id}");

        try {

            $this->recaudacionCatastro->load('catastro.cliente');

            $email = $this->recaudacionCatastro->catastro->cliente->email;

            if (!$email) {
                throw new \Exception('El cliente no tiene un correo registrado');
            }

            Mail::to($email)->send(
                new RecaudacionCatastroMail(
                    $this->recaudacionCatastro->withoutRelations()
                )
            );

            $this->recaudacionCatastro->update([
                'correo_enviado_at' => now(),
                'correo_destinatario' => $email,
                'correo_estado' => 'ENVIADO',
                'correo_error' => null
            ]);

        } catch (\Throwable $e) {

            Log::error("Error enviando correo recaudación Id {$this->recaudacionCatastro->id}", [
                'error' => $e->getMessage()
            ]);

            $this->recaudacionCatastro->update([
                'correo_estado' => 'ERROR',
                'correo_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}