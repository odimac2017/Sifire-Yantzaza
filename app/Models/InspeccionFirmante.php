<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InspeccionFirmante extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'inspeccion_firmantes';
    protected $fillable = [
        'inspeccion_id',
        'personal_id',
        'orden_firma',
        'posicion_x_firma',
        'posicion_y_firma',
        'estado_firma',
        'fecha_firma',
        'error_firma',
    ];

    public function personal()
    {
        return $this->belongsTo(Personal::class);
    }
}
