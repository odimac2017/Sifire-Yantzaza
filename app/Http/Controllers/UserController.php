<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rol;
use Illuminate\Http\Request;
use App\Http\Requests\ValidarUserRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Personal;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $users = User::select('users.id', 'users.first_name', 'users.second_name', 'users.first_surname', 'users.second_surname', 'users.email', 'users.avatar')
        ->with(['roles', 'lastLogin'])
        ->when($search, function ($query) use ($search) {
            $query->where('users.first_name', 'like', "%{$search}%")
            ->orWhere('users.first_surname', 'like', "%{$search}%");
        })
        ->orderBy('users.first_surname')
        ->orderBy('users.first_name')
        ->paginate(10)
        ->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $lastLoginAt = optional($user->lastLogin)->last_login_at;
    
            $user->is_online = $lastLoginAt && $lastLoginAt->gt(now()->subMinutes(5));
    
            return $user;
        });

        return inertia('users/index', [
            'users' => $users->through(fn ($user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'second_name' => $user->second_name ?: null,
                'first_surname' => $user->first_surname,
                'second_surname' => $user->second_surname ?: null,
                'full_name_simplex' => $user->full_name_simplex,
                'full_name' => $user->fullname,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'roles' => $user->roles,
                'is_online' => $user->is_online,
                'last_login_at' => optional($user->lastLogin)->last_login_at,
            ]),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {        
        $roles = Rol::orderBy('nombre', 'asc')
        ->get();

        return inertia('users/create', [
            'roles' => $roles,
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidarUserRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {

            $user = User::create([
                'first_name' => $validated['first_name'],
                'second_name' => $validated['second_name'],
                'first_surname' => $validated['first_surname'],
                'second_surname' => $validated['second_surname'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            // ✅ Crear registro en tabla personal
            Personal::create([
                'user_id' => $user->id,
                'apellidos' => collect([
                    $user->first_surname,
                    $user->second_surname
                ])->filter()->implode(' '),
                'nombres' => collect([
                    $user->first_name,
                    $user->second_name
                ])->filter()->implode(' '),
            ]);

            if (!empty($validated['roles'])) {
                $user->roles()->sync($validated['roles']);
            }

            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $path;
                $user->save();
            }
        });

        return redirect()->route('users.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Usuario creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, User $user)
    {
        $user->load('roles:id,nombre');

        return inertia('users/edit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'second_name' => $user->second_name,
                'first_surname' => $user->first_surname,
                'second_surname' => $user->second_surname,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'roles' => $user->roles->pluck('id'),
            ],
            'roles' => Rol::select('id', 'nombre')->orderBy('nombre')->get(),
            'filters' => [
                'search' => trim($request->input('search', '')),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidarUserRequest $request, User $user)
    {        
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $user) {

            $user->update([
                'first_name' => $validated['first_name'],
                'second_name' => $validated['second_name'],
                'first_surname' => $validated['first_surname'],
                'second_surname' => $validated['second_surname'],
                'email' => $validated['email'],
            ]);

            // contraseña SOLO si se envía
            if (!empty($validated['password'])) {
                $user->update([
                    'password' => bcrypt($validated['password']),
                ]);
            }

            // avatar
            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $path = $request->file('avatar')->store('avatars', 'public');
                $user->update(['avatar' => $path]);
            }

            // roles
            $user->roles()->sync($validated['roles'] ?? []);

            // 🔥 actualizar tabla personal
            Personal::where('user_id', $user->id)->update([
                'apellidos' => collect([
                    $user->first_surname,
                    $user->second_surname
                ])->filter()->implode(' '),
                'nombres' => collect([
                    $user->first_name,
                    $user->second_name
                ])->filter()->implode(' '),
            ]);
        });

        return redirect()->route('users.index', [
            'search' => trim($request->input('search', '')),
        ])->with('success', 'Usuario actualizado correctamente');;
    }
}
