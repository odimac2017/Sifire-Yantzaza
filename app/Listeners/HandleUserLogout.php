<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Cache;

class HandleUserLogout
{
    public function handle(Logout $event): void
    {
        if (!$event->user) {
            return;
        }

        $userId = $event->user->id;

        Cache::forget("user-is-online-{$userId}");

        Cache::put(
            "user-last-seen-{$userId}",
            now(),
            now()->addMinutes(60)
        );
    }
}