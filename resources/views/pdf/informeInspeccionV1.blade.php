<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Inspección #{{ $inspeccion->numero_formateado }}</title>
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
            margin-left: 4em; 
            margin-right: 4em; 
            margin-bottom: 1em; 
        }

        body {
            font-family: 'Roboto', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        .header {
            width: 100%;
            text-align: center;
            margin-bottom: 10px;
            line-height: 11px;
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
        
        .qr {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 90px;
        }

        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-10 { font-size: 10px; }
        .text-14 { font-size: 14px; }
        .mt-5 { margin-top: 5px; }
        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }

        .section {
            margin-top: 10px;
        }

        .tabla-sin-borde {
            width: 100%;
            border-collapse: collapse;
            line-height: 11px;
        }

        .tabla-datos { 
            width: 100%; 
            border: 1px solid #000; 
            border-collapse: collapse; 
            line-height: 10px; 
        } 
        
        .tabla-datos td { 
            padding: 4px 6px; 
            vertical-align: top; 
        } 
        
        .titulo-datos { 
            text-align: center; 
            font-weight: bold; 
            padding: 6px; 
        }   

        .check {
            border: 1px solid #000;
            width: 14px;
            height: 14px;
            display: inline-block;
            text-align: center;
            line-height: 12px;
        }

        .tabla-firmas {
            margin-top: 60px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 11px;
        }

        .tabla-firmas td {
            width: 25%;
            vertical-align: top;
        }

        .linea-firma {
            border-top: 1px solid #000;
            width: 200px;
            margin: 0 auto 5px auto;
        }

        .documento-firma {
            font-weight: bold;
            font-size: 11px;
        }

        .footer {
            margin-top: 70px;
            text-align: center;
            font-size: 10px;
            line-height: 11px;
        }

        .footer-note {
            margin-top: 5px;
            font-size: 9px;
            text-align: justify;
            line-height: 9px;
        }
    </style>
</head>
<body>

<div class="header">
    <img class="logo" src="{{ asset('images/logo1.jpg') }}" alt="Logo">
    <img class="qr" src="data:image/png;base64, {{ $qrBase64 }}">
    <div class="institucion">
        <div class="bold text-14" >{{ $institucion->razon_social }}</div>
        <div class="text-10">Teléfono: {{ $institucion->telefonos }} - email: {{ $institucion->email }}</div>
        <div class="text-10">Dirección: {{ $institucion->direccion }} - RUC: {{ $institucion->ruc }}</div>
    </div>

    <div class="text-center bold mt-5">
        DEPARTAMENTO DE PREVENCIÓN CONTRA INCENDIOS
    </div>

    <div class="text-center text-14 bold mt-5">
        INFORME DE INSPECCIÓN N° <span style="color: red;">{{ $inspeccion->numero_formateado }}</span>
    </div>
</div>

<div class="section">
    <table class="tabla-datos">
        <tr>
            <td colspan="2"><strong>Razón Social:</strong>
                @if ($inspeccion->procesoPermiso?->actividadEconomica?->tipo_actividad == 'E')
                    {{$inspeccion->procesoPermiso?->actividadEconomica?->e_nombre_comercial}}
                @elseif ($inspeccion->procesoPermiso?->actividadEconomica?->tipo_actividad == 'V')
                    {{ $inspeccion->procesoPermiso?->actividadEconomica?->v_placa }}
                    {{ $inspeccion->procesoPermiso?->actividadEconomica?->v_marca }}
                    {{ $inspeccion->procesoPermiso?->actividadEconomica?->v_tipo }}
                    {{ $inspeccion->procesoPermiso?->actividadEconomica?->v_clase }}
                    {{ $inspeccion->procesoPermiso?->actividadEconomica?->v_color }}
                @endif 
            </td>
        </tr>
        <tr>
            <td><strong>Nombre:</strong> {{ $inspeccion->procesoPermiso->cliente->nombre }}</td>
            <td>
                <strong>Propietario</strong>
                <span class="check">{{ $inspeccion->tipo_funcion == 'P' ? 'X' : '' }}</span>

                <strong style="margin-left:10px;">Arrendatario</strong>
                <span class="check">{{ $inspeccion->tipo_funcion == 'A' ? 'X' : '' }}</span>
            </td>
        </tr>
        <tr>
            <td><strong>RUC:</strong> {{ $inspeccion->procesoPermiso->cliente->documento }}</td>
            <td><strong>Teléfono:</strong> {{ $inspeccion->procesoPermiso->cliente->telefonos }}</td>
        </tr>
        <tr>
            <td><strong>Dirección:</strong> {{ $inspeccion->procesoPermiso->cliente->direccion }}</td>
            <td><strong>Fecha:</strong> {{ \Carbon\Carbon::parse($inspeccion->fecha_inspeccion)->format('d/m/Y') }}</td>
        </tr>
    </table>

    <table class="tabla-datos mt-5">
        <tr>
            <td colspan="4" class="titulo-datos" style="background-color:darkgray;">TIPO DE CONSTRUCCIÓN</td>
        </tr>
        <tr>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->tipo_cons_hormigon ? 'X' : '' }}</span> Hormigón</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->tipo_cons_metalica ? 'X' : '' }}</span> Metálica</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->tipo_cons_madera ? 'X' : '' }}</span> Madera</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->tipo_cons_otros ? 'X' : '' }}</span> Otros</td>
        </tr>
    </table>

    <table class="tabla-datos mt-5">
        <tr>
            <td colspan="4" class="titulo-datos" style="background-color:darkgray;">TIPO DE COMBUSTIBLE</td>
        </tr>
        <tr>
            <td style="line-height: 18px;"><strong>Nro. de surtidores:</strong> {{ $inspeccion->tipo_comb_surtidores }}</td>
            <td style="line-height: 18px;">
                <span class="check">{{ $inspeccion->tipo_comb_diesel == 1 ? 'X' : ''}}</span>
                <span>Diésel</span>
                
                <span style="margin-left: 17;" class="check">{{ $inspeccion->tipo_comb_gasolina == 1 ? 'X' : ''}}</span>
                <span>Gasolina</span>
            </td>
            <td style="line-height: 18px;"><strong>Capacidad Diésel:</strong> {{ $inspeccion->tipo_comb_cap_diesel }} Gls</td>
            <td style="line-height: 18px;"><strong>Capacidad Gasolina:</strong> {{ $inspeccion->tipo_comb_cap_gasolina }} Gls</td>
        </tr>
        <tr>
            <td><span class="check">{{ $inspeccion->tipo_comb_transporte ? 'X' : '' }}</span> Transporte</td>
            <td><span class="check">{{ $inspeccion->tipo_comb_vehiculo ? 'X' : '' }}</span> Vehículo</td>
            <td><span class="check">{{ $inspeccion->tipo_comb_almacenamiento ? 'X' : '' }}</span> Almacenamiento</td>
            <td><span class="check">{{ $inspeccion->tipo_comb_venta ? 'X' : '' }}</span> venta</td>
        </tr>
        <tr>
            <td><strong>Placas:</strong> {{ $inspeccion->tipo_comb_placas }}</td>
            <td><strong>Tipo de extintor:</strong> {{ $inspeccion->tipo_comb_extintor }}</td>
            <td><strong>Origen:</strong> {{ $inspeccion->tipo_comb_origen }}</td>
            <td><strong>Destino:</strong> {{ $inspeccion->tipo_comb_destino }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Cumple Normas INEN::</strong> {{ $inspeccion->tipo_comb_norma_inen }}</td>
            <td colspan="2"><strong>Observaciones:</strong> {{ $inspeccion->tipo_comb_observaciones }}</td>
        </tr>
    </table>

    <table class="tabla-datos mt-5">
        <tr>
            <td colspan="4" class="titulo-datos" style="background-color:darkgray;">INSTALACIONES ELÉCTRICAS</td>
        </tr>
        <tr>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->inst_elec_buenas ? 'X' : '' }}</span> Buenas</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->inst_elec_malas ? 'X' : '' }}</span> Malas</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->inst_elec_internas ? 'X' : '' }}</span> Internas</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->inst_elec_externas ? 'X' : '' }}</span> Externas</td>
        </tr>
        <tr>
            <td><span class="check">{{ $inspeccion->inst_elec_generador ? 'X' : '' }}</span> Generador</td>
            <td><span class="check">{{ $inspeccion->inst_elec_transformador ? 'X' : '' }}</span> Transformador</td>
            <td></td>
            <td></td>
        </tr>
    </table> 

    <table class="tabla-datos mt-5">
        <tr>
            <td colspan="4" class="titulo-datos" style="background-color:darkgray;">VENTILACIÓN</td>
        </tr>
        <tr>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->vent_natural ? 'X' : '' }}</span> Natural</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->vent_mecanica ? 'X' : '' }}</span> Malas</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->vent_adecuada ? 'X' : '' }}</span> Adecuada</td>
            <td style="line-height: 18px;"><span class="check">{{ $inspeccion->vent_escasa ? 'X' : '' }}</span> Escasa</td>
        </tr>
    </table>

    <table class="tabla-datos mt-5">
        <tr>
            <td colspan="4" class="titulo-datos" style="background-color:darkgray;">ÁREAS</td>
        </tr>
        <tr>
            <td><strong>Área 1:</strong> {{ $inspeccion->area1 }}</td>
            <td><strong>Área 2:</strong> {{ $inspeccion->area2 }}</td>
            <td><strong>Área 3:</strong> {{ $inspeccion->area3 }}</td>
            <td><strong>Área 4:</strong> {{ $inspeccion->area4 }}</td>
        </tr>
        <tr class="text-center" style="background-color:darkgray;">
            <td colspan="4"><strong>Área total:</strong> {{ $inspeccion->area_total }}m²</td>
        </tr>
    </table>

    <table class="tabla-datos mt-5">
        <tr>
            <td class="titulo-datos" style="background-color:darkgray;">AFORO</td>
        </tr>
        <tr>
            <td>
                <strong>Número máximo autorizado:</strong>
                @if ($inspeccion->aforo_personas)
                    {{ $inspeccion->aforo_personas }} personas
                @endif
            </td>
        </tr>
    </table>

    <table class="tabla-sin-borde">
        <tr>
            <td width="70%">
                <table class="tabla-datos mt-5">
                    <tr>
                        <td colspan="2" class="titulo-datos" style="background-color:darkgray;">SISTEMA DE DEFENSA CONTRA INCENDIOS</td>
                    </tr>
                    <tr>
                        <td style="line-height: 18px;"><span class="check">{{ $inspeccion->sist_ince_detectores_humo ? 'X' : '' }}</span> Detectores de humo</td>
                        <td style="line-height: 18px;"><span class="check">{{ $inspeccion->sist_ince_puerta_escape ? 'X' : '' }}</span> Puerta de escape</td>
                    </tr>
                    <tr>    
                        <td><span class="check">{{ $inspeccion->sist_ince_lamparas_emergencia ? 'X' : '' }}</span> Lámparas de emergencia</td>
                        <td><span class="check">{{ $inspeccion->sist_ince_puertas_contra_fuego ? 'X' : '' }}</span> Puertas contra fuego</td>
                    </tr>
                    <tr>
                        <td><span class="check">{{ $inspeccion->sist_ince_gabinetes ? 'X' : '' }}</span> Gabinetes</td>
                        <td><span class="check">{{ $inspeccion->sist_ince_senalizacion_emergencia ? 'X' : '' }}</span> Señalización de emergencia</td>
                    </tr>
                    <tr>    
                        <td><span class="check">{{ $inspeccion->sist_ince_sprinklers ? 'X' : '' }}</span> Sprinklers</td>
                        <td><span class="check">{{ $inspeccion->sist_ince_tanques_reserva_agua ? 'X' : '' }}</span> Tanques de reserva de agua</td>
                    </tr>
                    <tr>
                        <td><span class="check">{{ $inspeccion->sist_ince_alarma_incendio ? 'X' : '' }}</span> Alarma de incendio</td>
                        <td><span class="check">{{ $inspeccion->sist_ince_espumogeno ? 'X' : '' }}</span> Espumógeno</td>
                    </tr>
                    <tr>    
                        <td><span class="check">{{ $inspeccion->sist_ince_bombas_hidraulicas ? 'X' : '' }}</span> Bombas hidráulicas</td>
                        <td><span class="check">{{ $inspeccion->sist_ince_bombas_impulsion ? 'X' : '' }}</span> Bombas de impulsión o siamesas</td>
                    </tr>
                    <tr>
                        <td><span class="check">{{ $inspeccion->sist_ince_escaleras_emergencia ? 'X' : '' }}</span> Escaleras de emergencia</td>
                        <td></td>
                    </tr>
                </table>
            </td>
            <td width="30%" style="vertical-align: top;">
                <table class="tabla-datos mt-5">
                    <tr>
                        <td class="titulo-datos" style="background-color:darkgray;">EXTINTORES</td>
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">
                            <strong>Cantidad:</strong> {{ $inspeccion->procesoPermiso->extintores()->count() }}
                        </td>
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">
                            <strong>Tipo:</strong> {{ $inspeccion->procesoPermiso->extintores->take(4)->pluck('tipo')->implode(' / ') }}
                        </td>                        
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">
                            <strong>Capacidad:</strong> {{ $inspeccion->procesoPermiso->extintores->take(4)->pluck('capacidad')->implode(' / ') }}
                        </td>                        
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">
                            <strong>Estado:</strong> {{ $inspeccion->procesoPermiso->extintores->take(4)->pluck('estado')->map(fn($e) => \Illuminate\Support\Str::limit($e, 3, ''))->implode(' / ') }}
                        </td>                        
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">
                            <strong>Codigo:</strong> {{ $inspeccion->procesoPermiso->extintores->take(4)->pluck('numero')->map(fn($n) => str_pad($n, 3, '0', STR_PAD_LEFT))->implode(' / ') }}
                        </td>                        
                    </tr>
                    <tr>
                        <td style="line-height: 16.5px;">                            
                            <span class="check">{{ $inspeccion->capacitacion_extintores ? 'X' : '' }}</span> Capacitación dada
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="tabla-sin-borde">
        <tr>
            <td class="text-justify"><strong>Observaciones:</strong> {{ $inspeccion->observaciones ?? 'NINGUNA' }}</td>
        </tr>
        <tr>
            <td class="text-justify"><strong>Recomendaciones:</strong> {{ $inspeccion->recomendaciones ?? 'NINGUNA' }}</td>
        </tr>
    </table>

    <table class="tabla-sin-borde mt-5">
        <tr>
            <td width="40%">
                <strong>Plazo:</strong> {{ strtoupper(\Carbon\Carbon::parse($inspeccion->plazo_permiso)->translatedFormat('d \\d\\e F \\d\\e Y')) }}
            </td>
            <td width="20%">
                <strong>Notificación:</strong>
            </td>
            <td width="20%">
                <strong>Procede:</strong> {{ $inspeccion->estado == 'APROBADO' ? 'SI' : 'NO' }}
            </td>
            <td width="20%">
                <strong>Reinspección:</strong> {{ $inspeccion->estado != 'APROBADO' ? 'SI' : 'NO' }}
            </td>
        </tr>
    </table>

    <div class="footer">
        @if ($inspeccion->estado_firma == 'SIN_FIRMA')
            @php
                $firmas = [
                    ['puesto' => 'Propietario o Representante', 'documento' => ''],
                    ['puesto' => 'Inspector', 'documento' => 'CC. ' . $inspeccion->personal->documento ?? ''],   
                    ['puesto' => 'Inspector', 'documento' => ''],
                    ['puesto' => 'Acompañante', 'documento' => ''],
                ];
            @endphp

            <table class="tabla-firmas">
                <tr>
                    @foreach ($firmas as $firma)
                        <td>
                            @if ($firma['puesto'])   
                                <div class="linea-firma"></div>
                            @endif
                            
                            @if ($firma['puesto'])                            
                                <div>{{ $firma['puesto'] }}</div>
                            @endif

                            <div class="documento-firma">{{ $firma['documento'] }}</div>
                        </td>
                    @endforeach
                </tr>
            </table>
        @else
            <div><strong>INSPECTOR</strong></div>
            <div>CC: {{ $inspeccion->personal->documento ?? '' }}</div>
        @endif

        <div class="footer-note">
            <strong>IMPORTANTE:</strong>
            Art. 40 de la Ley de Defensa Contra Incencios y su Reglamento y Legislación Conexa, actualizada en Enero de 2008, dispone que los Jefes de los Cuerpos de Bomberos
            podrán conceder permisos anuales y ocasionales, clausura de locales y todas las medidas necesarias para prevenir y sancionar las violaciones a esta Ley.
        </div>
    </div>    

</div>
</body>
</html>