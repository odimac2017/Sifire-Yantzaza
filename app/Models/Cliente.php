<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    /** @use HasFactory<\Database\Factories\ClienteFactory> */
    use HasFactory;

    protected $fillable = [
        'documento_id', 
        'provincia_id',
        'canton_id', 
        'parroquia_id', 
        'tipo_cliente_id',
        'documento', 
        'nombre',
        'documento_representante_legal',
        'nombre_representante_legal',
        'direccion',
        'telefonos',
        'email',
        'archivo_fisico',
        'porcentaje_descuento',
        'estado'
    ];

    public function parroquia(){
        return $this->belongsTo(Parroquia::class);
    }

    public function actividadesEconomicas(){
        return $this->hasMany(ActividadEconomica::class);
    }

    public function catastros(){
        return $this->hasMany(Catastro::class);
    }
}
