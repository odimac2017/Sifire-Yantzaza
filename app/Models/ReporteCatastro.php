<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReporteCatastro extends Model
{
    /** @use HasFactory<\Database\Factories\InstitucionFactory> */
    use HasFactory;

    protected $table = 'reportes_catastros';
    protected $fillable = [
        'numero',
        'secuencia',
        'fecha',
        'observaciones',
    ];
}
