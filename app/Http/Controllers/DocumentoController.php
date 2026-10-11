<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentoController extends Controller
{
    public function obtenerDocumento(Request $request)
    {
        $documentos = Documento::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        return Inertia::render('documentos/obtenerDocumento', [
            'documentos' => $documentos,
        ]);
    }
}
