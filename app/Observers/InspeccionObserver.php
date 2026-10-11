<?php

namespace App\Observers;

use App\Jobs\GenerarPdfInspeccionJob;
use App\Models\Inspeccion;
use App\Models\MovimientoNotaCredito;
use App\Models\NotaCredito;
use App\Models\SolicitudInspeccion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InspeccionObserver
{    
    public function created(Inspeccion $inspeccion): void
    {
        DB::transaction(function () use ($inspeccion) {

            SolicitudInspeccion::where('id', $inspeccion->solicitud_inspeccion_id)
                ->update(['estado' => 'REALIZADO']);

            if ($inspeccion->valor_nota_credito > 0) {
                $this->gestionarNotaCredito($inspeccion);
            }

            if ($this->gestionarFirmantes($inspeccion)) {
                GenerarPdfInspeccionJob::dispatch($inspeccion->id)->afterCommit()
                    ->onQueue('pdf');
            }
        });
    }
    
    public function updated(Inspeccion $inspeccion): void
    {
        // 🔒 BLOQUEO TOTAL DE LOOP DE FIRMA
        if ($inspeccion->estado_firma === 'EN_PROCESO' || $inspeccion->estado_firma === 'SIN_FIRMA') {
            return;
        }

        // =========================
        // 🔐 FLUJO FIRMA (SOLO MANUAL)
        // =========================
        if ($inspeccion->wasChanged('estado_firma') && $inspeccion->estado_firma === 'PENDIENTE') {
            DB::transaction(function () use ($inspeccion) {
                
                $inspeccion->firmantes()
                ->where('estado_firma', '!=', 'FIRMADO')
                ->update([
                    'estado_firma' => 'PENDIENTE',
                    'fecha_firma' => null
                ]);

                $inspeccion->withoutEvents(function () use ($inspeccion) {
                    $inspeccion->update([
                        'ruta_pdf_firmado' => null
                    ]);
                });
            });

            return;
        }

        // =========================
        // 💰 NOTA CRÉDITO (SIN CAMBIOS)
        // =========================
        if (!$inspeccion->wasChanged('valor_nota_credito')) {
            return;
        }

        DB::transaction(function () use ($inspeccion) {

            $valorAnterior = $inspeccion->getOriginal('valor_nota_credito');
            $valorNuevo = $inspeccion->valor_nota_credito;

            $diferencia = $valorNuevo - $valorAnterior;

            if ($diferencia == 0) return;

            $proceso = $inspeccion->procesoPermiso;

            $notaCredito = NotaCredito::where('cliente_id', $proceso->cliente_id)
                ->where('actividad_economica_id', $proceso->actividad_economica_id)
                ->lockForUpdate()
                ->first();

            if (!$notaCredito) return;

            if ($diferencia > 0 && $notaCredito->saldo < $diferencia) {
                throw new \Exception('Saldo insuficiente para aumento');
            }

            if ($diferencia > 0) {
                $notaCredito->decrement('saldo', $diferencia);
            } else {
                $notaCredito->increment('saldo', abs($diferencia));
            }

            MovimientoNotaCredito::create([
                'nota_credito_id' => $notaCredito->id,
                'proceso_permiso_id' => $proceso->id,
                'valor' => abs($diferencia),
                'observaciones' => 'AJUSTE INSPECCIÓN #' . str_pad($inspeccion->numero, 7, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function deleted(Inspeccion $inspeccion): void
    {
        SolicitudInspeccion::where('id', $inspeccion->solicitud_inspeccion_id)
            ->update(['estado' => 'GENERADO']);

        $archivos = array_filter([
            $inspeccion->ruta_pdf,
            $inspeccion->ruta_pdf_firmado,
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }

        if ($inspeccion->valor_nota_credito <= 0) return;

        $proceso = $inspeccion->procesoPermiso;

        $notaCredito = NotaCredito::where('cliente_id', $proceso->cliente_id)
            ->where('actividad_economica_id', $proceso->actividad_economica_id)
            ->lockForUpdate()
            ->first();

        if (!$notaCredito) return;

        $notaCredito->increment('saldo', $inspeccion->valor_nota_credito);

        MovimientoNotaCredito::create([
            'nota_credito_id' => $notaCredito->id,
            'proceso_permiso_id' => $proceso->id,
            'valor' => $inspeccion->valor_nota_credito,
            'observaciones' => 'REVERSO INFORME DE INSPECCIÓN #' . str_pad($inspeccion->numero, 7, '0', STR_PAD_LEFT),
        ]);
    }

    private function gestionarFirmantes(Inspeccion $inspeccion): bool
    {
        $firma = $inspeccion->personal->firma ?? null;

        if (!$firma || !$firma->ruta) {
            $inspeccion->updateQuietly([
                'estado_firma' => 'SIN_FIRMA',
            ]);

            return false;
        }

        // Evitar duplicados
        $existe = $inspeccion->firmantes()
            ->where('personal_id', $inspeccion->personal_id)
            ->exists();

        if (!$existe) {
            $inspeccion->firmantes()->create([
                'personal_id' => $inspeccion->personal_id,
                'orden_firma' => 1,
                'posicion_x_firma' => 225,
                'posicion_y_firma' => 70,
                'estado_firma' => 'PENDIENTE',
            ]);
        }

        return true;
    }

    private function gestionarNotaCredito(Inspeccion $inspeccion): void
    {
        if ($inspeccion->valor_nota_credito <= 0) {
            return;
        }

        $proceso = $inspeccion->procesoPermiso;

        $notaCredito = NotaCredito::where('cliente_id', $proceso->cliente_id)
            ->where('actividad_economica_id', $proceso->actividad_economica_id)
            ->lockForUpdate()
            ->first();

        if (!$notaCredito) {
            return;
        }

        if ($notaCredito->saldo < $inspeccion->valor_nota_credito) {
            throw new \Exception('Saldo insuficiente en la nota de crédito');
        }

        // descontar saldo
        $notaCredito->decrement('saldo', $inspeccion->valor_nota_credito);

        // registrar movimiento
        MovimientoNotaCredito::create([
            'nota_credito_id' => $notaCredito->id,
            'proceso_permiso_id' => $proceso->id,
            'valor' => $inspeccion->valor_nota_credito,
            'observaciones' => 'INFORME DE INSPECCIÓN #' . str_pad($inspeccion->numero, 7, '0', STR_PAD_LEFT),
        ]);
    }
}
