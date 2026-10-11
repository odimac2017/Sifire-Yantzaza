<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecaudacionCatastro extends Model
{
    protected $table = 'recaudaciones_catastros';
    protected $fillable = [
        'plantilla_id',
        'catastro_id',
        'numero',
        'fecha',
        'porcentaje_bomberos',
        'valor_propiedad',
        'valor_total',
        'exento_pago',
        'motivo_exento_pago',
        'estado',
        'estado_firma',
        'ruta_pdf',
        'ruta_pdf_firmado',
        'codigo_verificacion'
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function catastro()
    {
        return $this->belongsTo(Catastro::class);
    }

    public function firmantes()
    {
        return $this->hasMany(RecaudacionCatastroFirmante::class, 'recaudacion_catastro_id');
    }

    public function plantilla()
    {
        return $this->belongsTo(Plantilla::class,);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute()
    {
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }
}
