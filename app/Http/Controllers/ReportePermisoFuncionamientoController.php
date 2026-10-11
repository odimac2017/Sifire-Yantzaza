<?php

namespace App\Http\Controllers;

use App\Exports\PermisosFuncionamientosExport;
use App\Http\Requests\ValidarReportePermisoFuncionamientoRequest;
use App\Models\Institucion;
use App\Models\Numeracion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\PermisoFuncionamiento;
use App\Models\Personal;
use App\Models\Plantilla;
use App\Models\ReportePermisoFuncionamiento;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportePermisoFuncionamientoController extends Controller
{
    public function index(Request $request)
    {
        $fecha = $request->filled('fecha') && strtotime($request->fecha)
            ? Carbon::parse($request->fecha)
            : now();
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'EXPEDIDO') : null; 

        // fecha actual
        $currentDate = $fecha->toDateString();

        $previousDate = $fecha->copy()->subYear()->toDateString();

        $permisos = PermisoFuncionamiento::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica',
            'procesoPermiso.tipoPermiso'
        ])
        ->where(function ($query) use ($currentDate, $previousDate, $estado) {
            // permisos de la fecha actual
            $query->where(function ($q) use ($currentDate, $estado) {
                $q->whereDate('fecha_expedicion', $currentDate);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            })
            // permisos de la misma fecha del año anterior
            ->orWhere(function ($q) use ($previousDate, $estado) {
                $q->whereDate('fecha_expedicion', $previousDate)
                    ->where('pago_periodo_anterior', 1);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            });
        })
        ->orderBy('numero')
        ->paginate(10)
        ->withQueryString();

        $reporte = ReportePermisoFuncionamiento::where('fecha', $fecha)->first();

        $totales = PermisoFuncionamiento::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'EXPEDIDO' THEN 1 ELSE 0 END) as expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN 1 ELSE 0 END) as anulados,

            SUM(CASE WHEN estado = 'EXPEDIDO' THEN valor_total ELSE 0 END) as monto_expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN valor_total ELSE 0 END) as monto_anulados,

            SUM(valor_total) as monto_total
        ")
        ->where(function ($query) use ($currentDate, $previousDate, $estado) {
            // permisos de la fecha actual
            $query->where(function ($q) use ($currentDate, $estado) {
                $q->whereDate('fecha_expedicion', $currentDate);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            })
            // permisos de la misma fecha del año anterior
            ->orWhere(function ($q) use ($previousDate, $estado) {
                $q->whereDate('fecha_expedicion', $previousDate)
                    ->where('pago_periodo_anterior', 1);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            });
        })
        ->first();

        return inertia('reportes/permisosfuncionamientos', [
            'permisos' => $permisos,
            'numero' => optional($reporte)->numero,
            'reporte_id' => optional($reporte)->id,
            'totales' => $totales,
            'filters' => [
                'fecha' => $fecha,
                'estado' => $estado,
            ]
        ]);
    }

    public function generar(Request $request)
    {
        $fecha = $request->filled('fecha') && strtotime($request->fecha)
            ? Carbon::parse($request->fecha)->toDateString()
            : now()->toDateString();

        return DB::transaction(function () use ($fecha) {

            // 🔍 Verificar si ya existe
            $existe = ReportePermisoFuncionamiento::where('fecha', $fecha)->first();

            if ($existe) {
                return back()->with('error', 'El número de reporte ya fue generado.');
            }

            // 🔢 Obtener el último número del día (opcional: por fecha o global)
            $ultimaSecuencia = ReportePermisoFuncionamiento::whereYear('fecha', now()->year)
            ->max('secuencia');

            $secuencia = $ultimaSecuencia ? $ultimaSecuencia + 1 : 1;

            $formato = Numeracion::where('nombre', 'REPORTE PERMISOS')
            ->value('formato');

            // 🧾 Construir número
            $numero = $formato . '-' . str_pad($secuencia, 7, '0', STR_PAD_LEFT) . '-' . now()->year;

            // 💾 Crear registro
            $reporte = ReportePermisoFuncionamiento::create([
                'numero' => $numero,
                'secuencia' => $secuencia,    
                'fecha' => $fecha                
            ]);

            return back()->with('success', 'Número de reporte generado correctamente.');
        });
    }

    public function update(ValidarReportePermisoFuncionamientoRequest $request, ReportePermisoFuncionamiento $reportePermisoFuncionamiento)
    {
        $validated = $request->validated();

        $reportePermisoFuncionamiento->update($validated);

        return response()->json([
            'message' => 'Reporte actualizado correctamente.'
        ]);
    }

    public function show(ReportePermisoFuncionamiento $reportePermisoFuncionamiento)
    {
        return response()->json($reportePermisoFuncionamiento);
    }

    public function exportExcel(Request $request)
    {
        $fecha = $request->filled('fecha') && strtotime($request->fecha)
            ? Carbon::parse($request->fecha)
            : now();
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'EXPEDIDO') : null; 

        // fecha actual
        $currentDate = $fecha->toDateString();

        $previousDate = $fecha->copy()->subYear()->toDateString();

        $institucion = Institucion::first();

        $reporte = ReportePermisoFuncionamiento::where('fecha', $fecha)->firstOrFail();

        $permisos = PermisoFuncionamiento::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica',
            'procesoPermiso.tipoPermiso'
        ])
        ->where(function ($query) use ($currentDate, $previousDate, $estado) {
            // permisos de la fecha actual
            $query->where(function ($q) use ($currentDate, $estado) {
                $q->whereDate('fecha_expedicion', $currentDate);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            })
            // permisos de la misma fecha del año anterior
            ->orWhere(function ($q) use ($previousDate, $estado) {
                $q->whereDate('fecha_expedicion', $previousDate)
                    ->where('pago_periodo_anterior', 1);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            });
        })
        ->when($estado, function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->get();

        return Excel::download(new PermisosFuncionamientosExport($institucion, $reporte, $permisos), "Reporte_Permisos_{$reporte->numero}.xlsx");
    }

    public function exportPdf(Request $request)
    {
        $fecha = $request->filled('fecha') && strtotime($request->fecha)
            ? Carbon::parse($request->fecha)
            : now();
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'EXPEDIDO') : null; 

        // fecha actual
        $currentDate = $fecha->toDateString();

        $previousDate = $fecha->copy()->subYear()->toDateString();

        $institucion = Institucion::first();

        $reporte = ReportePermisoFuncionamiento::where('fecha', $fecha)->firstOrFail();

        $permisos = PermisoFuncionamiento::with([
            'procesoPermiso.cliente',
            'procesoPermiso.actividadEconomica',
            'procesoPermiso.tipoPermiso'
        ])
        ->where(function ($query) use ($currentDate, $previousDate, $estado) {
            // permisos de la fecha actual
            $query->where(function ($q) use ($currentDate, $estado) {
                $q->whereDate('fecha_expedicion', $currentDate);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            })
            // permisos de la misma fecha del año anterior
            ->orWhere(function ($q) use ($previousDate, $estado) {
                $q->whereDate('fecha_expedicion', $previousDate)
                    ->where('pago_periodo_anterior', 1);
                if ($estado) {
                    $q->where('estado', $estado);
                }
            });
        })
        ->when($estado, function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->get();

        $personal = Personal::with('personalPuestos')->findOrFail(Auth::user()->personal?->id);

        $cargoPredeterminado = $personal->personalPuestos
            ->firstWhere('predeterminado', 1);

        $personal_firma = [
            (object)[
                'abreviatura' => $personal->titulo?->abreviatura ?? '',
                'nombrePersonal' => $personal->nombre, // Accessor ya definido
                'nombrePuesto' => $cargoPredeterminado?->puesto?->nombre ?? '',
            ]
        ];

        // Obtener plantilla
        $plantilla = Plantilla::where('nombre', 'REPORTE RECAUDACIONES PERMISOS')
        ->where('predeterminado', 1)
        ->first();

        // 📄 Vista dinámica
        $vista = 'pdf.' . $plantilla->vista_blade;

        // 📏 Configurar tamaño
        if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {
            $pdf = Pdf::loadView($vista, compact('institucion','reporte','permisos','personal_firma'))
                ->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');
        } else {
            $pdf = Pdf::loadView($vista, compact('institucion','reporte','permisos','personal_firma'))
                ->setPaper([
                    0,
                    0,
                    $plantilla->ancho,
                    $plantilla->alto
                ], $plantilla->orientacion_papel ?? 'portrait');
        }

        $fechaHora = \Carbon\Carbon::now()->translatedFormat('d \d\e F \d\e Y H:i');

        $pdf->render();

        $dompdf = $pdf->getDomPDF();
        $canvas = $dompdf->getCanvas();
        $fontMetrics = $dompdf->getFontMetrics();

        $fontNormal = $fontMetrics->getFont("Roboto", "normal");
        $fontItalic = $fontMetrics->getFont("Roboto", "italic");

        $canvas->page_text(35, 560, "Generado el $fechaHora", $fontItalic, 8, [0,0,0]);
        $canvas->page_text(760, 560, "Página {PAGE_NUM} de {PAGE_COUNT}", $fontNormal, 8, [0,0,0]);

        return $pdf->download("Reporte_Permisos_{$reporte->numero}.pdf");
    }
}
