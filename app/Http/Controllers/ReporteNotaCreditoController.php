<?php

namespace App\Http\Controllers;

use App\Exports\NotasCreditosExport;
use App\Models\Institucion;
use App\Models\NotaCredito;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReporteNotaCreditoController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

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
            ->paginate(10)
            ->withQueryString();

        return inertia('reportes/notascreditos', [
            'notasCreditos' => $notasCreditos,
            'filters' => [
                'search' => $search,
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
