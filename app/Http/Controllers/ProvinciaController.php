<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use Illuminate\Http\Request;

class ProvinciaController extends Controller
{
    public function obtenerProvincia(Request $request)
    {
        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        return response()->json($provincias);
    }
}
