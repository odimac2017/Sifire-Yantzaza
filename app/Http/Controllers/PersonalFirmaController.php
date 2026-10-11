<?php

namespace App\Http\Controllers;

use App\Models\Personal;
use App\Models\PersonalFirma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PersonalFirmaController extends Controller
{
    public function edit()
    {
        $firma = Auth::user()->personal?->firma;

        $diasRestantes = $firma
            ? Carbon::parse($firma->fecha_expiracion)->diffInDays(now(), false)
            : null;

        return Inertia::render('settings/firma-electronica', [
            'hasFirma' => (bool) $firma,
            'firma' => $firma ? [
                'nombre_titular' => $firma->nombre_titular,
                'cedula_titular' => $firma->cedula_titular,
                'entidad_emisora' => $firma->entidad_emisora,
                'fecha_expiracion' => $firma->fecha_expiracion,
                'solicitar_password' => $firma->solicitar_password,
            ] : null,
            'dias_restantes' => $diasRestantes
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'firma' => ['required', 'file', 'extensions:p12', 'max:2048'],
            'password' => ['required', 'string'],
        ]);

        $personal = $request->user()->personal;

        $p12Path = $request->file('firma')->getRealPath();
        $password = $request->password;

        $tmpCert = storage_path('app/tmp_cert.pem');
        $tmpKey  = storage_path('app/tmp_key.pem');

        // Intentar leer certificado
        $openssl = 'C:\openssl\x64\bin\openssl.exe';

        $command = "\"{$openssl}\" pkcs12 -in \"$p12Path\" -clcerts -nokeys -out \"$tmpCert\" -passin pass:$password";
        exec($command, $output, $result);

        if ($result !== 0) {
            return back()->withErrors([
                'password' => 'La contraseña de la firma es incorrecta o el archivo no es válido.'
            ]);
        }

        // Extraer clave privada
        $command = "openssl pkcs12 -in \"$p12Path\" -nocerts -out \"$tmpKey\" -nodes -passin pass:$password";
        exec($command);

        $certContent = file_get_contents($tmpCert);

        if (!$certContent) {
            return back()->withErrors([
                'firma' => 'No se pudo leer el certificado.'
            ]);
        }

        $certData = openssl_x509_parse($certContent);

        if (!$certData) {
            return back()->withErrors([
                'firma' => 'El certificado no es válido.'
            ]);
        }

        // Validar expiración
        $fechaExpiracion = $certData['validTo_time_t'] ?? null;

        if (!$fechaExpiracion) {
            return back()->withErrors([
                'firma' => 'No se pudo obtener la fecha de expiración del certificado.'
            ]);
        }

        if (time() > $fechaExpiracion) {
            return back()->withErrors([
                'firma' => 'El certificado digital está caducado.'
            ]);
        }

        // Obtener nombre
        $nombre = $certData['subject']['CN'] ?? null;

        if (!$nombre) {
            return back()->withErrors([
                'firma' => 'No se pudo identificar el titular del certificado.'
            ]);
        }

        // Extraer cédula o RUC
        $cedula = null;

        if (!empty($certData['extensions'])) {

            $ext = $certData['extensions'];

            // SECURITY DATA S.A.
            if (isset($ext['1.3.6.1.4.1.37746.3.1'])) {
                $cedula = preg_replace('/\D/', '', $ext['1.3.6.1.4.1.37746.3.1']);
            }

            // BANCO CENTRAL DEL ECUADOR
            if (!$cedula && isset($ext['1.3.6.1.4.1.37947.3.1'])) {
                $cedula = preg_replace('/\D/', '', $ext['1.3.6.1.4.1.37947.3.1']);
            }
        }

        // Eliminar firma anterior
        if ($personal->firma) {
            Storage::delete($personal->firma->ruta);
            $personal->firma->delete();
        }

        $archivo = $request->file('firma');

        $extension = $archivo->getClientOriginalExtension();

        $nombreArchivo = 'firma_' . $personal->documento . '.' . $extension;

        $path = $archivo->storeAs(
            'firmas',
            $nombreArchivo
        );

        // Guardar firma
        PersonalFirma::create([
            'personal_id' => $personal->id,
            'nombre_titular' => $nombre,
            'cedula_titular' => $cedula,
            'password' => encrypt(trim($request->password)),
            'entidad_emisora' => $certData['issuer']['O'] ?? null,
            'fecha_emision' => $certData['validFrom_time_t'] ?? null,
            'fecha_expiracion' => $certData['validTo_time_t'] ?? null,
            'solicitar_password' => true,
            'nombre_archivo' => $archivo->getClientOriginalName(),
            'ruta' => $path,
        ]);

        // limpiar temporales
        @unlink($tmpCert);
        @unlink($tmpKey);

        return back()->with('success', 'Firma subida correctamente.');
    }

    public function togglePassword(Request $request)
    {
        $request->validate([
            'solicitar_password' => 'required|boolean'
        ]);

        $firma = Auth::user()->personal?->firma;

        $firma->update([
            'solicitar_password' => $request->solicitar_password
        ]);

        return back();
    }

    public function destroy(Request $request)
    {
        $personal = $request->user()->personal;

        if ($personal->firma) {
            Storage::delete($personal->firma->ruta);
            $personal->firma->delete();
        }

        return back()->with('success', 'Firma eliminada.');
    }

    public function verificar(Personal $personal)
    {
        $firma = $personal->firma()
            ->whereDate('fecha_expiracion', '>=', now())
            ->first();

        if (!$firma) {
            return back()->with('error', 'El personal no tiene firma electrónica válida o el certificado está vencido.');
        }

        return back()->with('success', 'Firma electrónica válida.');
    }
}
