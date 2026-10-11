<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\SolicitudInspeccion;
use Carbon\Carbon;

class ValidarSolicitudInspeccionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cliente_id' => ['required','exists:clientes,id'],
            'actividad_economica_id' => [
                'required',
                'exists:actividades_economicas,id',
                function ($attribute, $value, $fail) {
                    if (!$value) return;

                    // 👉 EXCLUIR en caso de update
                    $excludeId = $this->route('solicitudInspeccion')?->id;

                    /*
                    |--------------------------------------------------------------------------
                    | 1. VALIDAR SOLICITUD GENERADA
                    |--------------------------------------------------------------------------
                    */
                    $querySolicitud = SolicitudInspeccion::where('estado', 'GENERADO')
                        ->whereHas('procesoPermiso', function ($q) use ($value) {
                            $q->where('actividad_economica_id', $value);
                        });

                    if ($excludeId) {
                        $querySolicitud->where('id', '!=', $excludeId);
                    }

                    if ($querySolicitud->exists()) {
                        $fail('Ya existe una solicitud de inspección generada para esta actividad económica.');
                        return;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | 2. VALIDAR PERMISO EN EL MISMO AÑO
                    |--------------------------------------------------------------------------
                    */
                    $year = Carbon::now()->year;

                    $queryPermiso = SolicitudInspeccion::whereHas('procesoPermiso', function ($q) use ($value, $year) {
                        $q->where('actividad_economica_id', $value)
                        ->whereNotNull('finished_at')
                        ->whereYear('finished_at', $year);
                    });

                    if ($excludeId) {
                        $queryPermiso->where('id', '!=', $excludeId);
                    }

                    if ($queryPermiso->exists()) {
                        $fail('Ya existe un permiso de funcionamiento para esta actividad económica en el año actual.');
                    }
                }
            ],
            'tipo_permiso_id' => ['required','exists:tipos_permisos,id'],
            'tarifario_id' => ['required','exists:tarifarios,id'],
            'actualizacion_planos' => 'boolean',
            'personal_id' => ['required', 'exists:personal,id'],
            'fecha_inspeccion' => ['required', 'date', 'after_or_equal:today'],
            'observaciones' => ['nullable', 'string', 'max:300'],
            'fecha_inicio' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    /**
     * Validaciones adicionales
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            $limite = 30; // máximo inspecciones por día

            $cantidad = SolicitudInspeccion::where('personal_id', $this->personal_id)
                ->whereDate('fecha_inspeccion', $this->fecha_inspeccion)
                ->count();

            if ($cantidad >= $limite) {
                $validator->errors()->add(
                    'personal_id',
                    'El inspector ya tiene '.$limite.' inspecciones asignadas para ese día.'
                );
            }
        });
    }

    public function attributes(): array
    {
        return [
            'actividad_economica_id' => 'actividad económica',
            'tipo_permiso_id' => 'tipo de permiso',
            'tarifario_id' => 'tarifario',
            'personal_id' => 'inspector asignado',
            'fecha_inspeccion' => 'fecha para inspección',
            'fecha_inicio' => 'fecha de inicio',
        ];
    }
}
