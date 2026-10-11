<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Datos validados
        $data = $request->validated();

        // 🔹 Actualizar usuario
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // 🔹 Construir nombres y apellidos
        $nombres = trim($data['first_name'] . ' ' . ($data['second_name'] ?? ''));
        $apellidos = trim($data['first_surname'] . ' ' . ($data['second_surname'] ?? ''));

        // 🔹 Actualizar o crear registro en personal
        if ($user->personal) {
            $user->personal->update([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
            ]);
        } else {
            $user->personal()->create([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
            ]);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
