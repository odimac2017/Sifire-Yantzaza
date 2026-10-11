<?php

namespace App\Observers;

use App\Jobs\GenerarPdfPermisoFuncionamientoJob;
use App\Models\PermisoFuncionamiento;
use App\Models\PersonalPlantilla;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PermisoFuncionamientoObserver
{
    public function created(PermisoFuncionamiento $permiso): void
    {
        $permiso->procesoPermiso()
            ->update(['finished_at' => now()]);
       
        if ($this->gestionarFirmantes($permiso)) {
            GenerarPdfPermisoFuncionamientoJob::dispatch($permiso->id)
                ->onQueue('pdf');
        }
    }

    public function updated(PermisoFuncionamiento $permiso): void
    {
        // 🔒 BLOQUEO TOTAL DE LOOP DE FIRMA
        if ($permiso->estado_firma === 'EN_PROCESO' || $permiso->estado_firma === 'SIN_FIRMA') {
            return;
        }

        // =========================
        // 🔐 FLUJO FIRMA (SOLO MANUAL)
        // =========================
        if ($permiso->wasChanged('estado_firma') && $permiso->estado_firma === 'PENDIENTE') {
            DB::transaction(function () use ($permiso) {
                
                $permiso->firmantes()
                ->where('estado_firma', '!=', 'FIRMADO')
                ->update([
                    'estado_firma' => 'PENDIENTE',
                    'fecha_firma' => null
                ]);

                $permiso->withoutEvents(function () use ($permiso) {
                    $permiso->update([
                        'ruta_pdf_firmado' => null
                    ]);
                });
            });

            return;
        }

        if ($permiso->wasChanged('estado') && $permiso->estado === 'ANULADO') {
            if ($permiso->pago_periodo_anterior === 0){
                $permiso->procesoPermiso()
                    ->update(['finished_at' => null]);
            }

            if ($permiso->estado_firma != 'SIN_FIRMA'){
                if ($permiso->ruta_pdf_firmado && Storage::exists($permiso->ruta_pdf_firmado)) {
                    Storage::disk('private')->delete($permiso->ruta_pdf_firmado);
                }
                
                $permiso->update([
                    'estado_firma' => 'ANULADO',
                    'ruta_pdf_firmado' => null
                ]);

                // opcional: detener firmas pendientes
                $permiso->firmantes()
                    ->update(['estado_firma' => 'ANULADO']);
            }
        }
    }

    public function deleted(PermisoFuncionamiento $permiso): void
    {
        $archivos = array_filter([
            $permiso->ruta_pdf,
            $permiso->ruta_pdf_firmado,
        ]);

        if (!empty($archivos)) {
            Storage::disk('private')->delete($archivos);
        }
    }

    private function gestionarFirmantes(PermisoFuncionamiento $permiso): bool
    {
        $firmantes = PersonalPlantilla::where(
            'plantilla_id',
            $permiso->plantilla_id
        )->get();

        if ($firmantes->isEmpty()) {
            $permiso->updateQuietly([
                'estado_firma' => 'SIN_FIRMA',
            ]);

            return false;
        }

        $sinFirmaElectronica = $firmantes->contains(
            fn ($f) => (int) $f->firma_electronica === 0
        );

        if ($sinFirmaElectronica) {
            $permiso->updateQuietly([
                'estado_firma' => 'SIN_FIRMA',
            ]);

            return false;
        }

        if (!$permiso->firmantes()->exists()) {
            $permiso->firmantes()->createMany(
                $firmantes->map(fn ($f) => [
                    'personal_id' => $f->personal_id,
                    'orden_firma' => $f->orden_firma,
                    'posicion_x_firma' => $f->posicion_x_firma,
                    'posicion_y_firma' => $f->posicion_y_firma,
                    'estado_firma' => 'PENDIENTE',
                ])->toArray()
            );
        }

        return true;
    }
}
