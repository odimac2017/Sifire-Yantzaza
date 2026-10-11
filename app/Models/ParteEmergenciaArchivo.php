<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParteEmergenciaArchivo extends Model
{
    protected $table = 'partes_emergencias_archivos';
    protected $fillable = [
        'parte_emergencia_id',
        'nombre',
        'ruta',
        'tipo',
        'size',
    ];

    public function parteEmergencia(){
        return $this->belongsTo(ParteEmergencia::class);
    }
}
