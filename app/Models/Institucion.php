<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institucion extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'institucion';
    protected $fillable = [
        'ruc',
        'razon_social',
        'ubicacion',
        'direccion',
        'telefonos',
        'pagina_web',
        'email',
        'mision_institucional',
        'vision_institucional',
        'slogan',
        'latitud',
        'longitud'
    ];
}
