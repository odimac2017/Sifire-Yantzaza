<?php

namespace App\Http\Controllers;

use App\Models\Inspeccion;
use App\Models\Notificacion;
use App\Models\PermisoFuncionamiento;
use App\Models\RecaudacionCatastro;
use App\Models\SolicitudInspeccion;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EstadisticaPrevencionController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('rango_fecha.from')
            ? Carbon::parse($request->input('rango_fecha.from'))->startOfDay()
            : now()->startOfMonth();

        $to = $request->input('rango_fecha.to')
            ? Carbon::parse($request->input('rango_fecha.to'))->endOfDay()
            : now()->endOfDay();

        $solicitudes = SolicitudInspeccion::whereBetween('fecha_solicitud', [$from, $to])
        ->selectRaw("
            DATE_FORMAT(fecha_solicitud, '%Y-%m') as mes,
            SUM(CASE WHEN tipo_solicitud = 'IN' THEN 1 ELSE 0 END) as inspecciones,
            SUM(CASE WHEN tipo_solicitud = 'RE' THEN 1 ELSE 0 END) as reinspecciones
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get();

        $inspecciones = Inspeccion::whereBetween('fecha_inspeccion', [$from, $to])
        ->selectRaw("
            DATE_FORMAT(fecha_inspeccion, '%Y-%m') as mes,
            SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobadas,
            SUM(CASE WHEN estado = 'REINSPECCION' THEN 1 ELSE 0 END) as reinspeccion
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $inspeccionesParroquia = Inspeccion::query()
        ->join('procesos_permisos', 'inspecciones.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('actividades_economicas', 'procesos_permisos.actividad_economica_id', '=', 'actividades_economicas.id')
        ->join('parroquias', 'actividades_economicas.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('inspecciones.fecha_inspeccion', [$from, $to])
        ->selectRaw("
            parroquias.nombre as parroquia,
            COUNT(inspecciones.id) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        $permisos = PermisoFuncionamiento::whereBetween('created_at', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->selectRaw("
            DATE_FORMAT(created_at, '%Y-%m') as mes,
            COUNT(id) as total
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $permisosTipo = PermisoFuncionamiento::query()
        ->join('procesos_permisos', 'permisos_funcionamientos.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('tipos_permisos', 'procesos_permisos.tipo_permiso_id', '=', 'tipos_permisos.id')
        ->whereBetween('permisos_funcionamientos.created_at', [$from, $to])
        ->where('permisos_funcionamientos.estado', 'EXPEDIDO')
        ->selectRaw("
            tipos_permisos.nombre as tipo,
            COUNT(permisos_funcionamientos.id) as total
        ")
        ->groupBy('tipos_permisos.nombre')
        ->orderByDesc('total')
        ->get();

        $permisosParroquia = PermisoFuncionamiento::query()
        ->join('procesos_permisos', 'permisos_funcionamientos.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('actividades_economicas', 'procesos_permisos.actividad_economica_id', '=', 'actividades_economicas.id')
        ->join('parroquias', 'actividades_economicas.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('permisos_funcionamientos.created_at', [$from, $to])
        ->where('permisos_funcionamientos.estado', 'EXPEDIDO')
        ->selectRaw("
            parroquias.nombre as parroquia,
            COUNT(permisos_funcionamientos.id) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        $permisosRecaudacion = PermisoFuncionamiento::whereBetween('created_at', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->selectRaw("
            DATE_FORMAT(created_at, '%Y-%m') as mes,
            SUM(valor_total) as total
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $permisosTipoRecaudacion = PermisoFuncionamiento::query()
        ->join('procesos_permisos', 'permisos_funcionamientos.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('tipos_permisos', 'procesos_permisos.tipo_permiso_id', '=', 'tipos_permisos.id')
        ->whereBetween('permisos_funcionamientos.created_at', [$from, $to])
        ->where('permisos_funcionamientos.estado', 'EXPEDIDO')
        ->selectRaw("
            tipos_permisos.nombre as tipo,
            SUM(permisos_funcionamientos.valor_total) as total
        ")
        ->groupBy('tipos_permisos.nombre')
        ->orderByDesc('total')
        ->get();

        $permisosParroquiaRecaudacion = PermisoFuncionamiento::query()
        ->join('procesos_permisos', 'permisos_funcionamientos.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('actividades_economicas', 'procesos_permisos.actividad_economica_id', '=', 'actividades_economicas.id')
        ->join('parroquias', 'actividades_economicas.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('permisos_funcionamientos.created_at', [$from, $to])
        ->where('permisos_funcionamientos.estado', 'EXPEDIDO')
        ->selectRaw("
            parroquias.nombre as parroquia,
            SUM(permisos_funcionamientos.valor_total) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        $catastros = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->selectRaw("
            DATE_FORMAT(fecha, '%Y-%m') as mes,
            COUNT(id) as total
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $catastrosParroquia = RecaudacionCatastro::query()
        ->join('catastros', 'recaudaciones_catastros.catastro_id', '=', 'catastros.id')
        ->join('parroquias', 'catastros.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('recaudaciones_catastros.fecha', [$from, $to])
        ->where('recaudaciones_catastros.estado', 'EXPEDIDO')
        ->selectRaw("
            parroquias.nombre as parroquia,
            COUNT(recaudaciones_catastros.id) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        $catastrosRecaudacion = RecaudacionCatastro::whereBetween('fecha', [$from, $to])
        ->where('estado', 'EXPEDIDO')
        ->selectRaw("
            DATE_FORMAT(fecha, '%Y-%m') as mes,
            SUM(valor_total) as total
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $catastrosParroquiaRecaudacion = RecaudacionCatastro::query()
        ->join('catastros', 'recaudaciones_catastros.catastro_id', '=', 'catastros.id')
        ->join('parroquias', 'catastros.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('recaudaciones_catastros.fecha', [$from, $to])
        ->where('recaudaciones_catastros.estado', 'EXPEDIDO')
        ->selectRaw("
            parroquias.nombre as parroquia,
            SUM(recaudaciones_catastros.valor_total) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        $notificaciones = Notificacion::whereBetween('fecha_entrega', [$from, $to])
        ->where('estado', 'ENTREGADO')
        ->selectRaw("
            DATE_FORMAT(fecha_entrega, '%Y-%m') as mes,
            COUNT(id) as total
        ")
        ->groupBy('mes')
        ->orderBy('mes')
        ->get(); 

        $notificacionesParroquia = Notificacion::query()
        ->join('procesos_permisos', 'notificaciones.proceso_permiso_id', '=', 'procesos_permisos.id')
        ->join('actividades_economicas', 'procesos_permisos.actividad_economica_id', '=', 'actividades_economicas.id')
        ->join('parroquias', 'actividades_economicas.parroquia_id', '=', 'parroquias.id')
        ->whereBetween('notificaciones.created_at', [$from, $to])
        ->where('notificaciones.estado', 'ENTREGADO')
        ->selectRaw("
            parroquias.nombre as parroquia,
            COUNT(notificaciones.id) as total
        ")
        ->groupBy('parroquias.nombre')
        ->orderByDesc('total')
        ->get();

        return inertia('estadisticas/prevenciones', [
            'solicitudes' => $solicitudes,
            'inspecciones' => $inspecciones,
            'inspeccionesParroquia' => $inspeccionesParroquia,
            'permisos' => $permisos,
            'permisosTipo' => $permisosTipo,
            'permisosParroquia' => $permisosParroquia,            
            'permisosRecaudacion' => $permisosRecaudacion,
            'permisosParroquiaRecaudacion' => $permisosParroquiaRecaudacion,
            'permisosTipoRecaudacion' => $permisosTipoRecaudacion,
            'catastros' => $catastros,
            'catastrosParroquia' => $catastrosParroquia,            
            'catastrosRecaudacion' => $catastrosRecaudacion,
            'catastrosParroquiaRecaudacion' => $catastrosParroquiaRecaudacion,
            'notificaciones' => $notificaciones,
            'notificacionesParroquia' => $notificacionesParroquia,   
            'filters' => [
                'rango_fecha' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ]
            ]
        ]);
    }    
}
