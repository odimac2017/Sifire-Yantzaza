<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoCivil extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoCivilFactory> */
    use HasFactory;

    protected $table = 'estados_civiles';
    protected $fillable = [
        'nombre'
    ];
}
