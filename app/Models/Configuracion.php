<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    /** @use HasFactory<\Database\Factories\ConfiguracionFactory> */
    use HasFactory;

    protected $table = 'configuracion';
    protected $fillable = [        
        'plazo_reinspeccion',
        'plazo_obtencion_permiso',
        'plazo_primera_notificacion',
        'plazo_segunda_notificacion',
        'plazo_tercera_notificacion',
        'porcentaje_reinspeccion',
        'porcentaje_multas',
        'porcentaje_planos',
        'valor_duplicado_permisos',
        'valor_certificados',
    ];
}
