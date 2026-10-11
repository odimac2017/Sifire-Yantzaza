<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarInspeccionRequest extends FormRequest
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
            'area_total' => ['required', 'numeric', 'gt:0'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
            'recomendaciones' => ['nullable', 'string', 'max:1000'],
            'estado_informe' => ['required', 'string', 'in:APROBADO,REINSPECCION'],
            'extintores' => 'nullable|array',
            'extintores.*.numero' => 'nullable|numeric',
            'extintores.*.tipo' => 'required|string',
            'extintores.*.capacidad' => 'required|numeric',
            'extintores.*.estado' => 'required|string',
        ];
    }

    public function attributes(): array
    {
        return [
            'area_total' => 'área total',
            'estado_informe' => 'criterio técnico'
        ];
    }
}
