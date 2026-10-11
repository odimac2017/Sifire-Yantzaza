<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SolicitudInspeccion extends Model
{
    /** @use HasFactory<\Database\Factories\ClienteFactory> */
    use HasFactory;

    protected $table = 'solicitudes_inspecciones';
    protected $fillable = [
        'plantilla_id', 
        'proceso_permiso_id',
        'personal_id', 
        'nombre_personal', 
        'tipo_solicitud',
        'numero', 
        'fecha_solicitud',
        'fecha_inspeccion',
        'observaciones',
        'estado',
        'ruta_pdf'
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    public function personal(){
        return $this->belongsTo(Personal::class);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }
}
