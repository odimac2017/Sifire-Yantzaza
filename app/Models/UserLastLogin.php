<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLastLogin extends Model
{
    /** @use HasFactory<\Database\Factories\RolFactory> */
    use HasFactory;

    protected $table = 'users_last_login';
    protected $fillable = [
        'user_id',
        'last_login_at',
        'last_login_ip'
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
    ];
}
