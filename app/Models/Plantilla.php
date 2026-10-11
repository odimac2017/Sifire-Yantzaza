<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plantilla extends Model
{
    /** @use HasFactory<\Database\Factories\PlantillaFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'predeterminado',
        'vista_blade',
        'tamano_papel',
        'ancho',
        'alto',
        'orientacion_papel',
    ];

    public function personalPlantilla(){
        return $this->hasMany(PersonalPlantilla::class);
    }
}
