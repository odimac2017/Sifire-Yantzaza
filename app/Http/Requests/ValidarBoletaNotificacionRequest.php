<?php

namespace App\Http\Requests;

use App\Models\ProcesoPermiso;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarBoletaNotificacionRequest extends FormRequest
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
        $proceso = ProcesoPermiso::with('cliente')->find($this->proceso_permiso_id);
        
        return [
            'proceso_permiso_id' => ['required','exists:procesos_permisos,id'],
            'documento_representante_legal' => [
                Rule::requiredIf($proceso?->cliente?->tipo_cliente_id == 2),
                'nullable',
                'string',
                'max:20'
            ],
            'nombre_representante_legal' => [
                Rule::requiredIf($proceso?->cliente?->tipo_cliente_id == 2),
                'nullable',
                'string',
                'max:100'
            ],
            'documento_persona_recibe' => ['nullable','string','max:20'],
            'nombre_persona_recibe' => ['nullable','string','max:100'],
            'observaciones' => ['nullable','string','max:300'],
        ];
    }

    public function attributes(): array
    {
        return [
            'documento_representante_legal' => 'documento del representante legal',
            'nombre_representante_legal' => 'nombre del representante legal',
            'documento_persona_recibe' => 'documento de la persona que recibe la boleta',
            'nombre_persona_recibe' => 'nombre de la persona que recibe la boleta',
        ];
    }
}
