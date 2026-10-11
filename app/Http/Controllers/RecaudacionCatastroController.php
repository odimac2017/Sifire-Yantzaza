<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\RecaudacionCatastro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ValidarRecaudacionCatastroRequest;
use App\Jobs\EnviarRecaudacionCatastroJob;
use App\Jobs\GenerarPdfRecaudacionCatastroJob;
use App\Models\Catastro;
use App\Models\Configuracion;
use App\Models\Institucion;
use App\Models\Plantilla;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RecaudacionCatastroController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;
        $estado = $request->estado !== 'ALL' ? $request->input('estado', 'EXPEDIDO') : null; 

        $recaudacionesCatastros = RecaudacionCatastro::with([
            'catastro.cliente',
            'catastro.parroquia'
        ])
        ->when($search, function ($query) use ($search) {
            $query->whereHas('catastro.cliente', function ($q) use ($search) {
                $q->where('documento', 'LIKE', "%{$search}%")
                  ->orWhere('nombre', 'LIKE', "%{$search}%");
            });
        })
        ->whereYear('fecha', $year)
        ->when($estado, function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->orderBy('numero')
        ->orderBy('fecha')
        ->paginate(10)
        ->withQueryString();

        $totales = RecaudacionCatastro::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'EXPEDIDO' THEN 1 ELSE 0 END) as expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN 1 ELSE 0 END) as anulados,

            SUM(CASE WHEN estado = 'EXPEDIDO' THEN valor_total ELSE 0 END) as monto_expedidos,
            SUM(CASE WHEN estado = 'ANULADO' THEN valor_total ELSE 0 END) as monto_anulados,

            SUM(valor_total) as monto_total
        ")
        ->whereYear('fecha', $year)
        ->first();

        return inertia('recaudacionesCatastros/index', [
            'recaudacionesCatastros' => $recaudacionesCatastros,
            'totales' => $totales,
            'filters' => [
                'search' => $search,
                'year' => $year,
                'estado' => $estado,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $search = trim($request->input('search', ''));

        $year = $request->filled('year') && is_numeric($request->year)
            ? (int) $request->year
            : now()->year;

        $cliente = null;

        if ($search) {

            $clientes = Cliente::with(['parroquia'])
                ->where(function ($query) use ($search) {

                    // Buscar exacto
                    $query->where('documento', $search);

                    // Si es cédula de 10 dígitos buscar también RUC + 001
                    if (strlen($search) === 10) {
                        $query->orWhere('documento', $search . '001');
                    }

                    // Si viene RUC terminado en 001 buscar también la cédula
                    if (strlen($search) === 13 && str_ends_with($search, '001')) {
                        $query->orWhere('documento', substr($search, 0, 10));
                    }
                })
                ->get();

            if ($clientes->count()) {
                
                // Cliente principal para la vista
                $cliente = $clientes->first();

                $clienteIds = $clientes->pluck('id');

                // Catastros recaudados desde el año seleccionado
                $catastrosRecaudados = Catastro::with('parroquia')
                    ->whereIn('cliente_id', $clienteIds)
                    ->where('periodo', '>=', $year)
                    ->whereHas('recaudacionesCatastros', function ($q) {
                        $q->where('estado', 'EXPEDIDO');
                    })
                    ->get();

                // Catastros no recaudados
                $catastrosNoRecaudados = Catastro::with('parroquia')
                    ->whereIn('cliente_id', $clienteIds)
                    ->where('periodo', '>=', $year)
                    ->whereDoesntHave('recaudacionesCatastros', function ($q) {
                        $q->where('estado', 'EXPEDIDO');
                    })
                    ->get();
                
                // Total recaudado
                $totalRecaudado = RecaudacionCatastro::where('estado', 'EXPEDIDO')
                    ->whereYear('fecha', '>=', $year)
                    ->whereHas('catastro', function ($q) use ($clienteIds) {
                        $q->whereIn('cliente_id', $clienteIds);
                    })
                    ->sum('valor_total');

                // Total pendiente
                $totalPorRecaudar = $catastrosNoRecaudados
                    ->sum('valor_calculado');

                $cliente->catastros_recaudados = $catastrosRecaudados;
                $cliente->catastros_no_recaudados = $catastrosNoRecaudados;

                $cliente->totales = [
                    'recaudado' => $totalRecaudado,
                    'por_recaudar' => $totalPorRecaudar,
                    'total_general' => $totalRecaudado + $totalPorRecaudar,
                ];
            }
        }

        return inertia('recaudacionesCatastros/create', [
            'cliente' => $cliente,
            'filters' => [
                'search' => $search,
                'year' => $year,
                'estado' => $request->input('estado', 'EXPEDIDO'),
            ],
        ]);
    }

    public function store(ValidarRecaudacionCatastroRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $plantillaId = Plantilla::where('nombre', 'RECAUDACION DE CATASTROS')
            ->where('predeterminado', 1)
            ->value('id');

            $ultimoNumero = RecaudacionCatastro::whereYear('fecha', now()->year)
            ->lockForUpdate()
            ->max('numero') ?? 0;

            foreach ($validated['catastros'] as $catastroId) {
                $catastro = Catastro::findOrFail($catastroId);

                $codigo_verificacion = strtoupper(Str::random(12));

                $ultimoNumero++;
                RecaudacionCatastro::create([
                    'plantilla_id' => $plantillaId,
                    'catastro_id' => $catastroId,
                    'numero' => $ultimoNumero,
                    'fecha' => now(),
                    'porcentaje_bomberos' => 0.00015,
                    'valor_propiedad' => $catastro->valor_propiedad,
                    'valor_total' => $catastro->valor_calculado,
                    'codigo_verificacion' => $codigo_verificacion
                ]);
            }
        });

        return redirect()->route('recaudacionescatastros.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'EXPEDIDO'),
        ])->with('success', 'Comprobante de recaudación actualizada correctamente');
    }

    public function anular(Request $request, RecaudacionCatastro $recaudacionCatastro)
    {
        $recaudacionCatastro->update([
            'estado' => 'ANULADO'
        ]);

        return redirect()->route('recaudacionescatastros.index', [
            'search' => trim($request->input('search', '')),
            'year' => (int) $request->input('year', now()->year),
            'estado' => $request->input('estado', 'EXPEDIDO'),
        ])->with('success', 'Comprobante de recaudación anulada correctamente');
    }

    public function firmar($id)
    {
        $recaudacion = RecaudacionCatastro::findOrFail($id);

        GenerarPdfRecaudacionCatastroJob::dispatch($recaudacion->id);
    
        return back()->with('success', 'El documento se está firmando en segundo plano');
    }

    public function descargar($id)
    {
        $recaudacionCatastro = RecaudacionCatastro::findOrFail($id);

        $fecha = Carbon::parse($recaudacionCatastro->fecha);

        if ($recaudacionCatastro->ruta_pdf_firmado != null){
            $path = storage_path('app/private/' . $recaudacionCatastro->ruta_pdf_firmado);

            if (!file_exists($path)) {
                return back()->with('error', 'El comprobante de recaudación de catastros no está firmado aún');
            }

            return response()->download(
                $path,
                "Comprobante_Recaudacion_Catastros_{$recaudacionCatastro->numero_formateado}_{$fecha->year}_firmado.pdf"
            );
        }else{
            $configuracion = Configuracion::first();

            $url = rtrim($configuracion->link_verificacion_qr, '/') . '/recaudacionescatastros/' . $recaudacionCatastro->codigo_verificacion . '/verificar';

            $qrBase64 = base64_encode(
                (new \Endroid\QrCode\Builder\Builder(
                    writer: new \Endroid\QrCode\Writer\PngWriter(),
                    data: $url,
                    size: 150,
                    margin: 10
                ))->build()->getString()
            );

            $institucion = Institucion::first();
            $plantilla = Plantilla::find($recaudacionCatastro->plantilla_id);
            $vista = 'pdf.' . $plantilla->vista_blade;
            
            $pdf = Pdf::loadView($vista, compact('institucion','recaudacionCatastro','qrBase64'));

            if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {                
                $pdf->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');
            } else {
                $pdf->setPaper([
                    0,
                    0,
                    $plantilla->ancho,
                    $plantilla->alto
                ], $plantilla->orientacion_papel ?? 'portrait');
            }

            return $pdf->download("Comprobante_Recaudacion_Catastros_{$recaudacionCatastro->numero_formateado}_{$fecha->year}.pdf"); 
        }

    }

    public function verificar($codigo)
    {
        $recaudacionCatastro = RecaudacionCatastro::where(
            'codigo_verificacion',
            $codigo
        )->firstOrFail();

        return view('verificacion.recaudacionCatastro', compact('recaudacionCatastro'));
    }

    public function reenviarCorreo(RecaudacionCatastro $recaudacionCatastro)
    {
        if (!$recaudacionCatastro->ruta_pdf_firmado) {
            return back()->with('error', 'El comprobante de recaudación de catastros no está firmado aún');
        }

        EnviarRecaudacionCatastroJob::dispatch($recaudacionCatastro)
            ->onQueue('correos');

        return back()->with('success', 'El correo se está enviando en segundo plano.');
    }

    public function preview($id)
    {
        $recaudacionCatastro = RecaudacionCatastro::with([
            'catastro.cliente',
            'catastro.parroquia'
        ])->findOrFail($id);

        $institucion = Institucion::first();
        $plantilla = Plantilla::find($recaudacionCatastro->plantilla_id);
        $vista = 'pdf.' . $plantilla->vista_blade;
        $pdf = Pdf::loadView($vista, compact('institucion','recaudacionCatastro'));

        if ($plantilla->tamano_papel != 'TAMAÑO PERSONAL') {                
            $pdf->setPaper($plantilla->tamano_papel, $plantilla->orientacion_papel ?? 'portrait');
        } else {
            $pdf->setPaper([
                0,
                0,
                $plantilla->ancho,
                $plantilla->alto
            ], $plantilla->orientacion_papel ?? 'portrait');
        }

        return $pdf->stream('preview.pdf');
    }
}
