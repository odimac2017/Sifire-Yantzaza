<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParteEmergenciaPersonalQap extends Model
{
    /** @use HasFactory<\Database\Factories\ParteEmergenciaFactory> */
    use HasFactory;

    protected $table = 'partes_emergencias_personal_qap';
    protected $fillable = [
        'parte_emergencia_id',
        'personal_id',
        'nombre_personal',
    ];
}
