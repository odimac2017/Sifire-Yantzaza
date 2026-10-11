<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Numeracion extends Model
{
    /** @use HasFactory<\Database\Factories\GrupoSanguineoFactory> */
    use HasFactory;

    protected $table = 'numeraciones';
    protected $fillable = [
        'nombre',
        'formato'
    ];
}
