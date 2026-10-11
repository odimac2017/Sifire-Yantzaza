<?php

namespace App\Http\Controllers;

use App\Models\Institucion;
use App\Http\Requests\ValidarInstitucionRequest;

class InstitucionController extends Controller
{
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Institucion $institucion)
    {
        return inertia('institucion/edit', [
            'institucion' => $institucion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarInstitucionRequest $request, Institucion $institucion)
    {
        $validated = $request->validated();

        $institucion->update($validated);

        return redirect()->route('institucion.edit', $institucion->id)
        ->with('success', 'El registro se actualizó con éxito');
    }
}
