<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ValidarParteEmergenciaRequest extends FormRequest
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
        $year = Carbon::parse($this->fecha_salida)->year;

        return [
            'categoria_id' => 'required|exists:categorias_emergencias,id',
            'provincia_id' => 'required|exists:provincias,id',
            'canton_id' => 'required|exists:cantones,id',
            'parroquia_id' => 'required|exists:parroquias,id',
            /*
            'numero' => [
                'required',
                'integer',
                Rule::unique('partes_emergencias')
                    ->where(fn ($query) =>
                        $query->whereYear('fecha_salida', $year)
                    )
                    ->when(
                        $this->route('parteEmergencia'),
                        fn ($rule) => $rule->ignore($this->route('parteEmergencia')->id)
                    )
            ],*/
            'direccion' => 'required|string|max:300',
            'fecha_salida' => 'required|date',
            'fecha_llegada' => 'required|date|after_or_equal:fecha_salida',
            'nombre_propietario' => 'nullable|string|max:100',
            'tipo_cons_hormigon' => 'boolean',
            'tipo_cons_cana' => 'boolean',
            'tipo_cons_madera' => 'boolean',
            'tipo_cons_mixta' => 'boolean',
            'tipo_cons_metalica' => 'boolean',
            'tipo_cons_ladrillo' => 'boolean',
            'danos_materiales' => 'required|string',
            'victimas' => 'required|string',
            'origen' => 'nullable|string|max:1000',
            'cias_asisten' => 'required|string|max:1000',
            'equipos_materiales' => 'required|string|max:1000',
            'personal_externo' => 'nullable|string|max:1000',
            'novedades' => 'required|string',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'personalesQap' => ['nullable', 'array'],
            'personalesQap.*' => ['integer', 'exists:personal,id'],
            'personal_puesto_oficial_id' => 'nullable|exists:personal_puestos,id',
        ];
    }

    public function attributes()
    {
        return [
            'categoria_id' => 'categoría',
            'provincia_id' => 'provincia',
            'canton_id' => 'canton',
            'parroquia_id' => 'parroquia',
            'direccion' => 'dirección',
            'fecha_salida' => 'fecha de salida',
            'fecha_llegada' => 'fecha de llegada',
            'nombre_propietario' => 'nombre del propietario o arrendatario',
            'danos_materiales' => 'daños materiales',
            'victimas' => 'víctimas',
            'origen' => 'posibles causas y origen de la emergencia',
            'cias_asisten' => 'cías que asisten',
            'equipos_materiales' => 'equipos y materiales que se utilizan',
            'personal_externo' => 'personal externo',
            'novedades' => 'novedades registradas',
            'personal_puesto_oficial_id' => 'oficial',
        ];
    }
}
