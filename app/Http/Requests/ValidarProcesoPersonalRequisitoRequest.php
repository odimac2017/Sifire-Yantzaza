<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarProcesoPersonalRequisitoRequest extends FormRequest
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
            'tipo_inspeccion_requisito_id' => ['required', 'exists:tipos_inspecciones_requisitos,id'],
            'archivo' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }

    public function attributes()
    {
        return [
            'tipo_inspeccion_requisito_id' => 'requisito',
        ];
    }
}
