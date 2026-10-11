<?php

namespace App\Http\Controllers;

use App\Jobs\FirmarDocumentoJob;
use App\Models\Inspeccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FirmaInspeccionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;

        $inspecciones = Inspeccion::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
                'firmantes.personal'
            ])
            ->whereHas('firmantes', function ($q) {
                $q->where('personal_id', Auth::user()->personal?->id)
                ->whereIn('estado_firma', ['PENDIENTE','ERROR_FIRMA','REQUIERE_PASSWORD']);
            })
            ->when($search, function ($query) use ($search) {
                $query->whereHas('procesoPermiso.cliente', function ($q) use ($search) {
                    $q->where('documento', 'like', "%{$search}%")
                    ->orWhere('nombre', 'like', "%{$search}%");
                });
            })
            ->whereYear('fecha_inspeccion', $year)
            ->orderByDesc('fecha_inspeccion')
            ->orderByDesc('numero')
            ->paginate(10)
            ->withQueryString();

        return inertia('inspecciones/firmar', [
            'inspecciones' => $inspecciones,
            'filters' => [
                'search' => $search,
                'year' => $year,
            ],
        ]);
    }

    public function firmar(Request $request, Inspeccion $inspeccion)
    {
        $firmante = $inspeccion->firmantes()
            ->where('personal_id', Auth::user()->personal?->id)
            ->whereIn('estado_firma', ['PENDIENTE','ERROR_FIRMA','REQUIERE_PASSWORD'])
            ->first();

        if (!$firmante) {
            return back()->with('error', 'No tiene permisos para firmar este documento');
        }

        // Verificar si hay firmantes anteriores pendientes
        $firmantesPendientesAntes = $inspeccion->firmantes()
            ->where('orden_firma', '<', $firmante->orden_firma)
            ->where('estado_firma', '!=', 'FIRMADO')
            ->exists();

        if ($firmantesPendientesAntes) {
            return back()->with('error', 'Debe firmar primero el firmante que le antecede');
        }

        try {

            FirmarDocumentoJob::dispatch(
                \App\Models\Inspeccion::class,
                $inspeccion->id,
                $request->password
            )->onQueue('firmas');

            return back()->with('success', 'El documento se está firmando en segundo plano');

        } catch (\Exception $e) {

            $firmante->update([
                'estado_firma' => 'ERROR_FIRMA',
                'mensaje_error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al firmar el documento');
        }
    }    
}
