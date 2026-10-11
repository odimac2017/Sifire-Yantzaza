<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermisoFuncionamiento extends Model
{
    /** @use HasFactory<\Database\Factories\InspeccionFactory> */
    use HasFactory;

    protected $table = 'permisos_funcionamientos';
    protected $fillable = [
        'plantilla_id',
        'proceso_permiso_id',
        'numero',
        'valor_inspeccion',
        'valor_impresion_solicitud',
        'valor_impresion_informe',
        'valor_impresion_permiso',
        'valor_reinspeccion',
        'valor_nota_credito',
        'valor_multa',
        'valor_total',
        'fecha_expedicion',
        'fecha_caducidad',
        'fecha_deposito',
        'documento_deposito',
        'observaciones',
        'estado',
        'pago_periodo_anterior',
        'estado_firma',
        'ruta_pdf',
        'ruta_pdf_firmado',
        'codigo_verificacion'
    ];

    protected $casts = [
        'fecha_expedicion' => 'date',
        'fecha_caducidad' => 'date',
        'fecha_deposito' => 'date',        
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    public function firmantes(){
        return $this->hasMany(PermisoFuncionamientoFirmante::class);
    }

    public function plantilla(){
        return $this->belongsTo(Plantilla::class,);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }

    public function getFechaAttribute(){
        return $this->fecha_expedicion;
    }
}
