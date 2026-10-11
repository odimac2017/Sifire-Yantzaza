<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecaudacionCatastroFirmante extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'recaudacion_catastro_firmantes';
    protected $fillable = [
        'recaudacion_catastro_id',
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

    public function personalPlantilla()
    {
        return $this->belongsTo(PersonalPlantilla::class, 'personal_id', 'personal_id');
    }
}
