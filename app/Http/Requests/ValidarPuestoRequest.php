<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarPuestoRequest extends FormRequest
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
        $puestoId = $this->puesto?->id;
        
        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('puestos', 'nombre')->ignore($puestoId),
            ],
            'lugar_trabajo' => ['required', 'string', 'max:50'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes()
    {
        return [
            'lugar_trabajo' => 'lugar de trabajo',
        ];
    }
}
