<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarTarifarioRequest extends FormRequest
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
        $tarifarioId = $this->tarifario?->id;
        $parentId = $this->input('parent_id');

        $uniqueRule = function () use ($tarifarioId, $parentId) {
            return Rule::unique('tarifarios')
            ->ignore($tarifarioId)
            ->where(function ($query) use ($parentId) {
                if (is_null($parentId)) {
                    $query->whereNull('parent_id');
                } else {
                    $query->where('parent_id', $parentId);
                }
            });
        };

        return [
            'parent_id' => ['nullable', 'exists:tarifarios,id'],
            'codigo' => [
                'required',
                'string',
                'max:10',
                $uniqueRule(),
            ],
            'nombre' => [
                'required',
                'string',
                'max:200',
                $uniqueRule(),
            ],
        ];
    }

    public function attributes()
    {
        return [
            'codigo' => 'código',
        ];
    }
}
