<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ItemsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // ユーザーがリクエストを行うことを許可
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'productName' => 'required|string',
            'modelNumber' => 'required|string',
            'location' => 'required|string',
            'quantityChange' => 'required|numeric',
            'remarks' => 'nullable|string',
        ];
    }
}