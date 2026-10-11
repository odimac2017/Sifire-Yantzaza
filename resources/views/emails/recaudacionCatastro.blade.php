<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            color: #333;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
        }

        .content {
            margin-top: 20px;
            text-align: justify;
        }

        .box {
            border: 1px solid #ccc;
            padding: 10px;
            margin-top: 15px;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }

        .btn {
            display: inline-block;
            padding: 8px 12px;
            background: #000;
            color: #fff;
            text-decoration: none;
            margin-top: 10px;
        }

    </style>
</head>
<body>

<div class="container">

    <div class="header">
        <div class="title">COMPROBANTE DE RECAUDACIÓN DE CATASTROS</div>
    </div>

    <div class="content">
        <p>Estimado/a <strong>{{ $recaudacionCatastro->catastro->cliente->nombre }}</strong>,</p>

        <p>
            Por medio del presente se remite el comprobante de recaudación de catastros correspondiente 
            al año <strong>{{ \Carbon\Carbon::parse($recaudacionCatastro->fecha)->year }}</strong>.
        </p>

        <div class="box">
            <p><strong>Número de comprobante:</strong> <span style="color: red;">{{ $recaudacionCatastro->numero_formateado }}</span></p>
            <p><strong>Fecha:</strong> {{ strtoupper(\Carbon\Carbon::parse($recaudacionCatastro->fecha)->translatedFormat('d \\d\\e F \\d\\e Y')) }}</p>
        </div>

        <p>
            Puede verificar la autenticidad del documento mediante el siguiente enlace:
        </p>

        <p>
            <a href="{{ rtrim($configuracion->link_verificacion_qr, '/') . '/recaudacionescatastros/' . $recaudacionCatastro->codigo_verificacion . '/verificar' }}" class="btn">
                Verificar documento
            </a>
        </p>

        <p>
            También puede utilizar el código QR incluido en el documento adjunto.
        </p>

        <p>
            Este documento tiene validez legal conforme a la normativa vigente sobre firma electrónica.
        </p>
    </div>

    <div class="footer">
        <p><strong>IMPORTANTE:</strong><br>
            Este es un mensaje automático, por favor no responder a este correo.
        </p>

        <p>
            {{ config('app.name') }}            
        </p>
    </div>

</div>

</body>
</html>