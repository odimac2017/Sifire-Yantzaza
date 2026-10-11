<?php

namespace App\Http\Controllers;

use App\Models\Parroquia;
use Illuminate\Http\Request;

class ParroquiaController extends Controller
{
    public function obtenerParroquia(Request $request)
    {             
        $parroquias = Parroquia::select('id','nombre')
        ->where('canton_id', $request->canton_id)
        ->orderBy('codigo')
        ->get();

        return response()->json($parroquias);
    }
}
