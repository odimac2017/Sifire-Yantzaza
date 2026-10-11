<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Permiso de funcionamiento #{{ $permiso->numero_formateado }}</title>
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
            line-height: 11px;
        }

        .tabla-valores {
            width: 60%;
            margin: 10px auto;
            border-collapse: collapse;
            border: 1px solid #000;
            line-height: 8px;
        }

        .tabla-valores th,
        .tabla-valores td {
            border: 1px solid #000;
            padding: 5px 8px;
        }

        .tabla-valores th {
            text-align: center;
            font-weight: bold;
        }

        .tabla-valores td:first-child {
            text-align: left;
        }

        .tabla-valores td:last-child {
            text-align: right;
        }

        .total-row td {
            font-weight: bold;
        }

        .tabla-fechas {
            margin-top: -10px;
            width: 100%;
        }

        .tabla-fechas td {
            padding-top: 5px;
        }

        .text-right {
            text-align: right;
        }

        .text-justify {
            text-align: justify;
        }

        .slogan {
            margin-bottom: 70px;
            text-align: center;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .tabla-firmas {
            margin-bottom: -25px;
            left: 0;
            width: 100%;
        }

        .tabla-firmas td {
            text-align: center;
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
            En uso de sus atribuciones establecidas en la Ley de Defensa Contra Incendios, en el Art. 35 concede el presente:
        </div>

        <div class="text-center text-14 bold mt-5">
            {{ $permiso->procesoPermiso->tipoPermiso->nombre}} N° <span style="color: red;">{{ $permiso->numero_formateado }}</span>
        </div>
        <table class="tabla-sin-borde mt-5">
            <tr>
                <td width="35%">
                    <span class="label">Código extintores:</span>
                    <span class="value">
                        @php
                            $numeros = $permiso->procesoPermiso->extintores->pluck('numero')->sort()->values();
                        @endphp

                        @if($numeros->count() > 5)
                            {{ str_pad($numeros->first(), 3, '0', STR_PAD_LEFT) }}
                            AL
                            {{ str_pad($numeros->last(), 3, '0', STR_PAD_LEFT) }}
                        @else
                            {{ $numeros->map(fn($c) => str_pad($c, 3, '0', STR_PAD_LEFT))->implode(', ') }}
                        @endif
                    </span>
                </td>
                <td width="25%">
                    <span class="label">N° inspección:</span>
                    <span class="value">{{ $permiso->procesoPermiso->inspeccionAprobada->numero_formateado }}</span>
                </td>
                <td width="40%">
                    <span class="label">Fecha inspección:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($permiso->procesoPermiso->inspeccionAprobada->fecha_inspeccion)->translatedFormat('d \\d\\e F \\d\\e Y')) }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Razón Social:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->e_nombre_comercial }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Propietario:</span>
                    <span class="value">{{ $permiso->procesoPermiso->cliente->nombre }}</span>
                </td>
            </tr>
                <td>
                    <span class="label">CC o RUC:</span>
                    <span class="value">{{ $permiso->procesoPermiso->cliente->documento }}</span>
                </td>
                <td colspan="2">
                    <span class="label">Actividad:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->e_actividad_principal }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <span class="label">Dirección:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->e_direccion }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Provincia:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->provincia->nombre }}</span>
                </td>
                <td>
                    <span class="label">Cantón:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->canton->nombre }}</span>
                </td>
                <td>
                    <span class="label">Parroquia:</span>
                    <span class="value">{{ $permiso->procesoPermiso->actividadEconomica->parroquia->nombre }}</span>
                </td>
            </tr>
        </table>
        <table class="tabla-valores">
            <tr style="background-color: #CBCBCB;">
                <th width="70%">DESCRIPCIÓN</th>
                <th width="30%">VALOR</th>
            </tr>
            <tr>
                <td>Valor Anual</td>
                <td>{{ number_format($permiso->valor_total - $permiso->valor_multa, 2) }}</td>
            </tr>
            <tr>
                <td>Valor por Multa</td>
                <td>{{ number_format($permiso->valor_multa ?? 0, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td style="text-align:center;">TOTAL</td>
                <td><span class="text-14">$ {{ number_format($permiso->valor_total, 2) }}</span></td>
            </tr>
        </table>
        <table class="tabla-fechas">
            <tr>
                <td>
                    <span class="bold">Fecha de expedición:</span>
                    {{ strtoupper(\Carbon\Carbon::parse($permiso->fecha_expedicion)->translatedFormat('d \\d\\e F \\d\\e Y')) }}
                </td>

                <td class="text-right">
                    <span class="bold">Fecha de caducidad:</span>
                    {{ strtoupper(\Carbon\Carbon::parse($permiso->fecha_caducidad)->translatedFormat('d \\d\\e F \\d\\e Y')) }}
                </td>
            </tr>
        </table>

        <div class="text-justify">
            Por haber cumplido con los requisitos puntualizados en el Reglamento General de dicha Ley.
        </div>

        <div class="footer-permiso">
            <div class="slogan">
                {{ $institucion->slogan }}
            </div>

            @php
                $firmantes = $permiso->plantilla->personalPlantilla ?? collect();

                if ($firmantes->isEmpty()) {
                    $firmas = collect([
                        ['pos'=>'L','nombre'=>null,'puesto'=>'JEFE DEL CBCY'],
                        ['pos'=>'C','nombre'=>null,'puesto'=>'TESORERO/A'],                        
                        ['pos'=>'R','nombre'=>null,'puesto'=>'RECAUDADOR/A'],
                    ]);
                } else {
                    $firmas = $firmantes->map(function ($f) {
                        return [
                            'pos' => $f->posicion_firmante,
                            'nombre' => $f->firmante->nombre ?? null,
                            'puesto' => $f->puesto
                        ];
                    })->filter(fn($f)=>$f['puesto'])->values();
                }

                $count = $firmas->count();

                if ($count == 1) {
                    $anchos = ['100%'];
                } elseif ($count == 2) {
                    $anchos = ['40%','20%','40%'];
                } else {
                    $anchos = ['33.33%','33.33%','33.33%'];
                }
            @endphp

            <table class="tabla-firmas">
                <tr>
                    @if($count == 1)
                        <td width="100%">
                            <div class="linea-firma"></div>
                            <div class="nombre-firma">
                                {{ ucwords(mb_strtolower($firmas[0]['nombre'])) }}
                            </div>        
                            <div class="cargo-firma">{{ $firmas[0]['puesto'] }}</div>
                        </td>
                    @elseif($count == 2)
                        <td width="40%">
                            <div class="linea-firma"></div>
                            <div class="nombre-firma">
                                {{ ucwords(mb_strtolower($firmas[0]['nombre'])) }}
                            </div>        
                            <div class="cargo-firma">{{ $firmas[0]['puesto'] }}</div>
                        </td>
                        <td width="20%"></td>
                        <td width="40%">
                            <div class="linea-firma"></div>
                            <div class="nombre-firma">
                                {{ ucwords(mb_strtolower($firmas[1]['nombre'])) }}
                            </div>        
                            <div class="cargo-firma">{{ $firmas[1]['puesto'] }}</div>
                        </td>
                    @else
                        @foreach($firmas as $firma)
                            <td width="33.33%">
                                <div class="linea-firma"></div>
                                <div class="nombre-firma">
                                    {{ ucwords(mb_strtolower($firma['nombre'])) }}
                                </div>            
                                <div class="cargo-firma">{{ $firma['puesto'] }}</div>
                            </td>
                        @endforeach
                    @endif
                </tr>
            </table>   
        </div>
    </div>
</div>
</body>
</html>