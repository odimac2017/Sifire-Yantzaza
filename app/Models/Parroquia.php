<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parroquia extends Model
{
    /** @use HasFactory<\Database\Factories\ParroquiaFactory> */
    use HasFactory;

    protected $fillable = [
        'canton_id',
        'codigo',
        'nombre',
        'latitud',
        'longitud'
    ];
}
