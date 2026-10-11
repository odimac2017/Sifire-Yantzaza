<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\StoreUserLastLogin;
use App\Listeners\HandleUserLogout;
use Illuminate\Support\Facades\Event;
use Carbon\Carbon;
use App\Models\Inspeccion;
use App\Models\Notificacion;
use App\Models\PermisoFuncionamiento;
use App\Models\RecaudacionCatastro;
use App\Models\SolicitudInspeccion;
use App\Observers\InspeccionObserver;
use App\Observers\NotificacionObserver;
use App\Observers\PermisoFuncionamientoObserver;
use App\Observers\RecaudacionCatastroObserver;
use App\Observers\SolicitudInspeccionObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Carbon::setLocale(config('app.locale'));

        // Login → guardar historial
        Event::listen(
            Login::class,
            StoreUserLastLogin::class
        );

        // Logout → marcar offline
        Event::listen(
            Logout::class,
            HandleUserLogout::class
        );

        SolicitudInspeccion::observe(SolicitudInspeccionObserver::class);
        Inspeccion::observe(InspeccionObserver::class);
        PermisoFuncionamiento::observe(PermisoFuncionamientoObserver::class);
        Notificacion::observe(NotificacionObserver::class);
        RecaudacionCatastro::observe(RecaudacionCatastroObserver::class);
    }
}