<?php 

namespace App\Http\Controllers;

use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Inspeccion;
use App\Models\PermisoFuncionamiento;
use App\Models\ParteEmergencia;
use App\Models\SolicitudInspeccion;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $year = Carbon::now()->year;

        $inspecciones = Inspeccion::selectRaw('MONTH(created_at) as mes, COUNT(*) as total')
            ->whereYear('created_at', $year)
            ->groupBy('mes')
            ->pluck('total', 'mes');

        $permisos = PermisoFuncionamiento::selectRaw('MONTH(created_at) as mes, COUNT(*) as total')
            ->whereYear('created_at', $year)
            ->where('estado', 'EXPEDIDO')
            ->groupBy('mes')
            ->pluck('total', 'mes');

        $partes = ParteEmergencia::selectRaw('MONTH(created_at) as mes, COUNT(*) as total')
            ->whereYear('created_at', $year)
            ->groupBy('mes')
            ->pluck('total', 'mes');

        $solicitudesInspecciones = SolicitudInspeccion::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica.parroquia',
            'procesoPermiso.tipoPermiso:id,nombre',
            'personal.user',
        ])
        ->whereDate('fecha_inspeccion', now())
        ->orderBy('fecha_inspeccion')
        ->orderBy('numero')
        ->get();

        return Inertia::render('dashboard', [
            'inspecciones' => $inspecciones,
            'permisos' => $permisos,
            'partes' => $partes,
            'solicitudesInspecciones' => $solicitudesInspecciones,
            'auth_personal_id' => Auth::user()->personal?->id ?? null,
        ]);
    }
}