<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoNotaCredito extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalPuestoFactory> */
    use HasFactory;

    protected $table = 'movimientos_notas_creditos';
    protected $fillable = [
        'nota_credito_id',
        'proceso_permiso_id',        
        'valor',
        'observaciones',
    ];

    protected $casts = [
        'valor' => 'float',
    ];
}
