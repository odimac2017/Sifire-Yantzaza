<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcesoPermisoRequisito extends Model
{
    /** @use HasFactory<\Database\Factories\ClienteFactory> */
    use HasFactory;

    protected $table = 'procesos_permisos_requisitos';
    protected $fillable = [
        'proceso_permiso_id',
        'tipo_inspeccion_requisito_id',
        'nombre',
        'ruta',
        'tipo',
        'size',
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    public function requisito(){
        return $this->belongsTo(TipoInspeccionRequisito::class, 'tipo_inspeccion_requisito_id', 'id');
    }
}
