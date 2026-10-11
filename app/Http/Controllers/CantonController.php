<?php

namespace App\Http\Controllers;

use App\Models\Canton;
use Illuminate\Http\Request;

class CantonController extends Controller
{
    public function obtenerCanton(Request $request)
    {
        $cantones = Canton::select('id','nombre')
        ->where('provincia_id', $request->provincia_id)
        ->orderBy('codigo')
        ->get();

        return response()->json($cantones);
    }
}
