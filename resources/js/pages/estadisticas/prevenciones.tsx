import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateRange } from "react-day-picker";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";
import { Button } from '@/components/ui/button';
import { ChartNoAxesCombined, Download } from 'lucide-react';
import { useRef } from 'react';
import { toPng } from "html-to-image";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estadísticas de prevención',
        href: '/estadisticasprevenciones',
    },
];

interface Solicitud {
    mes: string;
    inspecciones: number;
    reinspecciones: number;
}

interface Inspeccion {
    mes: string;
    aprobadas: number;
    reinspeccion: number;
}

interface EstadisticaParroquia {
    parroquia: string;
    total: number;
}

interface EstadisticaMes {
    mes: string;
    total: number;
}

interface EstadisticaTipo {
    tipo: string;
    total: number;
}

interface FilterProps {
    rango_fecha?: DateRange;
    grupo?: string;
}

interface IndexProps {
    solicitudes: Solicitud[];
    inspecciones: Inspeccion[];
    inspeccionesParroquia: EstadisticaParroquia[];
    permisos: EstadisticaMes[];
    permisosTipo: EstadisticaTipo[];
    permisosParroquia: EstadisticaParroquia[];
    permisosRecaudacion: EstadisticaMes[];
    permisosTipoRecaudacion: EstadisticaTipo[];
    permisosParroquiaRecaudacion: EstadisticaParroquia[];
    catastros: EstadisticaMes[];
    catastrosParroquia: EstadisticaParroquia[];
    catastrosRecaudacion: EstadisticaMes[];
    catastrosParroquiaRecaudacion: EstadisticaParroquia[];
    notificaciones: EstadisticaMes[];
    notificacionesParroquia: EstadisticaParroquia[];
    filters: FilterProps;
}

export default function Index({ solicitudes, inspecciones, inspeccionesParroquia, permisos, permisosTipo, permisosParroquia, permisosRecaudacion, permisosTipoRecaudacion, permisosParroquiaRecaudacion, catastros, catastrosParroquia, catastrosRecaudacion, catastrosParroquiaRecaudacion, notificaciones, notificacionesParroquia, filters: initialFilters }: IndexProps) {    

    const parsedFilters: FilterProps = {
        ...initialFilters,
        rango_fecha: initialFilters.rango_fecha
            ? {
                from: initialFilters.rango_fecha.from
                    ? dayjs(initialFilters.rango_fecha.from).toDate()
                    : undefined,
                to: initialFilters.rango_fecha.to
                    ? dayjs(initialFilters.rango_fecha.to).toDate()
                    : undefined,
            }
            : undefined,
    };

    const { filters, updateFilter } = useFilters<FilterProps>(parsedFilters, 'estadisticasprevenciones');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "dateRange",
            key: "rango_fecha",
            presets: true,
        },
        {
            type: "select",
            key: "grupo",
            placeholder: "Seleccione un grupo",
            options: [
                { label: "SOLICITUDES DE INSPECCIÓN", value: "solicitudes" },
                { label: "INSPECCIONES", value: "inspecciones" },
                { label: "PERMISOS DE FUNCIONAMIENTO", value: "permisos" },
                { label: "RECAUDACION DE CATASTROS", value: "catastros" },
                { label: "NOTIFICACIONES", value: "notificaciones" },
            ],
        }
    ];

    const grupo = filters.grupo;

    const CustomTooltip = ({ active, payload, label }: any) => {

        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-lg shadow-md p-3 text-sm">

                    <p className="font-semibold mb-1">
                        {label}
                    </p>

                    {payload.map((entry: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-4"
                        >
                            <span className="text-muted-foreground">
                                {entry.name}:
                            </span>

                            <span className="font-medium">
                                {entry.value}
                            </span>
                        </div>
                    ))}

                </div>
            );
        }

        return null;
    };

    const dataSolicitud = solicitudes.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        inspecciones: item.inspecciones,
        reinspecciones: item.reinspecciones
    }));

    const dataInspeccion = inspecciones.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        aprobadas: item.aprobadas,
        reinspeccion: item.reinspeccion
    }));

    const dataInspeccionParroquia = inspeccionesParroquia.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const dataPermiso = permisos.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataPermisoTipo = permisosTipo.map((item:any) => ({
        tipo: item.tipo,
        total: Number(item.total)
    }));

    const dataPermisoParroquia = permisosParroquia.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const dataPermisoRecaudacion = permisosRecaudacion.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataPermisoTipoRecaudacion = permisosTipoRecaudacion.map((item:any) => ({
        tipo: item.tipo,
        total: Number(item.total)
    }));

    const dataPermisoParroquiaRecaudacion = permisosParroquiaRecaudacion.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const dataCatastro = catastros.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataCatastroParroquia = catastrosParroquia.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const dataCatastroRecaudacion = catastrosRecaudacion.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataCatastroParroquiaRecaudacion = catastrosParroquiaRecaudacion.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const dataNotificacion = notificaciones.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataNotificacionParroquia = notificacionesParroquia.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));
   
    const chartRefSolicitud = useRef<HTMLDivElement>(null);

    const descargarChartSolicitud = async () => {

        if (!chartRefSolicitud.current) return;

        const dataUrl = await toPng(chartRefSolicitud.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_solicitudes.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefInspeccion = useRef<HTMLDivElement>(null);

    const descargarChartInspeccion = async () => {

        if (!chartRefInspeccion.current) return;

        const dataUrl = await toPng(chartRefInspeccion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_inspecciones.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefInspeccionParroquia = useRef<HTMLDivElement>(null);

    const descargarChartInspeccionParroquia = async () => {

        if(!chartRefInspeccionParroquia.current) return;

        const dataUrl = await toPng(chartRefInspeccionParroquia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_inspecciones_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermiso = useRef<HTMLDivElement>(null);

    const descargarChartPermiso = async () => {

        if (!chartRefPermiso.current) return;

        const dataUrl = await toPng(chartRefPermiso.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_permisos.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermisoTipo = useRef<HTMLDivElement>(null);

    const descargarChartPermisoTipo = async () => {

        if(!chartRefPermisoTipo.current) return;

        const dataUrl = await toPng(chartRefPermisoTipo.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_tipos_permisos.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermisoParroquia = useRef<HTMLDivElement>(null);

    const descargarChartPermisoParroquia = async () => {

        if(!chartRefPermisoParroquia.current) return;

        const dataUrl = await toPng(chartRefPermisoParroquia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_permisos_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermisoRecaudacion = useRef<HTMLDivElement>(null);

    const descargarChartPermisoRecaudacion = async () => {

        if (!chartRefPermisoRecaudacion.current) return;

        const dataUrl = await toPng(chartRefPermisoRecaudacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_recaudacion_permisos.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermisoParroquiaRecaudacion = useRef<HTMLDivElement>(null);

    const descargarChartPermisoParroquiaRecaudacion = async () => {

        if(!chartRefPermisoParroquiaRecaudacion.current) return;

        const dataUrl = await toPng(chartRefPermisoParroquiaRecaudacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_recaudacion_permisos_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefPermisoTipoRecaudacion = useRef<HTMLDivElement>(null);

    const descargarChartPermisoTipoRecaudacion = async () => {

        if(!chartRefPermisoTipoRecaudacion.current) return;

        const dataUrl = await toPng(chartRefPermisoTipoRecaudacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_recaudacion_tipo_permisos.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefCatastro = useRef<HTMLDivElement>(null);

    const descargarChartCatastro = async () => {

        if (!chartRefCatastro.current) return;

        const dataUrl = await toPng(chartRefCatastro.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_catastros.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefCatastroParroquia = useRef<HTMLDivElement>(null);

    const descargarChartCatastroParroquia = async () => {

        if(!chartRefCatastroParroquia.current) return;

        const dataUrl = await toPng(chartRefCatastroParroquia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_catastros_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefCatastroRecaudacion = useRef<HTMLDivElement>(null);

    const descargarChartCatastroRecaudacion = async () => {

        if (!chartRefCatastroRecaudacion.current) return;

        const dataUrl = await toPng(chartRefCatastroRecaudacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_recaudacion_catastros.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefCatastroParroquiaRecaudacion = useRef<HTMLDivElement>(null);

    const descargarChartCatastroParroquiaRecaudacion = async () => {

        if(!chartRefCatastroParroquiaRecaudacion.current) return;

        const dataUrl = await toPng(chartRefCatastroParroquiaRecaudacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_recaudacion_catastros_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefNotificacion = useRef<HTMLDivElement>(null);

    const descargarChartNotificacion = async () => {

        if (!chartRefNotificacion.current) return;

        const dataUrl = await toPng(chartRefNotificacion.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_notificaciones.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefNotificacionParroquia = useRef<HTMLDivElement>(null);

    const descargarChartNotificacionParroquia = async () => {

        if(!chartRefNotificacionParroquia.current) return;

        const dataUrl = await toPng(chartRefNotificacionParroquia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_notificaciones_parroquia.png";
        link.href = dataUrl;
        link.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estadísticas de prevención" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>
                {!grupo && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center max-w-md space-y-4">                            
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <ChartNoAxesCombined className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-lg font-semibold">
                                Seleccione un grupo
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Eliga una categoría para visualizar las estadísticas correspondientes en gráficos interactivos.
                            </p>
                        </div>
                    </div>
                )}
                {(grupo === "solicitudes") && (
                    <div ref={chartRefSolicitud} className="bg-white border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Solicitudes de inspección vs reinspección por mes
                                </h2>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={descargarChartSolicitud}
                                className='cursor-pointer'
                            >
                                <Download className="w-4 h-4"/>
                            </Button>
                        </div>
                        <div className="h-[380px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dataSolicitud}
                                    barSize={32}
                                    barGap={6}
                                >
                                    <defs>

                                        <linearGradient id="inspeccionesColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6"/>
                                            <stop offset="100%" stopColor="#2563eb"/>
                                        </linearGradient>

                                        <linearGradient id="reinspeccionesColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b"/>
                                            <stop offset="100%" stopColor="#d97706"/>
                                        </linearGradient>

                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        vertical={false}
                                        stroke="#e5e7eb"
                                    />

                                    <XAxis
                                        dataKey="mes"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />
    
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                    />

                                    <Tooltip content={<CustomTooltip />} />

                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{
                                            fontSize: "13px",
                                            paddingTop: "10px"
                                        }}
                                    />

                                    <Bar
                                        dataKey="inspecciones"
                                        name="Solicitudes de inspección"
                                        fill="url(#inspeccionesColor)"
                                        radius={[8,8,0,0]}
                                        animationDuration={900}
                                    >
                                        <LabelList
                                            dataKey="inspecciones"
                                            position="top"
                                            className="fill-foreground text-xs font-semibold"
                                        />
                                    </Bar>

                                    <Bar
                                        dataKey="reinspecciones"
                                        name="Solicitudes de reinspección"
                                        fill="url(#reinspeccionesColor)"
                                        radius={[8,8,0,0]}
                                        animationDuration={900}
                                    >
                                        <LabelList
                                            dataKey="reinspecciones"
                                            position="top"
                                            className="fill-foreground text-xs font-semibold"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {(grupo === "inspecciones") && (
                    <>
                        <div ref={chartRefInspeccion} className="bg-white border rounded-2xl p-6 shadow-sm">  
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Inspecciones aprobadas vs para reinspección por mes
                                    </h2>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartInspeccion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[380px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataInspeccion}
                                        barSize={32}
                                        barGap={6}
                                    >
                                        <defs>

                                            <linearGradient id="aprobadasColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>

                                            <linearGradient id="reinspeccionColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b"/>
                                                <stop offset="100%" stopColor="#d97706"/>
                                            </linearGradient>

                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="aprobadas"
                                            name="Inspecciones aprobadas"
                                            fill="url(#aprobadasColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="aprobadas"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>

                                        <Bar
                                            dataKey="reinspeccion"
                                            name="Inspecciones para reinspección"
                                            fill="url(#reinspeccionColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="reinspeccion"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefInspeccionParroquia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Inspecciones por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartInspeccionParroquia}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataInspeccionParroquia}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {(grupo === "permisos") && (
                    <>
                        <div ref={chartRefPermiso} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Permisos de funcionamiento por mes
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermiso}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermiso}
                                        barSize={40}
                                        barGap={6}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="permisoColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#permisoColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefPermisoTipo} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Permisos de funcionamiento por tipo
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermisoTipo}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermisoTipo}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="tipoColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="tipo"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#tipoColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefPermisoParroquia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Permisos de funcionamiento por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermisoParroquia}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermisoParroquia}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefPermisoRecaudacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de permisos de funcionamiento por mes
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermisoRecaudacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermisoRecaudacion}
                                        barSize={40}
                                        barGap={6}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="permisoColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={true}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#permisoColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefPermisoTipoRecaudacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de permisos de funcionamiento por tipo
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermisoTipoRecaudacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermisoTipoRecaudacion}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="tipoColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={true}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="tipo"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#tipoColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefPermisoParroquiaRecaudacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de permisos de funcionamiento por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartPermisoParroquiaRecaudacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataPermisoParroquiaRecaudacion}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={true}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {(grupo === "catastros") && (
                    <>
                        <div ref={chartRefCatastro} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de catastros por mes
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartCatastro}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataCatastro}
                                        barSize={40}
                                        barGap={6}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="catastroColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#catastroColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefCatastroParroquia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de catastros por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartCatastroParroquia}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataCatastroParroquia}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefCatastroRecaudacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de catastros por mes
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartCatastroRecaudacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataCatastroRecaudacion}
                                        barSize={40}
                                        barGap={6}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="catastroColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={true}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#catastroColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefCatastroParroquiaRecaudacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Recaudación de catastros por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartCatastroParroquiaRecaudacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataCatastroParroquiaRecaudacion}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={true}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {(grupo === "notificaciones") && (
                    <>
                        <div ref={chartRefNotificacion} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Notificaciones entregadas por mes
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartNotificacion}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataNotificacion}
                                        barSize={40}
                                        barGap={6}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="notificacionColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: "13px",
                                                paddingTop: "10px"
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#notificacionColor)"
                                            radius={[8,8,0,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div ref={chartRefNotificacionParroquia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Notificaciones entregadas por parroquia
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={descargarChartNotificacionParroquia}
                                    className='cursor-pointer'
                                >
                                    <Download className="w-4 h-4"/>
                                </Button>
                            </div>
                            <div className="h-[420px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataNotificacionParroquia}
                                        layout="vertical"
                                        margin={{ left: 40 }}
                                        barSize={28}
                                    > 
                                        <defs>
                                            <linearGradient id="parroquiaColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#2563eb"/>
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="parroquia"
                                            tickLine={false}
                                            axisLine={false}
                                            width={120}
                                            tick={{ fontSize: 12, fill: "#64748b" }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="total"
                                            fill="url(#parroquiaColor)"
                                            radius={[0,8,8,0]}
                                            animationDuration={900}
                                        >
                                            <LabelList
                                                dataKey="total"
                                                position="right"
                                                className="fill-foreground text-xs font-semibold"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}