<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarifario extends Model
{
    /** @use HasFactory<\Database\Factories\TarifarioFactory> */
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'codigo',
        'nombre',
        'estado'
    ];

    public function parent(){
        return $this->belongsTo(Tarifario::class, 'parent_id');
    }

    public function childrens(){
        return $this->hasMany(Tarifario::class, 'parent_id');
    }

    public function tarifarioPeriodo(){
        return $this->hasOne(TarifarioPeriodo::class);
    }

    public function periodos(){
        return $this->hasMany(TarifarioPeriodo::class);
    }
}
