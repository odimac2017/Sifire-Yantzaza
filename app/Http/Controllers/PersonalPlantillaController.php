<?php

namespace App\Http\Controllers;

use App\Models\PersonalPlantilla;

class PersonalPlantillaController extends Controller
{
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PersonalPlantilla $personalPlantilla)
    {
        $personalPlantilla->delete();

        return back()->with('success','Firmante eliminado correctamente');
    }
}
