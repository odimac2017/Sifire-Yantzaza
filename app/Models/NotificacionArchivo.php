<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificacionArchivo extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'notificacion_archivos';
    protected $fillable = [
        'inspeccion_id',
        'nombre',
        'ruta',
        'tipo',
        'size',
    ];

    public function notificacion(){
        return $this->belongsTo(Notificacion::class);
    }
}
