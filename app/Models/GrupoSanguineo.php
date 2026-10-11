<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrupoSanguineo extends Model
{
    /** @use HasFactory<\Database\Factories\GrupoSanguineoFactory> */
    use HasFactory;

    protected $table = 'grupos_sanguineos';
    protected $fillable = [
        'nombre'
    ];
}
