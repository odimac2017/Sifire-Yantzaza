<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarConfiguracionRequest extends FormRequest
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
            'valor_duplicado_permisos' => ['required', 'decimal:0,2', 'min:0'],
            'valor_certificados' => ['required', 'decimal:0,2', 'min:0'],            
        ];
    }

    public function attributes()
    {
        return [
            'valor_duplicado_permisos' => 'valor',
            'valor_certificados' => 'valor',
        ];
    }
}
