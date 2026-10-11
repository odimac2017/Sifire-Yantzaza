<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use App\Models\PermisoFuncionamiento;
use App\Models\RecaudacionCatastro;
use App\Models\SolicitudInspeccion;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportePrevencionController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('rango_fecha.from')
            ? Carbon::parse($request->input('rango_fecha.from'))->startOfDay()
            : now()->startOfMonth();

        $to = $request->input('rango_fecha.to')
            ? Carbon::parse($request->input('rango_fecha.to'))->endOfDay()
            : now()->endOfDay();

        if ($from->isSameDay($to)) {
            // 🟢 HOY vs AYER
            $fromPrev = (clone $from)->subDay()->startOfDay();
            $toPrev = (clone $to)->subDay()->endOfDay();

        } elseif ($from->isSameMonth($to) && $from->day === 1) {
            // 🔵 ESTE MES (hasta hoy) vs MISMO PERIODO MES ANTERIOR

            $days = $from->diffInDays($to);

            $fromPrev = (clone $from)->subMonth()->startOfMonth();
            $toPrev = (clone $fromPrev)->addDays($days)->endOfDay();

        } elseif ($from->isSameYear($to) && $from->dayOfYear === 1) {
            // 🟣 ESTE AÑO (hasta hoy) vs MISMO PERIODO AÑO ANTERIOR

            $days = $from->diffInDays($to);

            $fromPrev = (clone $from)->subYear()->startOfYear();
            $toPrev = (clone $fromPrev)->addDays($days)->endOfDay();

        } else {
            // 🔴 RANGO PERSONALIZADO (últimos 6 meses, etc.)
            $diffDays = $from->diffInDays($to);

            $fromPrev = (clone $from)->subDays($diffDays + 1);
            $toPrev = (clone $to)->subDays($diffDays + 1);
        }

        $solicitudesInspeccionesActual = SolicitudInspeccion::whereBetween('fecha_solicitud', [$from, $to])
        ->where('tipo_solicitud', 'IN')
        ->count();

        $solicitudesInspeccionesAnterior = SolicitudInspeccion::whereBetween('fecha_solicitud', [$fromPrev, $toPrev])
        ->where('tipo_solicitud', 'IN')
        ->count();
        
         $solicitudesInspeccionesTrend = SolicitudInspeccion::whereBetween('fecha_solicitud', [$from, $to])
        ->selectRaw('DATE(fecha_solicitud) as fecha, COUNT(*) as total')
        ->where('tipo_solicitud', 'IN')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();

        $solicitudesReinspeccionesActual = SolicitudInspeccion::whereBetween('fecha_solicitud', [$from, $to])
        ->where('tipo_solicitud', 'RE')
        ->count();
        
        $solicitudesReinspeccionesAnterior = SolicitudInspeccion::whereBetween('fecha_solicitud', [$fromPrev, $toPrev])
        ->where('tipo_solicitud', 'RE')
        ->count();
        
        $solicitudesReinspeccionesTrend = SolicitudInspeccion::whereBetween('fecha_solicitud', [$from, $to])
        ->selectRaw('DATE(fecha_solicitud) as fecha, COUNT(*) as total')
        ->where('tipo_solicitud', 'RE')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $inspeccionesActual = Inspeccion::whereBetween('fecha_inspeccion', [$from, $to])
        ->count();
        
        $inspeccionesAnterior = Inspeccion::whereBetween('fecha_inspeccion', [$fromPrev, $toPrev])
        ->count();
    
        $inspeccionesTrend = Inspeccion::whereBetween('fecha_inspeccion', [$from, $to])
        ->selectRaw('DATE(fecha_inspeccion) as fecha, COUNT(*) as total')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $permisosFuncionamientosActual = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->where('pago_periodo_anterior', 0)
        ->count();
        
        $permisosFuncionamientosAnterior = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$fromPrev, $toPrev])
        ->where('estado', 'EXPEDIDO')
        ->where('pago_periodo_anterior', 0)
        ->count();
        
        $permisosFuncionamientosTrend = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->selectRaw('DATE(fecha_expedicion) as fecha, COUNT(*) as total')
        ->where('pago_periodo_anterior', 0)
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $permisosFuncionamientosAnterioresActual = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->where('pago_periodo_anterior', 1)
        ->where('estado', 'EXPEDIDO')
        ->count();
        
        $permisosFuncionamientosAnterioresAnterior = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$fromPrev, $toPrev])
        ->where('pago_periodo_anterior', 1)    
        ->where('estado', 'EXPEDIDO')
        ->count();
        
        $permisosFuncionamientosAnterioresTrend = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->selectRaw('DATE(fecha_expedicion) as fecha, COUNT(*) as total')
        ->where('pago_periodo_anterior', 1)
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();

        $recaudacionesCatastrosActual = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->count();
        
        $recaudacionesCatastrosAnterior = RecaudacionCatastro::whereBetween('fecha', [$fromPrev, $toPrev])
        ->where('estado', 'EXPEDIDO')
        ->count();
        
        $recaudacionesCatastrosTrend = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->selectRaw('DATE(fecha), COUNT(*) as total')
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $recaudacionPermisosFuncionamientosActual = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->where('pago_periodo_anterior', 0)
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');

        $recaudacionPermisosFuncionamientosAnterior = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$fromPrev, $toPrev])
        ->where('pago_periodo_anterior', 0)    
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');
    
        $recaudacionPermisosFuncionamientosTrend = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->selectRaw('DATE(fecha_expedicion) as fecha, SUM(valor_total) as total')
        ->where('pago_periodo_anterior', 0)
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $recaudacionPermisosFuncionamientosAnterioresActual = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->where('pago_periodo_anterior', 1)
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');

        $recaudacionPermisosFuncionamientosAnterioresAnterior = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$fromPrev, $toPrev])
        ->where('pago_periodo_anterior', 1)    
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');
    
        $recaudacionPermisosFuncionamientosAnterioresTrend = PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
        ->selectRaw('DATE(fecha_expedicion) as fecha, SUM(valor_total) as total')
        ->where('pago_periodo_anterior', 1)
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $recaudacionCatastrosActual = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');

        $recaudacionCatastrosAnterior = RecaudacionCatastro::whereBetween('fecha', [$fromPrev, $toPrev])
        ->where('estado', 'EXPEDIDO')
        ->sum('valor_total');
        
        $recaudacionCatastrosTrend = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->selectRaw('DATE(fecha), SUM(valor_total) as total')
        ->where('estado', 'EXPEDIDO')
        ->groupBy('fecha')
        ->orderBy('fecha')
        ->get();
        
        $totalRecaudacionActual = $recaudacionPermisosFuncionamientosActual + $recaudacionPermisosFuncionamientosAnterioresActual + $recaudacionCatastrosActual;

        $totalRecaudacionAnterior = $recaudacionPermisosFuncionamientosAnterior + $recaudacionPermisosFuncionamientosAnterioresAnterior + $recaudacionCatastrosAnterior;

        $recaudacionTrend = collect()
        ->merge(
            PermisoFuncionamiento::whereBetween('fecha_expedicion', [$from, $to])
                ->selectRaw('DATE(fecha_expedicion) as fecha, SUM(valor_total) as total')
                ->where('estado', 'EXPEDIDO')
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get()
        )
        ->merge(
            RecaudacionCatastro::whereBetween('fecha', [$from, $to])
                ->selectRaw('DATE(fecha) as fecha, SUM(valor_total) as total')
                ->where('estado', 'EXPEDIDO')
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get()
        )
        ->groupBy('fecha')
        ->map(function ($items) {
            return [
                'fecha' => $items->first()['fecha'],
                'total' => $items->sum('total')
            ];
        })
        ->values();

        return inertia('reportes/prevenciones', [
            'totales' => [
                'solicitudesInspecciones' => [
                    'total' => $solicitudesInspeccionesActual,
                    'growth' => $this->crecimiento($solicitudesInspeccionesActual, $solicitudesInspeccionesAnterior),
                    'trend' => $solicitudesInspeccionesTrend,
                ],
                'solicitudesReinspecciones' => [
                    'total' => $solicitudesReinspeccionesActual,
                    'growth' => $this->crecimiento($solicitudesReinspeccionesActual, $solicitudesReinspeccionesAnterior),
                    'trend' => $solicitudesReinspeccionesTrend,
                ],
                'inspecciones' => [
                    'total' => $inspeccionesActual,
                    'growth' => $this->crecimiento($inspeccionesActual, $inspeccionesAnterior),
                    'trend' => $inspeccionesTrend,
                ],
                'permisosFuncionamientos' => [
                    'total' => $permisosFuncionamientosActual,
                    'growth' => $this->crecimiento($permisosFuncionamientosActual, $permisosFuncionamientosAnterior),
                    'trend' => $permisosFuncionamientosTrend,
                ],
                'permisosFuncionamientosAnteriores' => [
                    'total' => $permisosFuncionamientosAnterioresActual,
                    'growth' => $this->crecimiento($permisosFuncionamientosAnterioresActual, $permisosFuncionamientosAnterioresAnterior),
                    'trend' => $permisosFuncionamientosAnterioresTrend,
                ],
                'recaudacionesCatastros' => [
                    'total' => $recaudacionesCatastrosActual,
                    'growth' => $this->crecimiento($recaudacionesCatastrosActual, $recaudacionesCatastrosAnterior),
                    'trend' => $recaudacionesCatastrosTrend,
                ],
                'recaudacionPermisosFuncionamientos' => [
                    'total' => $recaudacionPermisosFuncionamientosActual,
                    'growth' => $this->crecimiento($recaudacionPermisosFuncionamientosActual, $recaudacionPermisosFuncionamientosAnterior),
                    'trend' => $recaudacionPermisosFuncionamientosTrend,
                ],
                'recaudacionPermisosFuncionamientosAnteriores' => [
                    'total' => $recaudacionPermisosFuncionamientosAnterioresActual,
                    'growth' => $this->crecimiento($recaudacionPermisosFuncionamientosAnterioresActual, $recaudacionPermisosFuncionamientosAnterioresAnterior),
                    'trend' => $recaudacionPermisosFuncionamientosAnterioresTrend,
                ],
                'recaudacionCatastros' => [
                    'total' => $recaudacionCatastrosActual,
                    'growth' => $this->crecimiento($recaudacionCatastrosActual, $recaudacionCatastrosAnterior),
                    'trend' => $recaudacionCatastrosTrend,
                ],
                'recaudacionTotal' => [
                    'total' => $totalRecaudacionActual,
                    'growth' => $this->crecimiento($totalRecaudacionActual, $totalRecaudacionAnterior),
                    'trend' => $recaudacionTrend ?? [],
                ],
            ],
            'filters' => [
                'rango_fecha' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ]
            ]
        ]);
    }

    public function crecimiento($actual, $anterior)
    {
        // 🚫 Ambos en 0
        if ($actual == 0 && $anterior == 0) {
            return 0;
        }

        // 🚀 Antes era 0 y ahora hay valor
        if ($anterior == 0) {
            return 100; // o puedes devolver null si quieres manejarlo distinto
        }

        $growth = (($actual - $anterior) / $anterior) * 100;

        // 🧠 Limitar valores extremos (opcional pero recomendado)
        if ($growth > 999) {
            return 999;
        }

        if ($growth < -999) {
            return -999;
        }

        return round($growth, 1);
    }
}
