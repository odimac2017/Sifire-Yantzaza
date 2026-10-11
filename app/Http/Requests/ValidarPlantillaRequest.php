<?php

namespace App\Http\Requests;

use App\Models\PersonalPlantilla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarPlantillaRequest extends FormRequest
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
            'plantilla_id' => ['required','exists:plantillas,id'],
            'personal_id' => ['required','exists:personal,id'],
            'puesto' => ['required','string','max:255'],
            'firma_electronica' => ['boolean'],
            'posicion_firmante' => ['required','in:L,C,R'],
            'posicion_x_firma' => ['required','integer','min:1'],
            'posicion_y_firma' => ['required','integer','min:1'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            $plantillaId = $this->plantilla_id;

            // validar si ya existe un firmante en esa posición
            $existe = PersonalPlantilla::where('plantilla_id', $plantillaId)
                ->where('posicion_firmante', $this->posicion_firmante)
                ->exists();

            if ($existe) {
                $validator->errors()->add(
                    'posicion_firmante',
                    'Ya existe un firmante en esa posición.'
                );
            }

            // validar máximo 3 firmantes
            $totalFirmantes = PersonalPlantilla::where('plantilla_id', $plantillaId)->count();

            if ($totalFirmantes >= 3) {
                $validator->errors()->add(
                    'personal_id',
                    'Esta plantilla ya tiene el máximo de firmantes.'
                );
            }
        });
    }

    public function attributes(): array
    {
        return [
            'personal_id' => 'personal',
            'posicion_firmante' => 'Posición del firmante',
            'posicion_x' => 'posición X',
            'posicion_y' => 'posición Y',
        ];
    }
}
