<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Puesto extends Model
{
    /** @use HasFactory<\Database\Factories\PuestoFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'lugar_trabajo',
        'observaciones',
        'estado'
    ];
}
