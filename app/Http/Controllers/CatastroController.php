<?php

namespace App\Http\Controllers;

use App\Models\Catastro;
use App\Models\Cliente;
use Illuminate\Http\Request;

class CatastroController extends Controller
{
    public function show(Request $request, Catastro $catastro)
    {
        $cliente = Cliente::with([
            'parroquia:id,nombre'
        ])
        ->where('id', $catastro->cliente_id)
        ->first();

        $catastro->load([
            'parroquia:id,nombre',
            'recaudacionesCatastros'
        ]);

        return inertia('catastros/show', [            
            'cliente' => $cliente,
            'catastro' => $catastro,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }
}
