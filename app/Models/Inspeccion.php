<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspeccion extends Model
{
    /** @use HasFactory<\Database\Factories\InspeccionFactory> */
    use HasFactory;

    protected $table = 'inspecciones';
    protected $fillable = [
        'plantilla_id',
        'proceso_permiso_id',
        'solicitud_inspeccion_id',
        'personal_id',
        'nombre_personal',
        'numero',
        'fecha_inspeccion',
        'tipo_funcion',
        'tipo_cons_hormigon',
        'tipo_cons_metalica',
        'tipo_cons_madera',
        'tipo_cons_otros',
        'tipo_comb_surtidores',
        'tipo_comb_diesel',
        'tipo_comb_gasolina',
        'tipo_comb_cap_diesel',
        'tipo_comb_cap_gasolina',
        'tipo_comb_transporte',
        'tipo_comb_vehiculo',
        'tipo_comb_placas',
        'tipo_comb_almacenamiento',
        'tipo_comb_venta',
        'tipo_comb_extintor',
        'tipo_comb_origen',
        'tipo_comb_destino',
        'tipo_comb_norma_inen',
        'tipo_comb_observaciones',
        'inst_elec_buenas',
        'inst_elec_malas',
        'inst_elec_internas',
        'inst_elec_externas',
        'inst_elec_generador',
        'inst_elec_transformador',
        'vent_natural',
        'vent_mecanica',
        'vent_adecuada',
        'vent_escasa',
        'area1',
        'area2',
        'area3',
        'area4',
        'area_total',
        'numero_participantes',
        'aforo_personas',
        'sist_ince_detectores_humo',
        'sist_ince_lamparas_emergencia',
        'sist_ince_gabinetes',
        'sist_ince_sprinklers',
        'sist_ince_alarma_incendio',
        'sist_ince_bombas_hidraulicas',
        'sist_ince_bombas_impulsion',
        'sist_ince_escaleras_emergencia',
        'sist_ince_puerta_escape',
        'sist_ince_puertas_contra_fuego',
        'sist_ince_senalizacion_emergencia',
        'sist_ince_tanques_reserva_agua',
        'sist_ince_espumogeno',
        'capacitacion_extintores',
        'observaciones',
        'recomendaciones',
        'porcentaje_inspeccion',
        'porcentaje_descuento',
        'valor_inspeccion',
        'valor_descuento',
        'valor_impresion_solicitud',
        'valor_impresion_informe',
        'valor_impresion_permiso',
        'valor_nota_credito',
        'valor_multa',
        'subtotal',
        'valor_total',
        'estado',
        'procesado',
        'plazo_permiso',
        'motivo_nuevo_plazo',
        'exento_pago',
        'motivo_exento_pago',
        'estado_firma',
        'ruta_pdf',
        'ruta_pdf_firmado',
        'codigo_verificacion'
    ];

    protected $casts = [
        'fecha_inspeccion' => 'datetime',
        'plazo_permiso' => 'date',
        'fecha_firma' => 'datetime',        
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    public function solicitudInspeccion(){
        return $this->belongsTo(SolicitudInspeccion::class);
    }

    public function personal(){
        return $this->belongsTo(Personal::class);
    }

    public function firmantes(){
        return $this->hasMany(InspeccionFirmante::class);
    }

    public function archivos(){
        return $this->hasMany(InspeccionArchivo::class);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }

    public function getFechaAttribute(){
        return $this->fecha_inspeccion;
    }
}
