<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Extintor extends Model
{
    /** @use HasFactory<\Database\Factories\ExtintorFactory> */
    use HasFactory;

    protected $table = 'extintores';
    protected $fillable = [
        'proceso_permiso_id',
        'periodo',
        'numero',
        'tipo',
        'capacidad',
        'estado'
    ];

    public function procesoPermiso(){
        return $this->belongsTo(ProcesoPermiso::class);
    }

    protected $appends = ['numero_formateado'];

    public function getNumeroFormateadoAttribute(){
        return str_pad($this->numero, 7, '0', STR_PAD_LEFT);
    }
}
