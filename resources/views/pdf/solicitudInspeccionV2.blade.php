<html>
<head>
    <meta charset="UTF-8">
    <title>Solicitud #{{ $solicitudInspeccion->numero_formateado }}</title>

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

        body {
            font-family: 'Roboto', sans-serif;
            font-size: 12px;
            line-height: 14px;
        }

        @page {
            margin-top: 10em;
            margin-left: 4em;
            margin-right: 4em;
            margin-bottom: 2em;
        }

        .marco-solicitud {
            position: fixed;
            top: -8em;
            left: -1em;
            right: -1em;
            bottom: 0;
            border: 1px solid #000;
            padding: 15px;
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

        #content {
            margin-top: 120px;
        }

        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }
        .text-9 { font-size: 9px; }
        .text-15 { font-size: 15px; }

        .line {
            border-bottom: 1px dotted #000;
            display: inline-block;
            min-width: 250px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 2px 0;
            vertical-align: top;
        }

        .tabla-direccion {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-top: 10px;
            line-height: 12px;
        }

        .titulo-direccion {
            text-align: center;
            font-weight: bold;
            padding: 6px;
        }

        .tabla-direccion td {
            padding: 4px 6px;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
        }

        .value {
            margin-left: 5px;
        }

        .tabla-inspeccion {
            width: 100%;
            border-collapse: collapse;
            line-height: 12px;
        }

        .tabla-inspeccion td {
            width: 50%;
            padding: 2px 4px;
            vertical-align: middle;
        }

        .item {
            width: 100%;
            display: table;
        }

        .item span {
            display: table-cell;
        }

        .item span:first-child {
            text-align: left;
        }

        .check {
            border: 1px solid #000;
            width: 14px;
            height: 12px;
            text-align: center;
        }

        .footer {
            margin-top: 80px;
            text-align: left;
            font-size: 10px;
            line-height: 11px;
        }

        .nota {
            position: absolute;
            text-align: center;
            right: 15px;
            bottom: -120px;
            width: 230px; 
            height: 40px;
            border: 1px solid #000;
            line-height: 8px;
            box-sizing: border-box;
            padding-top: 4px;
        }
    </style>
</head>

<body>
<div class="marco-solicitud">
    <header>
        <div style="position:absolute; top:0; left:0;">
            <img src="{{ asset('images/logo1.jpg') }}" alt="Logo">
        </div>

        <div>
            <div class="bold text-15" >{{ $institucion->razon_social }}</div>
            <div>Teléfono: {{ $institucion->telefonos }} - email: {{ $institucion->email }}</div>
            <div>Dirección: {{ $institucion->direccion }} - RUC: {{ $institucion->ruc }}</div>
        </div>

        <div class="text-center bold mt-10 text-15">
            DEPARTAMENTO DE PREVENCIÓN CONTRA INCENDIOS
        </div>

        <div class="text-center bold mt-10 text-15">
            SOLICITUD DE INSPECCIÓN DE SERVICIO
        </div>
    </header>

    <div id="content">

        <!-- Fecha -->
        <div class="text-left">
            Yantzaza, {{ \Carbon\Carbon::parse($solicitudInspeccion->fecha_solicitud)->translatedFormat('d \\d\\e F \\d\\e Y') }}
        </div>

        <!-- Destinatario -->
        <p class="mt-20">
            Señor/a <br>
            <span class="bold">JEFE DEL CUERPO DE BOMBEROS DEL CANTÓN YANTZAZA</span><br>
            Presente.-
        </p>

        <p>De mi consideración:</p>

        <!-- Datos del solicitante -->
        <p style="text-align: justify;">
            Yo, {{ $solicitudInspeccion->procesoPermiso->cliente->nombre ?? '' }}, 
            con CC/RUC N° {{ $solicitudInspeccion->procesoPermiso->cliente->documento ?? '' }}, 
            Representante Legal de 
            @php
                $actividad = '';

                if ($solicitudInspeccion->procesoPermiso?->actividadEconomica?->tipo_actividad == 'E') {
                    $actividad = $solicitudInspeccion->procesoPermiso?->actividadEconomica?->e_nombre_comercial;
                } else {
                    $actividad = trim(
                        $solicitudInspeccion->procesoPermiso?->actividadEconomica?->v_placa . ' ' .
                        $solicitudInspeccion->procesoPermiso?->actividadEconomica?->v_marca . ' ' .
                        $solicitudInspeccion->procesoPermiso?->actividadEconomica?->v_tipo . ' ' .
                        $solicitudInspeccion->procesoPermiso?->actividadEconomica?->v_clase . ' ' .
                        $solicitudInspeccion->procesoPermiso?->actividadEconomica?->v_color
                    );
                }
            @endphp
            "{{ $actividad }}",            
            registrado con la actividad {{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_actividad_principal ?? '' }}
            y teléfono (s) {{ $solicitudInspeccion->procesoPermiso->cliente->telefonos ?? '' }}.
        </p>

        <!-- Dirección -->
        <table class="tabla-direccion">
            <tr>
                <td colspan="4" class="titulo-direccion">DIRECCIÓN</td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">BARRIO/URBANIZACIÓN:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_sector}}</span>
                </td>
                <td colspan="2">
                    <span class="label">PARROQUIA:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->parroquia->nombre}}</span>
                </td>
            </tr>
            <tr>
                <td colspan="4">
                    <span class="label">DIRECCIÓN:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_direccion}}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">EDIFICIO/PROYECTO:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_edificio}}</span>
                </td>
                <td>
                    <span class="label">PISO:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_piso}}</span>
                </td>
                <td>
                    <span class="label">DEPARTAMENTO:</span>
                    <span class="value">{{ $solicitudInspeccion->procesoPermiso->actividadEconomica->e_deparamento}}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">CONTACTARSE CON:</span>
                </td>
                <td colspan="2">
                    <span class="label">TELÉFONO:</span>
                </td>
            </tr>
        </table>

        <!-- Solicitud -->
        <p class="mt-20">
            Por medio del presente solicito a usted, se digne autorizar a quien corresponda, realice el siguiente trabajo:
        </p>

        <table class="tabla-inspeccion">
            <tr>
                <td>
                    <div class="item">
                        <span>INSPECCIÓN</span>
                        <span class="check">
                            {{ $solicitudInspeccion->procesoPermiso->tipo_permiso_id == 2 ? 'X' : '' }}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="item">
                        <span>FACTIBILIDAD DE GAS</span>
                        <span class="check">                     
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="item">
                        <span>INSPECCIÓN VEHICULAR</span>
                        <span class="check">
                            {{ $solicitudInspeccion->procesoPermiso->tipo_permiso_id == 5 ? 'X' : '' }}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="item">
                        <span>DEFINITIVO DE GAS</span>
                        <span class="check">                     
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="item">
                        <span>CONSTATACIÓN DE PLAN DE AUTOPROTECCIÓN</span>
                        <span class="check">                     
                        </span>
                    </div>
                </td>
                <td>
                    <div class="item">
                        <span>VISTO BUENO DE PLANOS</span>
                        <span class="check">
                            {{ $solicitudInspeccion->procesoPermiso->tipo_permiso_id == 4 ? 'X' : '' }}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="item">
                        <span>RESELLOS DE PLANOS</span>
                        <span class="check">
                        </span>
                    </div>
                </td>
                <td>
                    <div class="item">
                        <span>VISTO BUENO DE PLANOS</span>
                        <span class="check">
                            {{ $solicitudInspeccion->procesoPermiso->tipo_permiso_id == 7 ? 'X' : '' }}
                        </span>
                    </div>
                </td>
            </tr>
            <tr><td colspan="2">OTROS: <span class="line"></span></td></tr>
        </table>

        <!-- Autorización -->
        <p class="mt-20">
            <p style="text-align: justify;">Autorizo al personal de prevención a fin que autorice la inspección externa e interna en el local arriba antes mencionado, cuya geolocalización detallo a continuación:</p>
            @if(!empty($solicitudInspeccion->procesoPermiso->actividadEconomica->e_ruta_mapa) && file_exists(public_path($solicitudInspeccion->procesoPermiso->actividadEconomica->e_ruta_mapa)))
                <div style="text-align:center; margin-top:10px;">
                    <img src="{{ asset($solicitudInspeccion->procesoPermiso->actividadEconomica->e_ruta_mapa) }}" width="350">
                </div>
            @else
                <p style="text-align:center"><b>Ubicación no disponible</b></p>
            @endif
        </p>

        <!-- Firma -->
        <div class="footer">
            <p>Atentamente,</p>

            <br><br><br>

            <span class="bold">Firma:</span> <span class="line"></span>
            <div><span class="bold">Nombre:</span> {{ $solicitudInspeccion->procesoPermiso->cliente->nombre ?? '' }}</div>
            <div><span class="bold">CC/RUC:</span> {{ $solicitudInspeccion->procesoPermiso->cliente->documento ?? '' }}</div>
        </div>

        <!-- Nota -->
        <div class="nota text-9">
            <b>NOTA</b><br> El CBC-Y se deslinda de responsabilidad si los datos proporcionados son erróneos.
        </div>

    </div>
</div>
</body>
</html>