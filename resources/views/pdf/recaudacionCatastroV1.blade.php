<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recaudación de Catastro #{{ $recaudacionCatastro->numero_formateado }}</title>
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
            line-height: 11px;
            position: relative;
        }

        .footer-comprobante {
            position: absolute;
            bottom: 15px;
            left: 0;
            width: 100%;
        } 

        .marco-comprobante {
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
            line-height: 14px;
        }

        .tabla-valores {
            width: 50%;
            margin: 40px auto;
            border-collapse: collapse;
            border: 1px solid #000;
            line-height: 16px;
        }

        .tabla-valores td {
            border: 1px solid #000;
            padding: 5px 8px;
        }

        .tabla-valores td {
            font-weight: bold;
            font-size: 16px;
        }

        .tabla-valores td:first-child {
            text-align: center;
        }

        .tabla-valores td:last-child {
            text-align: right;
        }

        .slogan {
            margin-bottom: 90px;
            text-align: center;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .tabla-firmas {
            margin-bottom: -25px;
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
<div class="marco-comprobante">
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
            RECARGO DEL 0.15 X 1000 A PREDIOS URBANOS
        </div>

        <div class="text-center text-14 bold mt-5">
            COMPROBANTE N° <span style="color: red;">{{ $recaudacionCatastro->numero_formateado }}</span>
        </div>
        <table class="tabla-sin-borde mt-20">
            <tr>
                <td width="70%">
                    <span class="label">Fecha de emisión:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($recaudacionCatastro->fecha)->translatedFormat('d \\d\\e F \\d\\e Y')) }}</span>
                </td>
                <td width="30%">
                    <span class="label">Año:</span>
                    <span class="value">{{ \Carbon\Carbon::parse($recaudacionCatastro->fecha)->format('Y') }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Cliente:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->cliente->nombre }}</span>
                </td>
                <td>
                    <span class="label">CC o RUC:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->cliente->documento }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Clave catastral:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->clave_catastral }}</span>
                </td>
                <td>
                    <span class="label">Número:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->numero_predio }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Dirección del predio:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->direccion }}</span>
                </td>
                <td>
                    <span class="label">Parroquia:</span>
                    <span class="value">{{ $recaudacionCatastro->catastro->parroquia->nombre }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">Avaluo comercial:</span>
                    <span class="value">$ {{ number_format($recaudacionCatastro->catastro->valor_propiedad, 2) }}</span>
                </td>
            </tr>
        </table>
        <table class="tabla-valores">
            <tr>
                <td>VALOR A PAGAR</td>
                <td><span style="color: red;">$ {{ number_format($recaudacionCatastro->valor_total, 2) }}</span></td>
            </tr>
        </table>

        <div class="footer-comprobante">
            <div class="slogan">
                {{ $institucion->slogan }}
            </div>

            @php
                $firmantes = $recaudacionCatastro->plantilla->personalPlantilla ?? collect();

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
                        ['nombre' => null, 'puesto' => null],
                        ['nombre' => null, 'puesto' => 'CUERPO DE BOMBEROS DE YANTZAZA'],
                        ['nombre' => null, 'puesto' => null],
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