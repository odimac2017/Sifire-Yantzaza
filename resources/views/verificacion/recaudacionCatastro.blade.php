<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Verificación de Documento</title>

<style>

/* =========================
   BASE
========================= */

body{
    font-family: "Segoe UI", Arial, sans-serif;
    background:#f8fafc;
    margin:0;
    color:#0f172a;
}

/* =========================
   HEADER
========================= */

.header{
    background:#0f172a;
    color:white;
    padding:18px 30px;
    display:flex;
    align-items:center;
    justify-content:space-between;
}

.header h2{
    margin:0;
    font-size:18px;
    font-weight:600;
}

/* =========================
   CONTAINER
========================= */

.container{
    max-width:1000px;
    margin:40px auto;
    background:white;
    border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.06);
    padding:30px;
}

/* =========================
   ESTADO
========================= */

.estado{
    display:flex;
    align-items:center;
    gap:10px;
    background:#ecfdf5;
    border:1px solid #10b981;
    color:#065f46;
    padding:14px 16px;
    border-radius:10px;
    font-size:15px;
    font-weight:500;
    margin-bottom:25px;
}

/* =========================
   GRID
========================= */

.grid{
    display:grid;
    grid-template-columns: 1fr 220px;
    gap:25px;
}

/* =========================
   CARD
========================= */

.card{
    background:white;
    border:1px solid #e2e8f0;
    border-radius:12px;
    padding:22px;
    grid-column: 1 / -1;
}

.card h3{
    margin-top:0;
    margin-bottom:15px;
    font-size:16px;
    color:#0f172a;
}

/* =========================
   TEXTOS
========================= */

.datos p{
    margin:10px 0;
    font-size:14px;
    color:#475569;
}

.datos strong{
    color:#334155;
}

/* =========================
   FIRMA CARD
========================= */

.firma-card{
    border:1px solid #e2e8f0;
    border-radius:10px;
    padding:15px;
    background:#f8fafc;
}

/* =========================
   BADGES
========================= */

.badge{
    padding:4px 10px;
    border-radius:999px;
    font-size:12px;
    font-weight:500;
    display:inline-block;
}

.badge-success{
    background:#ecfdf5;
    color:#065f46;
    border:1px solid #10b981;
}

.badge-pending{
    background:#fffbeb;
    color:#92400e;
    border:1px solid #f59e0b;
}

.badge-error{
    background:#fef2f2;
    color:#991b1b;
    border:1px solid #ef4444;
}

/* =========================
   FOOTER
========================= */

.footer{
    text-align:center;
    font-size:12px;
    margin-top:30px;
    color:#94a3b8;
}

</style>

</head>

<body>

<div class="header">
    <h2>Sistema Oficial de Verificación de Documentos</h2>
</div>

<div class="container">

    <div class="estado">
        ✔ Documento válido y verificado en el sistema
    </div>

    <div class="grid">

        <!-- =========================
             DATOS DEL PERMISO
        ========================== -->

        <div class="card">

            <h3>DATOS DEL COMPROBANTE DE RECAUDACIÓN DE CATASTROS</h3>

            <div class="datos">

                <p><strong>Número:</strong> {{ $recaudacionCatastro->numero_formateado }}</p>

                <p><strong>Clave catastral:</strong> {{ $recaudacionCatastro->catastro->clave_catastral }}</p>

                <p><strong>Número de predio:</strong> {{ $recaudacionCatastro->catastro->numero_predio }}</p>

                <p><strong>Propietario:</strong> {{ $recaudacionCatastro->catastro->cliente->nombre }}</p>

                <p><strong>Parroquia:</strong> {{ $recaudacionCatastro->catastro->parroquia->nombre }}</p>

                <p><strong>Dirección:</strong> {{ $recaudacionCatastro->catastro->direccion }}</p>

                <p><strong>Fecha de emisión:</strong> {{ \Carbon\Carbon::parse($recaudacionCatastro->fecha)->format('Y-m-d') }}</p>

            </div>
        </div>

        <!-- =========================
             FIRMAS
        ========================== -->
        @if ($recaudacionCatastro->firmantes->isNotEmpty())
            <div class="card">

                <h3>DATOS DE LA FIRMA ELECTRÓNICA</h3>

                <div style="display:flex; flex-direction:column; gap:12px;">

                    @foreach($permiso->firmantes as $firmante)

                        <div class="firma-card">

                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">

                                <div>
                                    <div style="font-size:14px; font-weight:600;">
                                        {{ strtoupper($firmante->personal->nombre ?? 'SIN NOMBRE') }}
                                    </div>

                                    <div style="font-size:13px; color:#64748b;">
                                        {{ $firmante->personalPlantilla->puesto ?? 'SIN CARGO' }}
                                    </div>
                                </div>

                                @if($firmante->estado_firma === 'FIRMADO')
                                    <span class="badge badge-success">✔ FIRMADO</span>
                                @elseif($firmante->estado_firma === 'PENDIENTE')
                                    <span class="badge badge-pending">⏳ PENDIENTE</span>
                                @else
                                    <span class="badge badge-error">{{ $firmante->estado_firma }}</span>
                                @endif

                            </div>

                            <div style="font-size:13px; color:#475569;">
                                <strong>Fecha:</strong>
                                {{ $firmante->fecha_firma
                                    ? \Carbon\Carbon::parse($firmante->fecha_firma)->format('Y-m-d H:i:s')
                                    : 'PENDIENTE' }}
                            </div>

                        </div>

                    @endforeach

                </div>

            </div>
        @endif
    </div>

</div>

</body>
</html>