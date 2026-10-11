<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarPermisoFuncionamientoRequest extends FormRequest
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
            'proceso_permiso_id' => 'required|exists:procesos_permisos,id',
            'fecha_expedicion' => 'required|date',
            'fecha_caducidad' => 'required|date|after_or_equal:fecha_expedicion',
            'fecha_deposito' => 'required|date|before_or_equal:today',
            'documento_deposito' => 'required|string|max:50',
            'observaciones' => 'nullable|string|max:1000',
        ];
    }

    public function attributes()
    {
        return [
            'fecha_expedicion' => 'fecha de expedición',
            'fecha_caducidad' => 'fecha de caducidad',
            'fecha_deposito' => 'fecha de depósito',
            'documento_deposito' => 'documento de depósito',
        ];
    }
}
