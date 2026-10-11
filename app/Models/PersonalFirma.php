<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalFirma extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalFactory> */
    use HasFactory;

    protected $table = 'personal_firmas';
    protected $fillable = [
        'personal_id',        
        'nombre_titular',
        'cedula_titular',
        'password',
        'entidad_emisora',
        'fecha_emision',
        'fecha_expiracion',
        'solicitar_password',
        'nombre_archivo',
        'ruta',
    ];

    protected $casts = [        
        'fecha_emision' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'solicitar_password' => 'boolean',
    ];

    public function personal(){
        return $this->belongsTo(Personal::class);
    }
}
