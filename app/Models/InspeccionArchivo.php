<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InspeccionArchivo extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'inspeccion_archivos';
    protected $fillable = [
        'inspeccion_id',
        'nombre',
        'ruta',
        'tipo',
        'size',
    ];

    public function inspeccion(){
        return $this->belongsTo(Inspeccion::class);
    }
}
