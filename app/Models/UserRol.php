<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRol extends Model
{
    /** @use HasFactory<\Database\Factories\RolFactory> */
    use HasFactory;

    protected $table = 'users_roles';
    protected $fillable = [
        'user_id',
        'rol_id'
    ];
}
