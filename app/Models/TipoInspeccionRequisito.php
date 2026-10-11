<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoInspeccionRequisito extends Model
{
    /** @use HasFactory<\Database\Factories\TipoClienteFactory> */
    use HasFactory;

    protected $table = 'tipos_inspecciones_requisitos';
    protected $fillable = [
        'tipo_inspeccion_id',
        'nombre',
        'estado'
    ];
}
