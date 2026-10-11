<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Parte de Emergencia</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 5px; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Parte de Emergencia #{{ $parte->numero }}</h1>
        <p>{{ $parte->categoria1 }} - {{ $parte->categoria2 }}</p>
    </div>

    <div class="section">
        <strong>Parroquia / Dirección:</strong> {{ $parte->parroquia?->nombre }} / {{ $parte->direccion }}<br>
        <strong>Fecha de salida:</strong> {{ $parte->fecha_salida }}<br>
        <strong>Personal:</strong> {{ $parte->nombre_personal }}
    </div>

    <div class="section">
        <h3>Archivos:</h3>
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                </tr>
            </thead>
            <tbody>
                @foreach($parte->archivos as $archivo)
                    <tr>
                        <td>{{ $archivo->nombre }}</td>
                        <td>{{ $archivo->tipo }}</td>
                        <td>{{ number_format($archivo->size / 1024, 1) }} KB</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>