<?php

namespace App\Http\Controllers;

use App\Models\ParteEmergencia;
use App\Models\Personal;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReporteEmergenciaController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('rango_fecha.from')
            ? Carbon::parse($request->input('rango_fecha.from'))->startOfDay()
            : now()->startOfMonth();

        $to = $request->input('rango_fecha.to')
            ? Carbon::parse($request->input('rango_fecha.to'))->endOfDay()
            : now()->endOfDay();

        $total = ParteEmergencia::whereBetween('partes_emergencias.fecha_salida', [$from, $to])
        ->count();

        $emergencias = Personal::query()
        ->with([
            'titulo',
            'user'
        ])
        ->where(function ($q) use ($from, $to) {
            $q->whereHas('emergenciasComoPrincipal', function ($q2) use ($from, $to) {
                $q2->whereBetween('fecha_salida', [$from, $to]);
            })
            ->orWhereHas('emergenciasComoQap', function ($q2) use ($from, $to) {
                $q2->whereBetween('fecha_salida', [$from, $to]);
            });
        })
        ->withCount([
            'emergenciasComoPrincipal as emergencias_como_principal_count' => function ($q) use ($from, $to) {
                $q->whereBetween('fecha_salida', [$from, $to]);
            },
            'emergenciasComoQap as emergencias_como_qap_count' => function ($q) use ($from, $to) {
                $q->whereBetween('fecha_salida', [$from, $to]);
            }
        ])
        ->get()
        ->map(function ($p) {
            return [
                'personal_id' => $p->id,
                'personal' => strtoupper(trim(
                    ($p->titulo?->abreviatura ?? '') . ' ' .
                    $p->nombres . ' ' . $p->apellidos
                )),
                'user' => [
                    'full_name_simplex' => trim(
                        $p->user?->first_name . ' ' .
                        $p->user?->first_surname
                    ),
                    'avatar' => $p->user?->avatar,
                    'is_online' => $p->user?->is_online ?? false,
                ],
                'total_atenciones' => $p->emergencias_como_principal_count,
                'total_qap' => $p->emergencias_como_qap_count,
                'total' => $p->emergencias_como_principal_count + $p->emergencias_como_qap_count,
            ];
        })
        ->sortByDesc('total')
        ->values();

        return inertia('reportes/emergencias', [
            'total' => $total,
            'emergencias' => $emergencias,
            'filters' => [
                'rango_fecha' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ]
            ]
        ]);
    }
}
