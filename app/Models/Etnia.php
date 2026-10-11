<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etnia extends Model
{
    /** @use HasFactory<\Database\Factories\EtniaFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre'
    ];
}
