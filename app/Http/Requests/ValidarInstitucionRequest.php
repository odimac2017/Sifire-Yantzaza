<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarInstitucionRequest extends FormRequest
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
            'ruc' => ['required', 'max:13'],
            'razon_social' => ['required', 'max:100'],
            'ubicacion' => ['required', 'max:100'],
            'direccion' => ['required', 'max:100'],
            'telefonos' => ['required', 'max:50'],
            'email' => ['nullable', 'email', 'max:50'],
            'mision_institucional' => ['nullable', 'max:1000'],
            'vision_institucional' => ['nullable', 'max:1000'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    public function attributes(): array
    {
        return [
            'razon_social' => 'razón social',
            'ubicacion' => 'ubicación',
            'direccion' => 'dirección',
            'telefonos' => 'teléfonos',
            'mision_institucional' => 'misión institucional',
            'vision_institucional' => 'visión institucional',
        ];
    }
}
