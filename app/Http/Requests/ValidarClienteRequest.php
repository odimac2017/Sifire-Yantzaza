<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarClienteRequest extends FormRequest
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
        $clienteId = $this->cliente?->id;

        return [
            'documento_id' => ['required', 'exists:documentos,id'],
            'provincia_id' => ['required', 'exists:provincias,id'],
            'canton_id' => ['required', 'exists:cantones,id'],
            'parroquia_id' => ['required', 'exists:parroquias,id'],
            'tipo_cliente_id' => ['required', 'exists:tipos_clientes,id'],
            'documento' => [
                'required',
                'string',
                'min:1',
                'max:15',
                Rule::unique('clientes', 'documento')->ignore($clienteId),
            ],
            'nombre' => ['required', 'string', 'max:255'],
            'documento_representante_legal' => ['nullable', 'string', 'max:20'],
            'nombre_representante_legal' => ['nullable', 'string', 'max:80'],
            'direccion' => ['required', 'string', 'max:100'],
            'telefonos' => ['nullable', 'string', 'max:30'],
            'email' => [
                'required',
                'email',
                'max:50',
                Rule::unique('clientes', 'email')->ignore($clienteId),
            ],
            'archivo_fisico' => [
                'nullable',
                'string',
                'max:50',
                //Rule::unique('clientes', 'archivo_fisico')->ignore($clienteId),
            ],
            'porcentaje_descuento' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
        ];
    }

    public function attributes()
    {
        return [
            'documento_id' => 'tipo de documento',
            'provincia_id' => 'provincia',
            'canton_id' => 'cantón',
            'parroquia_id' => 'parroquia',
            'tipo_cliente_id' => 'tipo de cliente',
            'direccion' => 'dirección',
            'telefonos' => 'teléfonos',
            'email' => 'email',
            'archivo_fisico' => 'archivo físico',
            'valor_descuento' => 'valor de descuento'
        ];
    }
}
