<?php

namespace App\Http\Controllers;

use App\Exports\NotasCreditosExport;
use App\Models\ActividadEconomica;
use App\Models\Institucion;
use App\Models\NotaCredito;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReporteClienteSinPermisoController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;

        $clientesSinPermisos = ActividadEconomica::with([
                'cliente',
                'parroquia',
                'ultimoProcesoPermiso.permisoFuncionamiento'
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('cliente', function ($cliente) use ($search) {
                        $cliente->where('documento', 'like', "%{$search}%")
                            ->orWhere('nombre', 'like', "%{$search}%");
                    })
                    ->orWhere('e_nombre_comercial', 'like', "%{$search}%");
                });
            })
            ->where('tipo_actividad', 'E')
            ->whereYear('fecha_inicio', '<=', $year)
            ->where('estado', 'ACTIVO')
            ->whereDoesntHave('procesosPermisos', function ($query) use ($year) {
                $query->where('tipo_permiso_id', 2)
                    ->whereHas('permisoFuncionamiento', function ($q) use ($year) {
                        $q->whereYear('fecha_expedicion', $year);
                    });
            })
            ->orderBy('e_nombre_comercial')            
            ->paginate(10)
            ->withQueryString();

        return inertia('reportes/clientesSinPermisos', [
            'clientesSinPermisos' => $clientesSinPermisos,
            'filters' => [
                'search' => $search,
                'year' => $year
            ]
        ]);
    }    

    public function exportExcel(Request $request)
    {
        $search = trim($request->input('search', ''));
        
        $institucion = Institucion::first();
        
        $notasCreditos = NotaCredito::query()
            ->select('notas_creditos.*')
            ->with([
                'cliente',
                'actividadEconomica'
            ])
            ->leftJoin('clientes', 'notas_creditos.cliente_id', '=', 'clientes.id')
            ->leftJoin('actividades_economicas', 'notas_creditos.actividad_economica_id', '=', 'actividades_economicas.id')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('clientes.documento', 'like', "%{$search}%")
                    ->orWhere('clientes.nombre', 'like', "%{$search}%")
                    ->orWhere('actividades_economicas.e_nombre_comercial', 'like', "%{$search}%");
                });
            })
            ->orderBy('clientes.nombre')
            ->orderBy('actividades_economicas.e_nombre_comercial')
            ->get();

        return Excel::download(new NotasCreditosExport($institucion, $notasCreditos), "Reporte_Notas_Credito.xlsx");
    }
}
