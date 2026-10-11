<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Permisos de Funcionamiento #{{$reporte->numero}}</title>
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
            margin-top: 8em;
            margin-left: 3em;
            margin-right: 3em;
            margin-bottom: 3em;
        }

        body {
            font-family: 'Roboto', sans-serif;
            font-size: 12px;
            line-height: 12px;
            position: relative;
        }

        header { 
            position: fixed;
            top: -7em;
            left: 0;
            right: 0;
            height: 6em;
            text-align: center;
        }

        header img {
            position: absolute;
            top: 10px;
            left: 10px;
            width: 75px;
        }

        header .institucion {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
        }

        header .institucion p {
            margin: 0;
        }

        header .reporte-info {
            position: absolute;
            top: 60px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-weight: bold;
        }

        header .reporte-info p {
            margin: 2px 0;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify { text-align: justify; }
        .font-bold { font-weight: bold; }

        .tabla-reporte {
            border-collapse: collapse;
            width: 100%;
        }

        .tabla-reporte th, .tabla-reporte td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 11px;
        }

        .tabla-reporte th {
            background-color: #E5E7EB;
        }

        .tabla-firmas {
            margin-top: 110px;
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
            width: 250px;
            margin: 0 auto 5px auto;
        }

        .cargo-firma {
            font-weight: bold;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <header>
        <img src="{{ asset('images/logo1.jpg') }}" alt="Logo">
        <div class="institucion">
            <p>{{$institucion->razon_social}}</p>
            <p>RUC: {{$institucion->ruc}}</p>
        </div>
        <div class="reporte-info">
            <p>INFORME DE RECAUDACIÓN N° <span style="color:red">{{$reporte->numero}}</span></p>
            <p>{{ mb_strtoupper(\Carbon\Carbon::parse($reporte->fecha)->translatedFormat('d \d\e F \d\e Y')) }}</p>
        </div>
    </header>

    <main>
        <table class="tabla-reporte">
            <thead>
                <tr>
                    <th width="2%">#</th>
                    <th width="6%">Número</th>
                    <th width="12%">Tipo de permiso</th>
                    <th width="10%">Documento</th>
                    <th width="20%">Cliente</th>
                    <th width="24%">Actividad económica</th>
                    <th width="8%">Valor</th>
                    <th width="10%">Fecha depósito</th>
                    <th width="10%">Documento depósito</th>
                </tr>
            </thead>
            <tbody>
                @php $valor_total = 0; @endphp
                @foreach ($permisos as $permiso)
                    <tr>
                        <td class="text-center">{{$loop->iteration}}</td>
                        <td class="text-center">{{$permiso->numero_formateado}}</td>
                        <td class="text-center">{{$permiso->procesoPermiso?->tipoPermiso?->nombre}}</td>
                        <td class="text-center">{{$permiso->procesoPermiso?->cliente?->documento}}</td>
                        <td class="text-justify">{{$permiso->procesoPermiso?->cliente?->nombre}}</td>
                        <td class="text-justify">
                            @if ($permiso->procesoPermiso?->actividadEconomica?->tipo_actividad == 'E')
                                {{$permiso->procesoPermiso?->actividadEconomica?->e_nombre_comercial}}
                            @elseif ($permiso->procesoPermiso?->actividadEconomica?->tipo_actividad == 'V')
                                <div>
                                    <b>{{ $permiso->procesoPermiso?->actividadEconomica?->v_placa }}</b>
                                </div>
                                <div>
                                    {{ $permiso->procesoPermiso?->actividadEconomica?->v_marca }}
                                    {{ $permiso->procesoPermiso?->actividadEconomica?->v_tipo }}
                                    {{ $permiso->procesoPermiso?->actividadEconomica?->v_clase }}
                                    {{ $permiso->procesoPermiso?->actividadEconomica?->v_color }}
                                </div>
                            @endif
                        </td>
                        <td class="text-right">{{ number_format($permiso->valor_total, 2) }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($permiso->fecha_deposito)->format('Y-m-d') }}</td>
                        <td class="text-center">{{ $permiso->documento_deposito }}</td>
                    </tr>
                    @php $valor_total += $permiso->valor_total; @endphp
                @endforeach

                <tr>
                    <td colspan="6" class="text-right font-bold">Total recaudado del día:</td>
                    <td class="text-right font-bold">{{ number_format($valor_total, 2) }}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>

        @if (!empty($reporte->observaciones))
            <p class="font-bold" style="margin:10px 0 2px 0;">Observaciones:</p>
            <p class="text-justify" style="margin:0;">{{ $reporte->observaciones }}</p>
        @endif

        @php
            $firmas = [
                ['nombre' => null, 'puesto' => 'JEFE DEL CUERPO DE BOMBEROS DE YANTZAZA'],
                ['nombre' => null, 'puesto' => 'RECAUDADOR/A DEL CUERPO DE BOMBEROS DE YANTZAZA'],
            ];
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
    </main>
</body>
</html>