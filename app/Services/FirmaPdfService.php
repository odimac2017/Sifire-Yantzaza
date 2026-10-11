<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirmaPdfService
{
    public function firmar(
        string $pdfInput,
        $firma,
        string $pdfOutput,
        int $x,
        int $y,
        ?string $password = null
    ) {

        /*
        |--------------------------------------------------------------------------
        | RUTAS
        |--------------------------------------------------------------------------
        */

        $base = storage_path('app/private');

        $inputPath  = $base . '/' . $pdfInput;
        $outputPath = $base . '/' . $pdfOutput;
        $certPath   = $base . '/' . $firma->ruta;

        /*
        |--------------------------------------------------------------------------
        | VALIDAR ARCHIVOS
        |--------------------------------------------------------------------------
        */

        if (!file_exists($inputPath)) {
            throw new \Exception("PDF origen no encontrado");
        }

        if (!file_exists($certPath)) {
            throw new \Exception("Certificado no encontrado");
        }

        /*
        |--------------------------------------------------------------------------
        | PASSWORD
        |--------------------------------------------------------------------------
        */

        $password = $password ?? decrypt($firma->password);

        /*
        |--------------------------------------------------------------------------
        | MICROSERVICIO
        |--------------------------------------------------------------------------
        */

        $endpoint = rtrim(config('services.firma.url'), '/') . '/api/firmar';

        Log::info("Solicitud firma PDF", [
            'input' => $inputPath,
            'output' => $outputPath,
            'certificado' => $certPath,
            'x' => $x,
            'y' => $y
        ]);

        $response = Http::timeout(90)
            ->retry(2, 2000)
            ->post($endpoint, [
                'src' => $inputPath,
                'dest' => $outputPath,
                'cert' => $certPath,
                'password' => $password,
                'x' => $x,
                'y' => $y
            ]);

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA MICROSERVICIO
        |--------------------------------------------------------------------------
        */

        if (!$response->successful()) {

            Log::error("Error en microservicio de firma", [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            throw new \Exception(
                $response->json('message') ??
                "Error al firmar el documento"
            );
        }

        Log::info("PDF firmado correctamente");

        return true;
    }
}