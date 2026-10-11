<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\DB;

class StoreUserLastLogin
{
    public function handle(Login $event): void
    {        
        $userId = $event->user->id;
        $ip = request()->ip();

        $alreadyLogged = DB::table('users_last_login')
            ->where('user_id', $userId)
            ->where('last_login_ip', $ip)
            ->where('last_login_at', '>=', now()->subSeconds(5))
            ->exists();

        if (! $alreadyLogged) {
            DB::table('users_last_login')->insert([
                'user_id' => $userId,
                'last_login_at' => now(),
                'last_login_ip' => $ip,
            ]);
        }
    }
}