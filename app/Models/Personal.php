<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalFactory> */
    use HasFactory;

    protected $table = 'personal';
    protected $fillable = [
        'user_id',        
        'documento_id',
        'titulo_id',
        'genero_id',
        'grupo_sanguineo_id',
        'estado_civil_id',
        'etnia_id',
        'provincia_id',
        'canton_id',
        'parroquia_id',
        'documento',
        'apellidos',
        'nombres',
        'fecha_nacimiento',
        'direccion',
        'telefonos'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function personalPuestos(){
        return $this->hasMany(PersonalPuesto::class);
    }

    public function puestoPredeterminado(){
        return $this->hasOne(PersonalPuesto::class)
            ->where('predeterminado', 1);
    }

    protected $with = ['titulo'];
    protected $appends = ['nombre'];    

    public function titulo(){
        return $this->belongsTo(Titulo::class);
    }

    protected function nombre(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(
                trim(($this->titulo?->abreviatura ?? '') . ' ' .
                $this->nombres . ' ' .
                $this->apellidos)
            )
        );
    }

    public function firma(){
        return $this->hasOne(PersonalFirma::class);
    }

    public function emergenciasComoPrincipal()
    {
        return $this->hasMany(ParteEmergencia::class, 'personal_id');
    }

    public function emergenciasComoQap()
    {
        return $this->belongsToMany(
            ParteEmergencia::class,
            'partes_emergencias_personal_qap',
            'personal_id',
            'parte_emergencia_id'
        );
    }
/*
    public function puestoPredeterminado(){
        return $this->belongsToMany(Puesto::class, 'personal_puestos')
        ->withPivot(['predeterminado', 'estado'])
        ->wherePivot('predeterminado', 1)
        ->wherePivot('estado', 'ACTIVO')
        ->limit(1);
    }*/
}
