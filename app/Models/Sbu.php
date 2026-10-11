<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sbu extends Model
{   
    use HasFactory;

    protected $fillable = [
        'periodo',
        'valor',
    ];

    protected $casts = [
        'valor' => 'float',
    ];
}
