<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Parte de emergencia #{{ $parteEmergencia->numero }}</title>
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
            margin-top: 10em;
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
            top: -7.5em;
            left: 0;
            right: 0;
            height: 6em;
            text-align: center;
        }

        header .institucion {
            top: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 14px;
        }

        header img {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 80px;
        }

        .content {
            position: relative;
        }

        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify {text-align: justify; }
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

        .tabla {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            line-height: 13px;
            page-break-inside: avoid;
        }

        .tabla th{
            background:#d9d9d9;
            text-align:center;
            padding:2px;
            font-weight:bold;
        }

        .tabla td {
            padding: 10px 8px;
            vertical-align: middle;
        }

        .item {
            display: inline-block;
            margin-right: 20px;
        }

        .check {
            display: inline-block;
            border: 1px solid #000;
            width: 18px;
            height: 16px;
            text-align: center;
            line-height: 12px;
            margin-right: 4px;
            vertical-align: middle;
        }

        .tabla-html {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            line-height: 14px;
            page-break-inside: avoid;
        }

        .tabla-html th{
            background:#d9d9d9;
            text-align:center;
            font-weight:bold;
        }

        .tabla-html td {
            vertical-align: top;
            padding: 0px 8px;
            text-align: justify;
        }

        .tabla-oficial {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            line-height: 14px;
            page-break-inside: avoid;
        }

        .tabla-oficial th{
            background:#d9d9d9;
            text-align:center;
            font-weight:bold;
        }

        .tabla-oficial td {
            vertical-align: top;
            padding: 6px 8px;
            text-align: justify;
        }

        .slogan {
            margin-top: 30px;
            text-align: center;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .tabla-firma {
            margin-top: 90px;
            left: 0;
            width: 100%;
            text-align: center;
        }

        .tabla-firma td {
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
    <header>
        <div style="position:absolute; top:0; left:0;">
            <img src="{{ asset('images/logo1.jpg') }}" alt="Logo">
        </div>
        <div class="institucion">
            <div class="bold text-14" >{{ $institucion->razon_social }}</div>
            <div class="text-10">Teléfono: {{ $institucion->telefonos }} - email: {{ $institucion->email }}</div>
            <div class="text-10">Dirección: {{ $institucion->direccion }} - RUC: {{ $institucion->ruc }}</div>
        </div>

        <div class="text-center bold mt-10">
            DEPARTAMENTO DE PREVENCIÓN CONTRA INCENDIOS
        </div>

        <div class="text-center text-14 bold mt-10">
            PARTE DE EMERGENCIA N° <span style="color: red;">{{ $parteEmergencia->numero }}</span>
        </div>
    </header>
    <div class="content">
        <div class="text-right">
            Yantzaza, {{ \Carbon\Carbon::parse($parteEmergencia->created_at)->translatedFormat('d \\d\\e F \\d\\e Y') }}
        </div>

        <table class="tabla-sin-borde mt-10">
            <tr>
                <td>
                    <span class="label">Para:</span>
                    <span class="value">DEPARTAMENTO DE PREVENCIÓN Y RIESGOS</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Categoría:</span>
                    <span class="value">{{ $parteEmergencia->categoria1 }} » {{ $parteEmergencia->categoria2 }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Dirección:</span>
                    <span class="value">{{ $parteEmergencia->direccion }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Fecha y hora de salida:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($parteEmergencia->fecha_salida)->translatedFormat('d \\d\\e F \\d\\e Y H:i')) }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Fecha y hora de llegada:</span>
                    <span class="value">{{ strtoupper(\Carbon\Carbon::parse($parteEmergencia->fecha_llegada)->translatedFormat('d \\d\\e F \\d\\e Y H:i')) }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Nombre del propietario o arrendatario:</span>
                    <span class="value">{{ $parteEmergencia->nombre_propietario }}</span>
                </td>
            </tr>
        </table>

        <table class="tabla mt-10">
            <tr>
                <th colspan="6">TIPO DE CONSTRUCCIÓN</th>
            </tr>
            <tr>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_hormigon == 1 ? 'X' : '' }}
                        </span> Hormigón
                    </div>
                </td>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_cana == 1 ? 'X' : '' }}
                        </span>
                        <span>Caña</span>
                    </div>
                </td>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_madera == 1 ? 'X' : '' }}
                        </span>
                        <span>Madera</span>
                    </div>
                </td>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_mixta == 1 ? 'X' : '' }}
                        </span>
                        <span>Mixta</span>
                    </div>
                </td>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_metalica == 1 ? 'X' : '' }}
                        </span>
                        <span>Metálica</span>
                    </div>
                </td>
                <td>
                    <div class="item">                        
                        <span class="check">
                            {{ $parteEmergencia->tipo_cons_ladrillo == 1 ? 'X' : '' }}
                        </span>
                        <span>Ladrillo</span>
                    </div>
                </td>
            </tr>
        </table>

        <table class="tabla-html mt-10">
            <tr>
                <th>DAÑOS MATERIALES</th>
            </tr>
            <tr>
                <td>{!! $parteEmergencia->danos_materiales !!}</td>
            </tr>
        </table>

        <table class="tabla-html mt-10">
            <tr>
                <th>VÍCTIMAS DE LA EMERGENCIA</th>
            </tr>
            <tr>
                <td>{!! $parteEmergencia->victimas !!}</td>
            </tr>
        </table>

        @if (!empty($parteEmergencia->origen))
            <table class="tabla-html mt-10">
                <tr>
                    <th>POSIBLES CAUSAS Y ORIGEN DE LA EMERGENCIA</th>
                </tr>
                <tr>
                    <td>{!! $parteEmergencia->origen !!}</td>
                </tr>
            </table>
        @endif

        <table class="tabla-html mt-10">
            <tr>
                <th>CÍAS QUE ASISTEN</th>
            </tr>
            <tr>
                <td>{!! $parteEmergencia->cias_asisten !!}</td>
            </tr>
        </table>

        <table class="tabla-html mt-10">
            <tr>
                <th>EQUIPOS Y MATERIALES QUE UTILIZA</th>
            </tr>
            <tr>
                <td>{!! $parteEmergencia->equipos_materiales !!}</td>
            </tr>
        </table>

        <table class="tabla-oficial mt-10">
            <tr>
                <th>OFICIAL AL MANDO</th>
            </tr>
            <tr>
                <td>
                    {{ $parteEmergencia->nombre_oficial }}
                    @if($parteEmergencia->puesto_oficial)
                        , {{ $parteEmergencia->puesto_oficial }}
                    @endif
                </td>
            </tr>
        </table>

        <table class="tabla-oficial mt-10">
            <tr>
                <th>PERSONAL DE QAP (APOYO EN EMERGENCIA)</th>
            </tr>
            <tr>
                <td>
                    <ul style="margin:0; padding-left:15px;">
                        @foreach ($parteEmergencia->personalesQap as $personal)
                            <li>{{ $personal->pivot->nombre_personal }}</li>
                        @endforeach
                    </ul>
                </td>
            </tr>
        </table>

        @if($parteEmergencia->personal_externo)
            <table class="tabla-html mt-10">
                <tr>
                    <th>PERSONAL EXTERNO (APOYO EN EMERGENCIA)</th>
                </tr>
                <tr>
                    <td>{!! $parteEmergencia->personal_externo !!}</td>
                </tr>
            </table>
        @endif

        <table class="tabla-html mt-10">
            <tr>
                <th>NOVEDADES REGISTRADAS</th>
            </tr>
            <tr>
                <td>{!! $parteEmergencia->novedades !!}</td>
            </tr>
        </table>

        <div class="slogan">
            {{ $institucion->slogan }}
        </div>

        <table class="tabla-firma">
            <tr>
                <td>
                    <div class="linea-firma"></div>
                    <div>{{ $parteEmergencia->nombre_personal }}</div>
                    <div class="cargo-firma">{{ $parteEmergencia->puesto_personal }}</div>
                </td>
            </tr>
        </table>

    </div>
</div>
</body>
</html>