<?php

namespace App\Jobs;

use App\Services\FirmaPdfService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FirmarDocumentoJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public $modelo;
    public $documentoId;
    public $password;

    public $timeout = 120;
    public $tries = 3;

    public function __construct($modelo, $documentoId, $password = null)
    {
        $this->modelo = $modelo;
        $this->documentoId = $documentoId;
        $this->password = $password ? encrypt($password) : null;
    }

    public function handle()
    {
        Log::info("Inicio firma documento {$this->modelo} Id {$this->documentoId}");

        try {

            Log::info("Inicio firma documento", [
                'modelo' => $this->modelo,
                'documento_id' => $this->documentoId
            ]);

            if (!class_exists($this->modelo)) {
                Log::error("Modelo inválido", ['modelo' => $this->modelo]);
                return;
            }

            $documento = $this->modelo::with([
                'firmantes.personal.firma'
            ])->find($this->documentoId);

            if (!$documento) {
                Log::error("Documento no encontrado", [
                    'modelo' => $this->modelo,
                    'id' => $this->documentoId
                ]);
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Obtener siguiente firmante pendiente
            |--------------------------------------------------------------------------
            */

            $firmante = $documento->firmantes
                ->where('estado_firma', '!=', 'FIRMADO')
                ->sortBy('orden_firma')
                ->first();

            if (!$firmante) {

                $documento->update([
                    'estado_firma' => 'FIRMADO'
                ]);

                Log::info("Documento completamente firmado", [
                    'documento_id' => $documento->id
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Validar certificado
            |--------------------------------------------------------------------------
            */

            $firma = $firmante->personal->firma ?? null;

            if (!$firma || !$firma->ruta) {

                $firmante->update([
                    'estado_firma' => 'SIN_CERTIFICADO',
                    'error_firma' => 'Certificado no encontrado'
                ]);

                Log::warning("Firmante sin certificado", [
                    'firmante_id' => $firmante->id
                ]);

                return;
            }

            if ($firma->fecha_expiracion && Carbon::parse($firma->fecha_expiracion)->isPast()) {

                $firmante->update([
                    'estado_firma' => 'CERTIFICADO_VENCIDO',
                    'error_firma' => 'Certificado vencido'
                ]);

                Log::warning("Certificado vencido", [
                    'firmante_id' => $firmante->id
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Validar password
            |--------------------------------------------------------------------------
            */

            Log::info("Password", [
                'Password' => $this->password
            ]);

            if ($firma->solicitar_password && !$this->password) {

                $firmante->update([
                    'estado_firma' => 'REQUIERE_PASSWORD'
                ]);

                $documento->update([
                    'estado_firma' => 'ESPERANDO_FIRMA'
                ]);

                Log::info("Firma detenida esperando password", [
                    'firmante_id' => $firmante->id
                ]);

                return;
            }

            $password = $this->password ? decrypt($this->password) : null;

            /*
            |--------------------------------------------------------------------------
            | Preparar PDF
            |--------------------------------------------------------------------------
            */

            $input = $documento->ruta_pdf_firmado ?? $documento->ruta_pdf;

            if (!$input) {

                Log::error("PDF no encontrado", [
                    'documento_id' => $documento->id
                ]);

                return;
            }

            $year = Carbon::parse($documento->created_at)->year;

            $folder = match(class_basename($this->modelo)) {
                'Inspeccion' => 'inspecciones',
                'PermisoFuncionamiento' => 'permisos_funcionamiento',
                'RecaudacionCatastro' => 'recaudaciones_catastros',
                default => 'documentos'
            };

            $fileFirmado = "{$folder}/{$year}/{$documento->numero}_firmado_{$firmante->id}.pdf";

            $x = $firmante->posicion_x_firma ?? 50;
            $y = $firmante->posicion_y_firma ?? 50;

            /*
            |--------------------------------------------------------------------------
            | Firmar PDF
            |--------------------------------------------------------------------------
            */

            app(FirmaPdfService::class)->firmar(
                $input,
                $firma,
                $fileFirmado,
                $x,
                $y,
                $password
            );

            /*
            |--------------------------------------------------------------------------
            | Marcar firmante firmado
            |--------------------------------------------------------------------------
            */

            $firmante->update([
                'estado_firma' => 'FIRMADO',
                'fecha_firma' => now(),
                'error_firma' => null
            ]);

            Log::info("Firmante firmado", [
                'firmante_id' => $firmante->id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Verificar si quedan firmantes
            |--------------------------------------------------------------------------
            */

            $pendientes = $documento->firmantes
                ->where('estado_firma', 'PENDIENTE')
                ->count();

            if ($pendientes > 0) {

                $documento->update([
                    'ruta_pdf_firmado' => $fileFirmado,
                    'estado_firma' => 'EN_PROCESO'
                ]);

                Log::info("Siguiente firma en cola", [
                    'documento_id' => $documento->id
                ]);

                self::dispatch(
                    $this->modelo,
                    $documento->id
                )->delay(now()->addSeconds(2));

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Documento final firmado
            |--------------------------------------------------------------------------
            */

            $documento->update([
                'ruta_pdf_firmado' => $fileFirmado,
                'estado_firma' => 'FIRMADO'
            ]);

            Log::info("Documento firmado completamente", [
                'documento_id' => $documento->id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Enviar documento firmado por correo electrónico
            |--------------------------------------------------------------------------
            */

            $job = match (true) {
                $documento instanceof \App\Models\PermisoFuncionamiento =>
                    EnviarPermisoFuncionamientoJob::class,

                $documento instanceof \App\Models\Inspeccion =>
                    EnviarInformeInspeccionJob::class,

                $documento instanceof \App\Models\RecaudacionCatastro =>
                    EnviarRecaudacionCatastroJob::class,

                default => null,
            };

            if ($job) {
                $job::dispatch($documento)
                    ->onQueue('correos');
            }

        } catch (\Throwable $e) {

            Log::error("Error firma documento", [
                'modelo' => $this->modelo,
                'documento_id' => $this->documentoId,
                'mensaje' => $e->getMessage(),
                'linea' => $e->getLine(),
                'archivo' => $e->getFile()
            ]);

            throw $e;

        }
    }
}