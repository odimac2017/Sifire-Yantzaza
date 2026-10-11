<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotaCredito extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalPuestoFactory> */
    use HasFactory;

    protected $table = 'notas_creditos';
    protected $fillable = [
        'cliente_id',
        'actividad_economica_id',        
        'valor_total',
        'saldo',
        'observaciones',
    ];

    protected $casts = [
        'valor' => 'float',
        'saldo' => 'float'
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function actividadEconomica()
    {
        return $this->belongsTo(ActividadEconomica::class);
    }
}
