<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // cache online
            Cache::put(
                'user-is-online-' . $user->id,
                true,
                now()->addMinutes(5)
            );

            Cache::put(
                "user-last-seen-{$user->id}",
                now(),
                now()->addMinutes(60)
            );
        }

        return $next($request);
    }
}