<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarPersonalRequest extends FormRequest
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
        $personalId = $this->personal?->id;

        return [
            'titulo_id' => ['required', 'exists:titulos,id'],
            'documento_id' => ['required', 'exists:documentos,id'],
            'genero_id' => ['required', 'exists:generos,id'],
            'gruposanguineo_id' => ['required', 'exists:grupos_sanguineos,id'],
            'estadocivil_id' => ['required', 'exists:estados_civiles,id'],
            'provincia_id' => ['required', 'exists:provincias,id'],
            'canton_id' => ['required', 'exists:cantones,id'],
            'parroquia_id' => ['required', 'exists:parroquias,id'],
            'etnia_id' => ['required', 'exists:etnias,id'],
            'documento' => [
                'required',
                'string',
                'min:1',
                'max:15',
                Rule::unique('personal', 'documento')->ignore($personalId),
            ],
            'apellidos' => ['required', 'string', 'max:255'],
            'nombres' => ['required', 'string', 'max:255'],
            'direccion' => ['required', 'string', 'max:100'],
            'telefonos' => ['nullable', 'string', 'max:30'],
            'puestos' => ['array'],
            'puestos.*.id' => ['required', 'exists:puestos,id'],
            'puestos.*.estado' => ['required', 'in:ACTIVO,INACTIVO'],
            'puestos.*.predeterminado' => ['required', 'boolean'],
        ];
    }

    public function attributes()
    {
        return [
            'titulo_id' => 'título',
            'documento_id' => 'tipo de documento',
            'genero_id' => 'género',
            'gruposanguineo_id' => 'grupo sanguíneo',
            'estadocivil_id' => 'estado civil',
            'provincia_id' => 'provincia',
            'canton_id' => 'cantón',
            'parroquia_id' => 'parroquia',
            'direccion' => 'dirección',
            'telefonos' => 'teléfonos',
        ];
    }
}
