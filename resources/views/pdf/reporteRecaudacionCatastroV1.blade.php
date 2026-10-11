<!DOCTYPE>
<html>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Reporte de recaudaciones de Catastros #{{$reporte->numero}}</title>
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
            width: 180px;
            margin: 0 auto 5px auto;
        }

        .cargo-firma {
            font-weight: bold;
            font-size: 11px;
        }
    </style>
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
                    <th width="8%">Período</th>
                    <th width="8%">Número</th>
                    <th width="10%">Documento</th>
                    <th width="24%">Cliente</th>
                    <th width="24%">Clave catastral / Número</th>
                    <th width="14%">Parroquia</th>
                    <th width="10%">Valor total</th>
                </tr>
            </thead>
            </tbody>
                @php $valor_total = 0; @endphp
                @foreach ($catastros as $catastro)
                        <tr>
                            <td class="text-center">{{$loop->iteration}}</td>
                            <td class="text-center">{{\Carbon\Carbon::parse($catastro->fecha)->format('Y') }}</td>
                            <td class="text-center">{{$catastro->numero_formateado}}</td>
                            <td class="text-center">{{$catastro->catastro->cliente?->documento}}</td>
                            <td class="text-justify">{{$catastro->catastro->cliente?->nombre}}</td>
                            <td class="text-center"><div>{{$catastro->catastro->clave_catastral}}</div><div>{{$catastro->catastro->numero_predio}}</div></td>
                            <td class="text-center">{{$catastro->catastro->parroquia?->nombre}}</td>
                            <td class="text-right">{{ number_format($catastro->valor_total, 2) }}</td>
                        </tr>
                        @php $valor_total += $catastro->valor_total; @endphp
                @endforeach
                <tr>
                    <td colspan="7" class="text-right font-bold">Total recaudado del día:</td>
                    <td class="text-right font-bold">{{ number_format($valor_total, 2) }}</td>
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
    </body>
</html>


