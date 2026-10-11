<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TarifarioPeriodo extends Model
{
    /** @use HasFactory<\Database\Factories\TarifarioFactory> */
    use HasFactory;
    
    protected $table = 'tarifarios_periodos';

    protected $fillable = [
        'tarifario_id',
        'periodo',
        'valor',
        'gl',
        'cat',
        'riesgo',
        'valor_fijo'
    ];   
    
    protected $casts = [
        'valor' => 'float',
        'riesgo' => 'float',
        'valor_fijo' => 'float',
    ];
}
