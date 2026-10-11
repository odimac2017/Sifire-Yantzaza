<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';
    protected $fillable = [
        'plantilla_id',
        'proceso_permiso_id',
        'personal_id',
        'nombre_personal',
        'numero',
        'numero_notificacion',
        'documento_representante_legal',
        'nombre_representante_legal',
        'documento_persona_recibe',
        'nombre_persona_recibe',
        'fecha_entrega',
        'fecha_plazo',
        'fecha_cancela',
        'motivo_cancela',
        'observaciones',
        'estado',
        'ruta_pdf',
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime',
        'fecha_plazo' => 'date',
        'fecha_cancela' => 'datetime',        
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    public function personal(){
        return $this->belongsTo(Personal::class);
    }

    public function archivos(){
        return $this->hasMany(NotificacionArchivo::class);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }
}
