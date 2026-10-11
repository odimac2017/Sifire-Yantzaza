<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParteEmergencia extends Model
{
    /** @use HasFactory<\Database\Factories\ParteEmergenciaFactory> */
    use HasFactory;

    protected $table = 'partes_emergencias';
    protected $fillable = [
        'plantilla_id',
        'categoria_id',
        'provincia_id',
        'canton_id',
        'parroquia_id',
        'personal_id',
        'personal_puesto_id',
        'personal_puesto_oficial_id',
        'categoria1',
        'categoria2',
        'nombre_personal',
        'puesto_personal',
        'nombre_oficial',
        'puesto_oficial',
        'numero',
        'direccion',
        'fecha_salida',
        'fecha_llegada',
        'nombre_propietario',
        'tipo_cons_hormigon',
        'tipo_cons_cana',
        'tipo_cons_madera',
        'tipo_cons_mixta',
        'tipo_cons_metalica',
        'tipo_cons_ladrillo',
        'danos_materiales',
        'victimas',
        'origen',
        'cias_asisten',
        'equipos_materiales',
        'personal_externo',
        'novedades',
        'ver_geolocalizacion',
        'latitud',
        'longitud',
        'ruta_mapa',
        'ruta_pdf'
    ];

    protected $casts = [
        'fecha_salida' => 'datetime',
        'fecha_llegada' => 'datetime',
    ];

    public function parroquia(){
        return $this->belongsTo(Parroquia::class);
    }

    public function personal(){
        return $this->belongsTo(Personal::class);
    }

    public function personalesQap(){
        return $this->belongsToMany(Personal::class, 'partes_emergencias_personal_qap', 'parte_emergencia_id', 'personal_id')->withPivot('nombre_personal');
    }

    public function archivos(){
        return $this->hasMany(ParteEmergenciaArchivo::class);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }
}
