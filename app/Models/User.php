<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'second_name',
        'first_surname',
        'second_surname',
        'email',
        'password',
    ];

    public function personal(){
        return $this->hasOne(Personal::class);
    }

    public function roles(){
        return $this->belongsToMany(Rol::class, 'users_roles', 'user_id', 'rol_id');
    }

    public function lastLogin(){
        return $this->hasOne(UserLastLogin::class)
            ->latestOfMany('last_login_at');
    }   

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    public function fullNameSimplex(): Attribute
    {
        return Attribute::make(
            get: fn () => collect([
                $this->first_name,
                $this->first_surname,
            ])->filter()->join(' ')
        );
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => collect([
                $this->first_name,
                $this->second_name,
                $this->first_surname,
                $this->second_surname,
            ])
            ->filter()
            ->join(' ')
        );
    }

    protected $appends = [
        'full_name_simplex',
        'full_name',
        'is_online',
        'last_seen_human',
    ];    

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function getIsOnlineAttribute(): bool
    {
        return Cache::has("user-is-online-{$this->id}");
    }

    public function getLastSeenHumanAttribute(): string
    {
        $lastSeen = Cache::get("user-last-seen-{$this->id}");

        if (!$lastSeen) {
            return 'Desconectado';
        }

        return Carbon::parse($lastSeen)->diffForHumans();
    }
}
