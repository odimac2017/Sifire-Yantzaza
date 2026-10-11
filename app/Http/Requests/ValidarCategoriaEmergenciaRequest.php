<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarCategoriaEmergenciaRequest extends FormRequest
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
        $parentId = $this->input('parent_id');

        $uniqueRule = function () use ($parentId) {
            return Rule::unique('categorias_emergencias')
            ->ignore(optional($this->categoriaEmergencia)->id)
            ->where(function ($query) use ($parentId) {
                if (is_null($parentId)) {
                    $query->whereNull('parent_id');
                } else {
                    $query->where('parent_id', $parentId);
                }
            });
        };

        return [
            'parent_id' => ['nullable', 'exists:categorias_emergencias,id'],
            'codigo' => [
                'required',
                'max:10',
                $uniqueRule(),
            ],
            'nombre' => [
                'required',
                'max:300',
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
