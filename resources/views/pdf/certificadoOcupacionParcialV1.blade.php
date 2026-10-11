<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado de ocupación parcial #{{ $permiso->numero_formateado }}</title>
    <style>
        @font-face {
            font-family: 'Roboto';
            src: url('fonts/Roboto-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: 'Roboto';
            src: url('fonts/Roboto-Italic.ttf') format('truetype');
            font-weight: normal;
            font-style: italic;
        }

        @font-face {
            font-family: 'Roboto';
            src: url('fonts/Roboto-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
        }

        @page {
            margin-top: 2em;
            margin-left: 2em;
            margin-right: 2em;
            margin-bottom: 2em;
        }

        body {
            font-family: 'Roboto', sans-serif;
            font-size: 12px;
            line-height: 12px;
            position: relative;
        }

        .footer-permiso {
            position: absolute;
            bottom: 15px;
            left: 0;
            width: 100%;
        } 

        .marco-permiso {
            border: 3px double #000;
            padding: 15px;
            height: 458px;
        }

        .content {
            position: relative;
        }

        .institucion {
            margin-top: 0px;
            left: 20px;
            right: 20px;
            text-align: center;    
        }

        .logo {
            position: absolute;
            top: -6px;
            left: -6px;
            width: 85px;
        }

        .logo-agua {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            opacity: 0.20;
            z-index: -1;
        }     

        .qr {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 90px;
        }  

        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-10 { font-size: 10px; }
        .text-14 { font-size: 14px; }
        .mt-5 { margin-top: 5px; }
        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }

        .label {
            font-weight: bold;
        }

        .value {
            margin-left: 5px;
        }

        .tabla-sin-borde {
            width: 100%;
            border-collapse: collapse;
            line-height: 12px;
        }

        .text-justify {
            text-align: justify;
        }

        .observaciones {
            max-height: 40px;
            overflow: hidden;
        }

        .slogan {
            margin-bottom: 90px;
            text-align: center;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .tabla-firmas {
            margin-bottom: -20px;
            left: 0;
            width: 100%;
            text-align: center;
        }

        .tabla-firmas td {
            width: 33%;
            vertical-align: top;
        }

        .linea-firma {
            border-top: 1px solid #000;
            width: 180px;
            margin: 0 auto 5px auto;
        }

        .cargo-firma {
            font-weight: bold;
            font-size: 11px;
        }
    </style>
</head>
<body>
<div class="marco-permiso">
    <div class="content">

        <img class="logo" src="{{ asset('images/logo1.jpg') }}" alt="Logo">        
        <img class="logo-agua" src="{{ asset('images/logo1.jpg') }}" alt="">
        <img class="qr" src="data:image/png;base64, {{ $qrBase64 }}">

        <div class="institucion">
            <div class="bold text-14" >{{ $institucion->razon_social }}</div>
            <div class="text-10">Teléfono: {{ $institucion->telefonos }} - email: {{ $institucion->email }}</div>
            <div class="text-10">Dirección: {{ $institucion->direccion }} - RUC: {{ $institucion->ruc }}</div>
        </div>

        <div class="text-center bold mt-5">
            DEPARTAMENTO DE PREVENCIÓN CONTRA INCENDIOS
        </div>

        <div class="text-center text-10 italic">
            Art. 11 del Reglamento de Aplicación a los Artículos 32 y 35 de la Ley de Defensa Contra Incendios Reformada
        </div>

        <div class="text-center text-14 bold mt-5">
            {{ $permiso->procesoPermiso->tipoPermiso->nombre}} N° <span style="color: red;">{{ $permiso->numero_formateado }}</span>
        </div>
        <table class="tabla-sin-borde mt-10">
            <tr>
                <td width="35%">
                    <span class="label">N° inspección:</span>
                    <span class="value">{{ $permiso->procesoPermiso->inspeccionAprobada->numero_formateado }}</span>
                </td>
                <td width="25%"></td>
                <td width="40%">
                    <span class="label">Fecha inspección:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($permiso->procesoPermiso->inspeccionAprobada->fecha_inspeccion)->translatedFormat('d \\d\\e F \\d\\e Y')) }}</span>
                </td>
            </tr>            
            <tr>
                <td colspan="3">
                    <span class="label">Propietario:</span>
                    <span class="value">{{ $permiso->procesoPermiso->cliente->nombre }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">CC o RUC:</span>
                    <span class="value">{{ $permiso->procesoPermiso->cliente->documento }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Dirección:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->e_direccion }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Fecha de pago:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($permiso->fecha_deposito)->translatedFormat('d \\d\\e F \\d\\e Y')) }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label"># pisos:</span>
                    @php
                        $num_pisos = 0;

                        if($permiso->procesoPermiso->inspeccionAprobada->area1 > 0) $num_pisos++;
                        if($permiso->procesoPermiso->inspeccionAprobada->area2 > 0) $num_pisos++;
                        if($permiso->procesoPermiso->inspeccionAprobada->area3 > 0) $num_pisos++;
                        if($permiso->procesoPermiso->inspeccionAprobada->area4 > 0) $num_pisos++;
                    @endphp
                    <span class="value">{{ $num_pisos }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Valor total:</span>
                    <span class="label text-14">$ {{ number_format($permiso->valor_total, 2) }}</span>
                </td>
            </tr>
            @if(!empty($permiso->observaciones))
                <tr>
                    <td colspan="3" class="text-justify observaciones">
                        <span class="label">Observaciones:</span>
                        <span class="value">{{ $permiso->observaciones }}</span>
                    </td>
                </tr>
            @endif
        </table>

        <div class="footer-permiso">
            <div class="slogan">
                {{ $institucion->slogan }}
            </div>

            @php
                $firmantes = $permiso->plantilla->personalPlantilla ?? collect();

                $tieneFirmantes = $firmantes->isNotEmpty();

                if ($tieneFirmantes) {

                    $left = $firmantes->firstWhere('posicion_firmante', 'L');
                    $center = $firmantes->firstWhere('posicion_firmante', 'C');
                    $right = $firmantes->firstWhere('posicion_firmante', 'R');

                    $firmas = [
                        ['nombre' => $left?->firmante->nombre ?? null, 'puesto' => $left?->puesto ?? null],
                        ['nombre' => $center?->firmante->nombre ?? null, 'puesto' => $center?->puesto ?? null],
                        ['nombre' => $right?->firmante->nombre ?? null, 'puesto' => $right?->puesto ?? null],
                    ];

                } else {

                    $firmas = [
                        ['nombre' => null, 'puesto' => 'JEFE DEL CBCY'],
                        ['nombre' => null, 'puesto' => 'TESORERO/A'],
                        ['nombre' => null, 'puesto' => 'RECAUDADOR/A'],
                    ];
                }
            @endphp

            <table class="tabla-firmas">
                <tr>
                    @foreach ($firmas as $firma)
                        <td>
                            @if ($firma['puesto'])   
                                <div class="linea-firma"></div>
                            @endif
                            
                            @if ($firma['nombre'])                        
                                <div>{{ $firma['nombre'] }}</div>
                            @endif

                            <div class="cargo-firma">{{ $firma['puesto'] }}</div>
                        </td>
                    @endforeach
                </tr>
            </table>
        </div>
    </div>
</div>
</body>
</html>