<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaEmergencia extends Model
{
    /** @use HasFactory<\Database\Factories\CategoriaEmergenciaFactory> */
    use HasFactory;

    protected $table = 'categorias_emergencias';
    protected $fillable = [
        'parent_id',
        'codigo',
        'nombre'
    ];

    public function parent(){
        return $this->belongsTo(CategoriaEmergencia::class, 'parent_id');
    }

    public function childrens(){
        return $this->hasMany(CategoriaEmergencia::class, 'parent_id');
    }    
}
