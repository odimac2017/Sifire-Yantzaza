<?php

namespace App\Http\Controllers;

use App\Jobs\FirmarDocumentoJob;
use App\Models\PermisoFuncionamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FirmaPermisoFuncionamientoController extends Controller
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

        $permisosFuncionamientos = PermisoFuncionamiento::with([
                'procesoPermiso.cliente',
                'procesoPermiso.actividadEconomica.parroquia',
                'procesoPermiso.tipoPermiso.tipoInspeccion:id,nombre',
                'firmantes.personal'
            ])
            ->where('estado', 'EXPEDIDO')
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
            ->whereYear('fecha_expedicion', $year)
            ->orderBy('fecha_expedicion')
            ->orderBy('numero')
            ->paginate(10)
            ->withQueryString();

        return inertia('permisosFuncionamientos/firmar', [
            'permisosFuncionamientos' => $permisosFuncionamientos,
            'filters' => [
                'search' => $search,
                'year' => $year,
            ],
        ]);
    }

    public function firmar(Request $request, PermisoFuncionamiento $permisoFuncionamiento)
    {
        $firmante = $permisoFuncionamiento->firmantes()
            ->where('personal_id', Auth::user()->personal?->id)
            ->whereIn('estado_firma', ['PENDIENTE','ERROR_FIRMA','REQUIERE_PASSWORD'])
            ->first();

        if (!$firmante) {
            return back()->with('error', 'No tiene permisos para firmar este documento.');
        }

        // Verificar si hay firmantes anteriores pendientes
        $firmantesPendientesAntes = $permisoFuncionamiento->firmantes()
            ->where('orden_firma', '<', $firmante->orden_firma)
            ->where('estado_firma', '!=', 'FIRMADO')
            ->exists();

        if ($firmantesPendientesAntes) {
            return back()->with('error', 'Debe firmar primero el firmante que le antedede.');
        }

        try {

            FirmarDocumentoJob::dispatch(
                \App\Models\PermisoFuncionamiento::class,
                $permisoFuncionamiento->id,
                $request->password
            )->onQueue('firmas');

            return back()->with('success', 'Documento firmado correctamente.');

        } catch (\Exception $e) {

            $firmante->update([
                'estado_firma' => 'ERROR_FIRMA',
                'mensaje_error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al firmar el documento.');
        }
    }    
}
