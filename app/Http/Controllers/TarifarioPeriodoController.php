<?php

namespace App\Http\Controllers;

use App\Models\TarifarioPeriodo;
use App\Http\Requests\StoreTarifarioPeriodoRequest;
use Illuminate\Http\Request;

class TarifarioPeriodoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTarifarioPeriodoRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TarifarioPeriodo $tarifarioPeriodo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TarifarioPeriodo $tarifarioPeriodo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'field' => 'required|string',
            'value' => 'required'
        ]);

        $allowedFields = ['valor', 'gl', 'cat', 'riesgo', 'valor_fijo'];

        if (!in_array($request->field, $allowedFields)) {
            return response()->json([
                'message' => 'Campo no permitido'
            ], 422);
        }

        $tarifarioperiodo = TarifarioPeriodo::where('tarifario_id', $id)
        ->where('periodo', $request->year)
        ->count();

        if($tarifarioperiodo == 0){
            $tarifario = new TarifarioPeriodo();
            $tarifario->tarifario_id = $id;
            $tarifario->periodo = $request->year;
            $tarifario->{$request->field} = $request->value;
            $tarifario->save();
            $mensaje = 'Campo creado';
        }else{
            $tarifario = TarifarioPeriodo::findOrFail($id);
            $tarifario->{$request->field} = $request->value;
            $tarifario->save();
            $mensaje = 'Campo actualizado';
        }

        return response()->json([
            'message' => $mensaje,
            'tarifario' => $tarifario
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TarifarioPeriodo $tarifarioPeriodo)
    {
        //
    }
}
