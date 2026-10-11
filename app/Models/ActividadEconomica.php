<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadEconomica extends Model
{
    /** @use HasFactory<\Database\Factories\ActividadEconomicaFactory> */
    use HasFactory;

    protected $table = 'actividades_economicas';
    protected $fillable = [
        'cliente_id',
        'provincia_id',
        'canton_id',
        'parroquia_id',
        'tipo_actividad',
        'e_nombre_comercial',
        'e_actividad_principal',
        'e_actividad_secundaria',
        'e_sector',
        'e_direccion',
        'e_edificio',
        'e_piso',
        'e_departamento',
        'e_telefonos',
        'e_latitud',
        'e_longitud',
        'e_ruta_mapa',
        'v_placa',
        'v_marca',
        'v_tipo',
        'v_clase',
        'v_color',
        'fecha_inicio',
        'estado'
    ];

    public function provincia(){
        return $this->belongsTo(Provincia::class);
    }

    public function canton(){
        return $this->belongsTo(Canton::class);
    }

    public function parroquia(){
        return $this->belongsTo(Parroquia::class);
    }

    public function cliente(){
        return $this->belongsTo(Cliente::class);
    }

    public function procesosPermisos(){
        return $this->hasMany(ProcesoPermiso::class);
    }   
    
    public function permisosFuncionamientos(){
        return $this->hasManyThrough(
            PermisoFuncionamiento::class,
            ProcesoPermiso::class,
            'actividad_economica_id', // FK en procesos_permisos
            'proceso_permiso_id',     // FK en permisos_funcionamientos
            'id',                     // PK de actividades_economicas
            'id'                      // PK de procesos_permisos
        );
    }

    public function ultimoProcesoPermiso(){
        return $this->hasOne(
            ProcesoPermiso::class,
            'actividad_economica_id'
        )
        ->where('tipo_permiso_id', 2)
        ->whereHas('permisoFuncionamiento')
        ->latestOfMany();
    }
}
