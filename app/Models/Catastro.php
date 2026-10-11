<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catastro extends Model
{
    /** @use HasFactory<\Database\Factories\CatatrosFactory> */
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'provincia_id',
        'canton_id',
        'parroquia_id',
        'clave_catastral',
        'numero_predio',
        'periodo',
        'direccion',
        'valor_propiedad',
    ];

    protected $appends = [
        'valor_calculado',
        'valor_total_recaudado',
        'comprobante_info'
    ];

    public function getValorCalculadoAttribute(){
        return round((float) $this->valor_propiedad * 0.00015, 2);
    }

    public function getValorTotalRecaudadoAttribute(){
        return $this->recaudacionesCatastros->sum('valor_total');
    }

    public function getComprobanteInfoAttribute(){
        if (! $this->relationLoaded('recaudacionesCatastros')) {
            return null;
        }

        $rec = $this->recaudacionesCatastros->first();

        if (! $rec) {
            return null;
        }

        return [
            'numero_formateado' => $rec->numero_formateado,
            'fecha' => $rec->fecha?->format('d/m/Y'),  // Ahora funciona porque es Carbon
        ];
    }

    public function cliente(){
        return $this->belongsTo(Cliente::class);
    }

    public function parroquia(){
        return $this->belongsTo(Parroquia::class);
    }

    public function recaudacionesCatastros(){
        return $this->hasMany(RecaudacionCatastro::class);
    }
}
