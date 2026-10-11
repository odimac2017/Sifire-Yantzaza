<?php

namespace App\Http\Controllers;

use App\Models\Personal;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarPersonalRequest;
use App\Models\Documento;
use App\Models\EstadoCivil;
use App\Models\Etnia;
use App\Models\Genero;
use App\Models\GrupoSanguineo;
use App\Models\Provincia;
use App\Models\Puesto;
use App\Models\Titulo;

class PersonalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $personales = Personal::with(['user.lastLogin'])
        ->when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('documento', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('nombres', 'like', "%{$search}%");
            });
        })
        ->orderBy('apellidos')
        ->orderBy('nombres')
        ->paginate(10)
        ->withQueryString();

        return inertia('personales/index', [
            'personales' => $personales->through(function ($personal) {

                if ($personal->user && $personal->user->lastLogin && $personal->user->lastLogin->last_login_at) {
                    $lastLoginAt = optional($personal->user->lastLogin)->last_login_at;
                    $personal->user->is_online = $lastLoginAt && $lastLoginAt->gt(now()->subMinutes(5));
                }
                
                return [
                    'id' => $personal->id,
                    'documento' => $personal->documento,
                    'apellidos' => $personal->apellidos,
                    'nombres' => $personal->nombres,
                    'fecha_nacimiento' => $personal->fecha_nacimiento,
                    'direccion' => $personal->direccion,
                    'telefonos' => $personal->telefonos,
                    'estado' => $personal->estado,
                    'full_name_simplex' => $personal->user->full_name_simplex ?? null,
                    'avatar' => $personal->user->avatar ?? null,
                    'is_online' => $personal->user->is_online,
                ];
            }),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Personal $personal)
    {
        $titulos = Titulo::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $documentos = Documento::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $generos = Genero::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $gruposSanguineos = GrupoSanguineo::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $estadosCiviles = EstadoCivil::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $etnias = Etnia::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $provincias = Provincia::select('id','nombre')
        ->orderBy('codigo')
        ->get();

        $puestos = Puesto::select('id','nombre')
        ->orderBy('nombre')
        ->get();

        $personal->load('personalPuestos.puesto');

        $puestosAsignados = $personal->personalPuestos->map(function ($pp) {
            return [
                'id' => $pp->puesto->id,
                'nombre' => $pp->puesto->nombre,
                'predeterminado' => $pp->predeterminado,
                'estado' => $pp->estado,
            ];
        });

        return inertia('personales/edit', [
            'titulos' => $titulos,    
            'documentos' => $documentos,
            'generos' => $generos,
            'gruposSanguineos' => $gruposSanguineos,
            'estadosCiviles' => $estadosCiviles,
            'etnias' => $etnias,
            'provincias' => $provincias,
            'puestos' => $puestos,
            'personal' => array_merge($personal->toArray(), [
                'puestos' => $puestosAsignados
            ]),
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarPersonalRequest $request, Personal $personal)
    {
        $validated = $request->validated();

        $personal->update($validated);

        // Sincronizar puestos
        if (isset($validated['puestos'])) {

            // eliminar los que ya no vienen
            $personal->personalPuestos()->delete();

            foreach ($validated['puestos'] as $puesto) {
                $personal->personalPuestos()->create([
                    'puesto_id' => $puesto['id'],
                    'estado' => $puesto['estado'],
                    'predeterminado' => $puesto['predeterminado'],
                ]);
            }
        }

        return redirect()->route('personales.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Personal actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Personal $personal)
    {
        //
    }
}
