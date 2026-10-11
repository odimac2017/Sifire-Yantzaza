<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoInspeccion extends Model
{
    /** @use HasFactory<\Database\Factories\TipoClienteFactory> */
    use HasFactory;

    protected $table = 'tipos_inspecciones';
    protected $fillable = [
        'nombre',
        'estado'
    ];
}
