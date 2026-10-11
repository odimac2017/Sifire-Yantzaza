<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarExtintorRequest extends FormRequest
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
        $extintorId = $this->extintor?->id;
        $periodo = $this->input('periodo');

        return [
            'periodo' => ['required', 'integer', 'min:2000', 'max:' . now()->year],
            /*
            'codigo' => [
                'required',
                'integer',
                'min:1',
                'digits_between:1,10',
                Rule::unique('extintores')
                ->ignore($extintorId)
                ->where(function ($query) use ($periodo) {
                    return $query->where('periodo', $periodo);
                }),
            ],
            */
            'tipo' => 'required|string',
            'capacidad' => 'required|numeric',
            'estado' => 'required|string',
        ];
    }
}
