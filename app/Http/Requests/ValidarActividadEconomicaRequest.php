<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarActividadEconomicaRequest extends FormRequest
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
            'provincia_id' => ['required', 'exists:provincias,id'],
            'canton_id' => ['required', 'exists:cantones,id'],
            'parroquia_id' => ['required', 'exists:parroquias,id'],
            'cliente_id' => ['required', 'exists:clientes,id'],
            'tipo_actividad' => ['required', 'in:E,V'],
            'fecha_inicio' => ['required', 'date', 'before_or_equal:today'],
            
            'e_nombre_comercial' => ['required_if:tipo_actividad,E', 'nullable', 'string', 'max:300'],
            'e_actividad_principal' => ['required_if:tipo_actividad,E', 'nullable', 'string', 'max:300'],
            'e_actividad_secundaria' => ['nullable', 'string', 'max:200'],
            'e_sector' => ['nullable', 'string', 'max:100'],
            'e_direccion' => ['required_if:tipo_actividad,E', 'nullable', 'string', 'max:300'],
            'e_edificio' => ['nullable', 'string', 'max:100'],
            'e_piso' => ['nullable', 'string', 'max:100'],
            'e_departamento' => ['nullable', 'string', 'max:100'],
            'e_telefonos' => ['nullable', 'string', 'max:30'],
            'e_latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'e_longitud' => ['nullable', 'numeric', 'between:-180,180'],

            'v_placa' => ['required_if:tipo_actividad,V', 'nullable', 'string', 'max:30'],
            'v_marca' => ['required_if:tipo_actividad,V', 'nullable', 'string', 'max:30'],
            'v_tipo' => ['nullable', 'string', 'max:30'],
            'v_clase' => ['nullable', 'string', 'max:30'],
            'v_color' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function attributes()
    {
        return [
            'provincia_id' => 'provincia',
            'canton_id' => 'cantón',
            'parroquia_id' => 'parroquia',
            'tipo_actividad' => 'tipo de actividad',
            'fecha_inicio' => 'fecha de inicio',
            'e_nombre_comercial' => 'nombre comercial',
            'e_actividad_principal' => 'actividad principal',
            'e_actividad_secundaria' => 'actividad secundaria',
            'e_sector' => 'sector',
            'e_direccion' => 'dirección',
            'e_edificio' => 'edificio',
            'e_piso' => 'piso',
            'e_departamento' => 'departamento',
            'e_telefonoso' => 'telefonoso',
            'e_latitud' => 'latitud',
            'e_longitud' => 'longitud',
            'v_placa' => 'placa',
            'v_marca' => 'marca',
            'v_tipo' => 'tipo',
            'v_clase' => 'clase',
            'v_color' => 'color',
        ];
    }
}
