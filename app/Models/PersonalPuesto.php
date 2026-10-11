<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalPuesto extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalPuestoFactory> */
    use HasFactory;

    protected $table = 'personal_puestos';
    protected $fillable = [
        'personal_id',
        'puesto_id',        
        'predeterminado',
        'estado',
    ];

    public function personal(){
        return $this->belongsTo(Personal::class);
    }

    public function puesto(){
        return $this->belongsTo(Puesto::class);
    }
}
