<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provincia extends Model
{
    /** @use HasFactory<\Database\Factories\ProvinciaFactory> */
    use HasFactory;

    protected $fillable = [
        'codigo',
        'nombre'
    ];
}
