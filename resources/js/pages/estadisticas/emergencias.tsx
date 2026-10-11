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
import { Download } from 'lucide-react';
import { useRef } from 'react';
import { toPng } from "html-to-image";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estadísticas de emergencias',
        href: '/estadisticasemergencias',
    },
];

interface EstadisticaParroquia {
    parroquia: string;
    total: number;
}

interface EstadisticaMes {
    mes: string;
    total: number;
}

interface EstadisticaCategoria {
    categoria: string;
    total: number;
}

interface FilterProps {
    rango_fecha?: DateRange;
}

interface IndexProps {
    emergencias: EstadisticaMes[];
    emergenciasCategoria: EstadisticaCategoria[];
    emergenciasParroquia: EstadisticaParroquia[];
    filters: FilterProps;
}

export default function Index({ emergencias, emergenciasCategoria, emergenciasParroquia, filters: initialFilters }: IndexProps) {    

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

    const { filters, updateFilter } = useFilters<FilterProps>(parsedFilters, 'estadisticasemergencias');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "dateRange",
            key: "rango_fecha",
            presets: true,
        }
    ];

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

    const dataEmergencia = emergencias.map(item => ({
        mes: dayjs(item.mes).format('MMMM YYYY'),
        total: item.total
    }));

    const dataEmergenciaCategoria = emergenciasCategoria.map((item:any) => ({
        categoria: item.categoria,
        total: Number(item.total)
    }));

    const dataEmergenciaParroquia = emergenciasParroquia.map((item:any) => ({
        parroquia: item.parroquia,
        total: Number(item.total)
    }));

    const chartRefEmergencia = useRef<HTMLDivElement>(null);

    const descargarChartEmergencia = async () => {

        if (!chartRefEmergencia.current) return;

        const dataUrl = await toPng(chartRefEmergencia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_emergencias.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefEmergenciaCategoria = useRef<HTMLDivElement>(null);

    const descargarChartEmergenciaCategoria = async () => {

        if(!chartRefEmergenciaCategoria.current) return;

        const dataUrl = await toPng(chartRefEmergenciaCategoria.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_categorias_emergencias.png";
        link.href = dataUrl;
        link.click();
    };

    const chartRefEmergenciaParroquia = useRef<HTMLDivElement>(null);

    const descargarChartEmergenciaParroquia = async () => {

        if(!chartRefEmergenciaParroquia.current) return;

        const dataUrl = await toPng(chartRefEmergenciaParroquia.current, {
            cacheBust: true,
            backgroundColor: "#ffffff"
        });

        const link = document.createElement("a");
        link.download = "chart_emergencias_parroquia.png";
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

                <div ref={chartRefEmergencia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">
                            Atenciones de emergencias por mes
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={descargarChartEmergencia}
                            className='cursor-pointer'
                        >
                            <Download className="w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="h-[420px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataEmergencia}
                                barSize={40}
                                barGap={6}
                                barCategoryGap="30%"
                            >
                                <defs>
                                    <linearGradient id="emergenciaColor" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#emergenciaColor)"
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

                <div ref={chartRefEmergenciaCategoria} className="bg-white border rounded-2xl p-6 shadow-sm">    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">
                            Atenciones de emergencias por categoria principal
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={descargarChartEmergenciaCategoria}
                            className='cursor-pointer'
                        >
                            <Download className="w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="h-[420px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataEmergenciaCategoria}
                                layout="vertical"
                                margin={{ left: 40 }}
                                barSize={28}
                            > 
                                <defs>
                                    <linearGradient id="categoriaColor" x1="0" y1="0" x2="0" y2="1">
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
                                    dataKey="categoria"
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                />

                                <Tooltip content={<CustomTooltip />} />

                                <Bar
                                    dataKey="total"
                                    fill="url(#categoriaColor)"
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

                <div ref={chartRefEmergenciaParroquia} className="bg-white border rounded-2xl p-6 shadow-sm">    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">
                            Atenciones de emergencias por parroquia
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={descargarChartEmergenciaParroquia}
                            className='cursor-pointer'
                        >
                            <Download className="w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="h-[420px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataEmergenciaParroquia}
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
            </div>
        </AppLayout>
    );
}