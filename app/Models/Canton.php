<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Canton extends Model
{
    /** @use HasFactory<\Database\Factories\CantonFactory> */
    use HasFactory;

    protected $table = 'cantones';
    
    protected $fillable = [
        'provincia_id',
        'codigo',
        'nombre'
    ];
}
