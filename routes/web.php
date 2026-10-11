<?php

use App\Http\Controllers\ActividadEconomicaController;
use App\Http\Controllers\CantonController;
use App\Http\Controllers\CatastroController;
use App\Http\Controllers\CategoriaEmergenciaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\EstadisticaEmergenciaController;
use App\Http\Controllers\EstadisticaPrevencionController;
use App\Http\Controllers\ExtintorController;
use App\Http\Controllers\FirmaInspeccionController;
use App\Http\Controllers\FirmaPermisoFuncionamientoController;
use App\Http\Controllers\InspeccionArchivoController;
use App\Http\Controllers\InspeccionController;
use App\Http\Controllers\InstitucionController;
use App\Http\Controllers\NotificacionArchivoController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\ParroquiaController;
use App\Http\Controllers\ParteEmergenciaArchivoController;
use App\Http\Controllers\ParteEmergenciaController;
use App\Http\Controllers\PermisoFuncionamientoController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\PersonalFirmaController;
use App\Http\Controllers\PersonalPlantillaController;
use App\Http\Controllers\PlantillaController;
use App\Http\Controllers\ProcesoPermisoRequisitoController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\PuestoController;
use App\Http\Controllers\RecaudacionCatastroController;
use App\Http\Controllers\ReporteAvanzadoController;
use App\Http\Controllers\ReporteCatastroController;
use App\Http\Controllers\ReporteClienteSinPermisoController;
use App\Http\Controllers\ReporteEmergenciaController;
use App\Http\Controllers\ReporteNotaCreditoController;
use App\Http\Controllers\ReportePermisoFuncionamientoController;
use App\Http\Controllers\ReportePrevencionController;
use App\Http\Controllers\SolicitudInspeccionController;
use App\Http\Controllers\TarifarioController;
use App\Http\Controllers\TarifarioPeriodoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/inspecciones/{codigo}/verificar', [InspeccionController::class, 'verificar'])->name('inspecciones.verificar');
Route::get('/permisosfuncionamientos/{codigo}/verificar', [PermisoFuncionamientoController::class, 'verificar'])->name('permisosfuncionamientos.verificar');
Route::get('/recaudacionescatastros/{codigo}/verificar', [RecaudacionCatastroController::class, 'verificar'])->name('recaudacionescatastros.verificar');        

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('solicitudesinspecciones', [SolicitudInspeccionController::class, 'index'])->name('solicitudesinspecciones.index');
    Route::get('solicitudesinspecciones/create', [SolicitudInspeccionController::class, 'create'])->name('solicitudesinspecciones.create');
    Route::post('solicitudesinspecciones', [SolicitudInspeccionController::class, 'store'])->name('solicitudesinspecciones.store');
    Route::post('solicitudesinspecciones/{inspeccion}/generarreinspeccion', [SolicitudInspeccionController::class, 'generarreinspeccion'])->name('solicitudesinspecciones.generarreinspeccion');
    Route::get('solicitudesinspecciones/{solicitudInspeccion}/edit', [SolicitudInspeccionController::class, 'edit'])->name('solicitudesinspecciones.edit');
    Route::put('solicitudesinspecciones/{solicitudInspeccion}', [SolicitudInspeccionController::class, 'update'])->name('solicitudesinspecciones.update');
    Route::get('solicitudesinspecciones/sugerirInspector', [SolicitudInspeccionController::class, 'sugerirInspector'])->name('solicitudesinspecciones.sugerirInspector');
    Route::delete('solicitudesinspecciones/{solicitudInspeccion}', [SolicitudInspeccionController::class, 'destroy'])->name('solicitudesinspecciones.destroy');
    Route::get('solicitudesinspecciones/{solicitudInspeccion}', [SolicitudInspeccionController::class, 'show'])->name('solicitudesinspecciones.show');
    Route::get('solicitudesinspecciones/{id}/descargar', [SolicitudInspeccionController::class, 'descargar'])->name('solicitudesinspecciones.descargar');
    
    Route::get('/preview-solicitud/{id}', [SolicitudInspeccionController::class, 'preview']);

    Route::post('/procesospermisosrequisitos/{procesoPermiso}/requisitos', [ProcesoPermisoRequisitoController::class, 'store'])->name('procesospermisosrequisitos.store');
    Route::delete('/procesospermisosrequisitos/{procesoPermisoRequisito}', [ProcesoPermisoRequisitoController::class, 'destroy'])->name('procesospermisosrequisitos.destroy');

    Route::get('inspecciones', [InspeccionController::class, 'index'])->name('inspecciones.index');
    Route::get('inspecciones/novedades', [InspeccionController::class, 'novedades'])->name('inspecciones.novedades');
    Route::get('inspecciones/{solicitudInspeccion}/create', [InspeccionController::class, 'create'])->name('inspecciones.create');
    Route::post('inspecciones', [InspeccionController::class, 'store'])->name('inspecciones.store');
    Route::get('inspecciones/{inspeccion}/edit', [InspeccionController::class, 'edit'])->name('inspecciones.edit');
    Route::put('inspecciones/{inspeccion}', [InspeccionController::class, 'update'])->name('inspecciones.update');
    Route::delete('inspecciones/{inspeccion}', [InspeccionController::class, 'destroy'])->name('inspecciones.destroy');
    Route::post('inspecciones/{id}/firmar', [InspeccionController::class, 'firmar'])->name('inspecciones.firmar');
    Route::post('inspecciones/{id}/firmarManual', [InspeccionController::class, 'firmarManual'])->name('inspecciones.firmarManual');
    Route::get('inspecciones/{inspeccion}', [InspeccionController::class, 'show'])->name('inspecciones.show');
    Route::get('inspecciones/{id}/descargar', [InspeccionController::class, 'descargar'])->name('inspecciones.descargar');
    Route::post('inspecciones/{inspeccion}/reenviarCorreo', [InspeccionController::class, 'reenviarCorreo'])->name('inspecciones.reenviarCorreo');

    Route::post('/inspeccionesarchivos/{inspeccion}/archivos', [InspeccionArchivoController::class, 'store'])->name('inspeccionesarchivos.store');
    Route::delete('/inspeccionesarchivos/{inspeccionArchivo}', [InspeccionArchivoController::class, 'destroy'])->name('inspeccionesarchivos.destroy');
    
    
    Route::get('/preview-inspeccion/{id}', [InspeccionController::class, 'preview']);

    Route::get('notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');
    Route::get('notificaciones/{procesoPermiso}/create', [NotificacionController::class, 'create'])->name('notificaciones.create');
    Route::post('notificaciones', [NotificacionController::class, 'store'])->name('notificaciones.store');
    Route::get('notificaciones/{notificacion}/edit', [NotificacionController::class, 'edit'])->name('notificaciones.edit');
    Route::put('notificaciones/{notificacion}', [NotificacionController::class, 'update'])->name('notificaciones.update');
    Route::get('notificaciones/{notificacion}/entregar', [NotificacionController::class, 'entregar'])->name('notificaciones.entregar');
    Route::put('notificaciones/{notificacion}/boleta', [NotificacionController::class, 'boleta'])->name('notificaciones.boleta');
    Route::get('notificaciones/{notificacion}', [NotificacionController::class, 'show'])->name('notificaciones.show');
    Route::get('notificaciones/{id}/descargar', [NotificacionController::class, 'descargar'])->name('notificaciones.descargar');
    
    Route::get('/preview-notificacion/{id}', [NotificacionController::class, 'preview']);

    Route::post('/notificacionesarchivos/{notificacion}/archivos', [NotificacionArchivoController::class, 'store'])->name('notificacionesarchivos.store');
    Route::delete('/notificacionesarchivos/{notificacionArchivo}', [NotificacionArchivoController::class, 'destroy'])->name('notificacionesarchivos.destroy');

    Route::get('permisosfuncionamientos', [PermisoFuncionamientoController::class, 'index'])->name('permisosfuncionamientos.index');
    Route::get('permisosfuncionamientos/{procesoPermiso}/create', [PermisoFuncionamientoController::class, 'create'])->name('permisosfuncionamientos.create');
    Route::post('permisosfuncionamientos', [PermisoFuncionamientoController::class, 'store'])->name('permisosfuncionamientos.store');
    Route::get('permisosfuncionamientos/{permisoFuncionamiento}/edit', [PermisoFuncionamientoController::class, 'edit'])->name('permisosfuncionamientos.edit');
    Route::put('permisosfuncionamientos/{permisoFuncionamiento}', [PermisoFuncionamientoController::class, 'update'])->name('permisosfuncionamientos.update');
    Route::patch('permisosfuncionamientos/{permisoFuncionamiento}/anular', [PermisoFuncionamientoController::class, 'anular'])->name('permisosfuncionamientos.anular');
    Route::post('/permisosfuncionamientos/{id}/firmar', [PermisoFuncionamientoController::class, 'firmar'])->name('permisosfuncionamientos.firmar');
    Route::post('/permisosfuncionamientos/{id}/firmar-manual', [PermisoFuncionamientoController::class, 'firmarManual'])->name('permisosfuncionamientos.firmarManual');
    Route::get('/permisosfuncionamientos/{id}/descargar', [PermisoFuncionamientoController::class, 'descargar'])->name('permisosfuncionamientos.descargar');
    Route::post('permisosfuncionamientos/{permisoFuncionamiento}/reenviarCorreo', [PermisoFuncionamientoController::class, 'reenviarCorreo'])->name('permisosfuncionamientos.reenviarCorreo');

    Route::get('/preview-permiso/{id}', [PermisoFuncionamientoController::class, 'preview']);

    Route::get('recaudacionescatastros', [RecaudacionCatastroController::class, 'index'])->name('recaudacionescatastros.index');
    Route::get('recaudacionescatastros/create', [RecaudacionCatastroController::class, 'create'])->name('recaudacionescatastros.create');
    Route::post('recaudacionescatastros', [RecaudacionCatastroController::class, 'store'])->name('recaudacionescatastros.store');
    Route::patch('recaudacionescatastros/{recaudacionCatastro}/anular', [RecaudacionCatastroController::class, 'anular'])->name('recaudacionescatastros.anular');
    Route::post('/recaudacionescatastros/{id}/firmar', [RecaudacionCatastroController::class, 'firmar'])->name('recaudacionescatastros.firmar');
    Route::get('/recaudacionescatastros/{id}/descargar', [RecaudacionCatastroController::class, 'descargar'])->name('recaudacionescatastros.descargar');
    Route::post('recaudacionescatastros/{permisoFuncionamiento}/reenviarCorreo', [RecaudacionCatastroController::class, 'reenviarCorreo'])->name('recaudacionescatastros.reenviarCorreo');

    Route::get('/preview-recaudacion/{id}', [RecaudacionCatastroController::class, 'preview']);
    
    Route::prefix('firmas')
        ->name('firmas.')
        ->group(function () {

            Route::get('/inspecciones', [FirmaInspeccionController::class, 'index'])
                ->name('inspecciones.index');

            Route::post('/inspecciones/{inspeccion}/firmar', [FirmaInspeccionController::class, 'firmar'])
                ->name('inspecciones.firmar');

            Route::get('/permisosfuncionamientos', [FirmaPermisoFuncionamientoController::class, 'index'])
                ->name('permisosfuncionamientos.index');

            Route::post('/permisosfuncionamientos/{permisoFuncionamiento}/firmar', [FirmaPermisoFuncionamientoController::class, 'firmar'])
                ->name('permisosfuncionamientos.firmar');
        });

    Route::prefix('reportespermisosfuncionamientos')->name('reportespermisosfuncionamientos.')->group(function () {
        Route::get('/', [ReportePermisoFuncionamientoController::class, 'index'])->name('index');
        Route::post('/generar', [ReportePermisoFuncionamientoController::class, 'generar'])->name('generar');
        Route::get('/excel', [ReportePermisoFuncionamientoController::class, 'exportExcel'])->name('excel');
        Route::get('/pdf', [ReportePermisoFuncionamientoController::class, 'exportPdf'])->name('pdf');
        Route::put('/{reportePermisoFuncionamiento}', [ReportePermisoFuncionamientoController::class, 'update'])->name('update');
        Route::get('/{reportePermisoFuncionamiento}', [ReportePermisoFuncionamientoController::class, 'show'])->name('show');        
    });

    Route::get('reportesclientessinpermisos', [ReporteClienteSinPermisoController::class, 'index'])->name('reportesclientessinpermisos.index');
    Route::get('reportesclientessinpermisos/exportExcel', [ReporteClienteSinPermisoController::class, 'exportExcel'])->name('reportesclientessinpermisos.exportExcel');

    Route::prefix('reportescatastros')->name('reportes.catastros.')->group(function () {
        Route::get('/', [ReporteCatastroController::class, 'index'])->name('index');
        Route::post('/generar', [ReporteCatastroController::class, 'generar'])->name('generar');        
        Route::get('/excel', [ReporteCatastroController::class, 'exportExcel'])->name('excel');
        Route::get('/pdf', [ReporteCatastroController::class, 'exportPdf'])->name('pdf');
         Route::put('/{reporteCatastro}', [ReporteCatastroController::class, 'update'])->name('update');
        Route::get('/{reporteCatastro}', [ReporteCatastroController::class, 'show'])->name('show');
    });

    Route::get('reportesnotascreditos', [ReporteNotaCreditoController::class, 'index'])->name('reportesnotascreditos.index');
    Route::get('reportesnotascreditos/exportExcel', [ReporteNotaCreditoController::class, 'exportExcel'])->name('reportesnotascreditos.exportExcel');

    Route::get('reportesprevenciones', [ReportePrevencionController::class, 'index'])->name('reportesprevenciones.index');

    Route::get('reportesemergencias', [ReporteEmergenciaController::class, 'index'])->name('reportesemergencias.index');

    Route::get('reportesavanzados', [ReporteAvanzadoController::class, 'index'])->name('reportesavanzados.index');
    Route::get('reportesavanzados/exportExcel', [ReporteAvanzadoController::class, 'exportExcel'])->name('reportesavanzados.exportExcel');

    Route::get('estadisticasprevenciones', [EstadisticaPrevencionController::class, 'index'])->name('estadisticasprevenciones.index');

    Route::get('estadisticasemergencias', [EstadisticaEmergenciaController::class, 'index'])->name('estadisticasemergencias.index');
    
    Route::get('categoriasemergencias', [CategoriaEmergenciaController::class, 'index'])->name('categoriasemergencias.index');
    Route::get('categoriasemergencias/create', [CategoriaEmergenciaController::class, 'create'])->name('categoriasemergencias.create');
    Route::post('categoriasemergencias', [CategoriaEmergenciaController::class, 'store'])->name('categoriasemergencias.store');
    Route::get('categoriasemergencias/{categoriaEmergencia}/edit', [CategoriaEmergenciaController::class, 'edit'])->name('categoriasemergencias.edit');
    Route::put('categoriasemergencias/{categoriaEmergencia}', [CategoriaEmergenciaController::class, 'update'])->name('categoriasemergencias.update');

    Route::get('puestos', [PuestoController::class, 'index'])->name('puestos.index');
    Route::get('puestos/create', [PuestoController::class, 'create'])->name('puestos.create');
    Route::post('puestos', [PuestoController::class, 'store'])->name('puestos.store');
    Route::get('puestos/{puesto}/edit', [PuestoController::class, 'edit'])->name('puestos.edit');
    Route::put('puestos/{puesto}', [PuestoController::class, 'update'])->name('puestos.update');
    Route::delete('puestos/{puesto}', [PuestoController::class, 'destroy'])->name('puestos.destroy');

    Route::get('personales', [PersonalController::class, 'index'])->name('personales.index');
    Route::get('personales/create', [PersonalController::class, 'create'])->name('personales.create');
    Route::post('personales', [PersonalController::class, 'store'])->name('personales.store');
    Route::get('personales/{personal}/edit', [PersonalController::class, 'edit'])->name('personales.edit');
    Route::put('personales/{personal}', [PersonalController::class, 'update'])->name('personales.update');
    
    Route::delete('personalesplantillas/{personalPlantilla}', [PersonalPlantillaController::class, 'destroy'])->name('personalesplantillas.destroy');

    Route::get('clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::get('clientes/create', [ClienteController::class, 'create'])->name('clientes.create');
    Route::post('clientes', [ClienteController::class, 'store'])->name('clientes.store');
    Route::get('clientes/{cliente}/edit', [ClienteController::class, 'edit'])->name('clientes.edit');
    Route::put('clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::patch('clientes/{cliente}/inactivar', [ClienteController::class, 'inactivar'])->name('clientes.inactivar');    
    Route::patch('clientes/{cliente}/reactivar', [ClienteController::class, 'reactivar'])->name('clientes.reactivar');     
    Route::delete('clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
    Route::get('clientes/{cliente}', [ClienteController::class, 'show'])->name('clientes.show');
    Route::get('clientes/catastros/{cliente}', [ClienteController::class, 'catastro'])->name('clientes.catastro');

    Route::get('actividadeseconomicas/create/{clienteId}', [ActividadEconomicaController::class, 'create'])->name('actividadeseconomicas.create');
    Route::post('actividadeseconomicas', [ActividadEconomicaController::class, 'store'])->name('actividadeseconomicas.store');
    Route::get('actividadeseconomicas/{actividadEconomica}/edit', [ActividadEconomicaController::class, 'edit'])->name('actividadeseconomicas.edit');
    Route::put('actividadeseconomicas/{actividadEconomica}', [ActividadEconomicaController::class, 'update'])->name('actividadeseconomicas.update');
    Route::patch('actividadeseconomicas/{actividadEconomica}/inactivar', [ActividadEconomicaController::class, 'inactivar'])->name('actividadeseconomicas.inactivar');    
    Route::patch('actividadeseconomicas/{actividadEconomica}/reactivar', [ActividadEconomicaController::class, 'reactivar'])->name('actividadeseconomicas.reactivar');     
    Route::delete('actividadeseconomicas/{actividadEconomica}', [ActividadEconomicaController::class, 'destroy'])->name('actividadeseconomicas.destroy');
    Route::get('actividadeseconomicas/{actividadEconomica}', [ActividadEconomicaController::class, 'show'])->name('actividadeseconomicas.show');

    Route::get('catastros/{catastro}', [CatastroController::class, 'show'])->name('catatros.show');

    Route::get('partesemergencias', [ParteEmergenciaController::class, 'index'])->name('partesemergencias.index');
    Route::get('partesemergencias/create', [ParteEmergenciaController::class, 'create'])->name('partesemergencias.create');
    Route::post('partesemergencias', [ParteEmergenciaController::class, 'store'])->name('partesemergencias.store');
    Route::get('partesemergencias/{parteEmergencia}/edit', [ParteEmergenciaController::class, 'edit'])->name('partesemergencias.edit');
    Route::put('partesemergencias/{parteEmergencia}', [ParteEmergenciaController::class, 'update'])->name('partesemergencias.update');
    Route::delete('partesemergencias/{parteEmergencia}', [ParteEmergenciaController::class, 'destroy'])->name('partesemergencias.destroy');
    Route::get('partesemergencias/{parteEmergencia}', [ParteEmergenciaController::class, 'show'])->name('partesemergencias.show');
    Route::get('/partesemergencias/{parte}/descargar', [ParteEmergenciaController::class, 'descargar'])->name('partesemergencias.descargar');

    Route::get('/preview-parte/{id}', [ParteEmergenciaController::class, 'preview']);

    Route::post('/partesemergenciasarchivos/{parteEmergencia}/archivos', [ParteEmergenciaArchivoController::class, 'store'])->name('partesemergenciasarchivos.store');
    Route::delete('/partesemergenciasarchivos/{parteEmergenciaArchivo}', [ParteEmergenciaArchivoController::class, 'destroy'])->name('partesemergenciasarchivos.destroy');

    Route::get('tarifarios', [TarifarioController::class, 'index'])->name('tarifarios.index');
    Route::get('tarifarios/create', [TarifarioController::class, 'create'])->name('tarifarios.create');
    Route::post('tarifarios', [TarifarioController::class, 'store'])->name('tarifarios.store');
    Route::get('tarifarios/{tarifario}/edit', [TarifarioController::class, 'edit'])->name('tarifarios.edit');
    Route::put('tarifarios/{tarifario}', [TarifarioController::class, 'update'])->name('tarifarios.update');

    Route::put('/tarifariosperiodos/{id}', [TarifarioPeriodoController::class, 'update'])->name('tarifariosperiodos.update');

    Route::get('extintores', [ExtintorController::class, 'index'])->name('extintores.index');
    Route::get('extintores/{extintor}/edit', [ExtintorController::class, 'edit'])->name('extintores.edit');
    Route::put('extintores/{extintor}', [ExtintorController::class, 'update'])->name('extintores.update');
    Route::get('/extintores/generar', [ExtintorController::class, 'generar'])->name('extintores.generar');

    Route::get('documentos/obtenerDocumento', [DocumentoController::class, 'obtenerDocumento'])->name('documentos.obtenerDocumento');
    
    Route::get('provincias/obtenerProvincia', [ProvinciaController::class, 'obtenerProvincia'])->name('parroquias.obtenerProvincia');
    Route::get('cantones/obtenerCanton/{provincia_id}', [CantonController::class, 'obtenerCanton'])->name('parroquias.obtenerCanton');
    Route::get('parroquias/obtenerParroquia/{canton_id}', [ParroquiaController::class, 'obtenerParroquia'])->name('parroquias.obtenerParroquia');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::match(['put', 'post'], 'users/{user}', [UserController::class, 'update'])->name('users.update');

    Route::get('plantillas', [PlantillaController::class, 'index'])->name('plantillas.index');
    Route::get('plantillas/{plantilla}/edit', [PlantillaController::class, 'edit'])->name('plantillas.edit');
    Route::put('plantillas/{plantilla}/firmantes', [PlantillaController::class, 'updateFirmantes'])->name('plantillas.updateFirmantes');

    Route::get('institucion/{institucion}/edit', [InstitucionController::class, 'edit'])->name('institucion.edit');
    Route::put('institucion/{institucion}', [InstitucionController::class, 'update'])->name('institucion.update');

    Route::get('configuracion/{configuracion}/edit', [ConfiguracionController::class, 'edit'])->name('configuracion.edit');
    Route::put('configuracion/{configuracion}', [ConfiguracionController::class, 'update'])->name('configuracion.update');

    Route::get('/settings/firma-electronica', [PersonalFirmaController::class, 'edit'])->name('firma.edit');
    Route::post('/settings/firma-electronica', [PersonalFirmaController::class, 'update'])->name('firma.update');
    Route::patch('/settings/firma-electronica', [PersonalFirmaController::class, 'togglePassword'])->name('firma.togglePassword');
    Route::delete('/settings/firma-electronica', [PersonalFirmaController::class, 'destroy'])->name('firma.destroy');
    Route::get('personales/{personal}/verificar-firma', [PersonalFirmaController::class, 'verificar'])->name('firma.verificar');
    
});

require __DIR__.'/settings.php';
