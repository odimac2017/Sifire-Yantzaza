import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateRange } from "react-day-picker";
import { ClipboardCheck, ClipboardList, DollarSign, FileText, RefreshCcw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import CountUp from 'react-countup';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes de prevención',
        href: '/reportesprevenciones',
    },
];

interface TrendItem {
    fecha: string;
    total: number;
}

interface Indicador {
    total: number;
    growth: number;
    trend: TrendItem[];
}

interface Total {
    solicitudesInspecciones: Indicador;
    solicitudesReinspecciones: Indicador;
    inspecciones: Indicador;
    permisosFuncionamientos: Indicador;
    permisosFuncionamientosAnteriores: Indicador;
    recaudacionesCatastros: Indicador;
    recaudacionPermisosFuncionamientos: Indicador;
    recaudacionPermisosFuncionamientosAnteriores: Indicador;
    recaudacionCatastros: Indicador;
    recaudacionTotal: Indicador;
}

interface FilterProps {
    rango_fecha?: DateRange;
}

interface IndexProps {
    totales: Total;
    filters: FilterProps;
}

const renderGrowth = (growth: number, total: number) => {
    // 🚫 Sin datos
    if (growth === 0) {
        return <span className="text-gray-400">Sin cambios</span>;
    }

    // 🆕 Caso especial (antes 0)
    if (growth === 100 && total > 0) {
        return <span className="text-emerald-600 font-medium">Nuevo</span>;
    }

    const isPositive = growth > 0;

    // 🎯 Clasificación
    let label = "";
    let color = "";

    if (isPositive) {
        if (growth < 20) {
            label = "Leve";
            color = "text-green-500";
        } else if (growth < 100) {
            label = "Moderado";
            color = "text-green-600";
        } else {
            label = "Alto";
            color = "text-emerald-700 font-semibold";
        }
    } else {
        if (growth > -20) {
            label = "Leve caída";
            color = "text-red-400";
        } else if (growth > -50) {
            label = "Caída";
            color = "text-red-500";
        } else {
            label = "Caída fuerte";
            color = "text-red-700 font-semibold";
        }
    }

    return (
        <span className={`flex items-center gap-1 ${color}`}>
            {isPositive ? "▲" : "▼"}
            {Math.abs(growth)}%
            <span className="text-xs ml-1 opacity-70">
                {label}
            </span>
        </span>
    );
};

const money = (value: number) =>
    new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

type KpiCardProps = {
    title: string;
    data: Indicador;
    icon: React.ElementType;
    color: string;
    isMoney?: boolean;
};

type SparklineProps = {
    data: TrendItem[];
};

const Sparkline = ({ data }: SparklineProps) => {
    return (
        <div className="w-full h-5 mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="total"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs">
                <p className="text-gray-500">{label}</p>
                <p className="font-semibold text-gray-900">
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const KpiCard = ({ title, data, icon: Icon, color, isMoney }: KpiCardProps) => (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-gray-800">
                        {isMoney ? (
                            money(data.total)
                        ) : (
                            <CountUp
                                end={data.total}
                                duration={1.2}
                                separator=","
                            />
                        )}
                    </p>
                    {isMoney && (
                        <span className="text-xs text-gray-400 mb-1">
                            USD
                        </span>
                    )}
                </div>
                <p className="text-xs mt-1 font-medium">
                    {renderGrowth(data.growth, data.total)}
                </p>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        {data.trend && data.trend.length > 0 && (
            <Sparkline data={data.trend} />
        )}
    </div>
);

export default function Index({ totales, filters: initialFilters }: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(parsedFilters, 'reportesprevenciones');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "dateRange",
            key: "rango_fecha",
            presets: true,
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes de prevención" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>
                <div className="bg-white border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <ClipboardList className="w-4 h-4" />
                            </div>

                            <h2 className="text-sm font-semibold text-gray-700">
                                Gestión operativa
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <KpiCard
                            title="Solicitudes de inspección"
                            data={totales.solicitudesInspecciones}
                            icon={ClipboardList}
                            color="bg-blue-100 text-blue-600"
                        />
                        <KpiCard
                            title="Solicitudes de reinspección"
                            data={totales.solicitudesReinspecciones}
                            icon={RefreshCcw}
                            color="bg-indigo-100 text-indigo-600"
                        />
                        <KpiCard
                            title="Inspecciones"
                            data={totales.inspecciones}
                            icon={ClipboardCheck}
                            color="bg-emerald-100 text-emerald-600"
                        />
                        <KpiCard
                            title="Permisos de funcionamiento"
                            data={totales.permisosFuncionamientos}
                            icon={FileText}
                            color="bg-orange-100 text-orange-600"
                        />
                        <KpiCard
                            title="Permisos año anterior"
                            data={totales.permisosFuncionamientosAnteriores}
                            icon={FileText}
                            color="bg-red-100 text-red-600"
                        />
                        <KpiCard
                            title="Catastros"
                            data={totales.recaudacionesCatastros}
                            icon={FileText}
                            color="bg-purple-100 text-purple-600"
                        />
                    </div>
                </div>
                <div className="bg-white border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-700">
                                Recaudación económica
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <KpiCard
                            title="Permisos de funcionamiento"
                            data={totales.recaudacionPermisosFuncionamientos}
                            icon={DollarSign}
                            color="bg-orange-100 text-orange-600"
                            isMoney
                        />
                        <KpiCard
                            title="Permisos año anterior"
                            data={totales.recaudacionPermisosFuncionamientosAnteriores}
                            icon={DollarSign}
                            color="bg-red-100 text-red-600"
                            isMoney
                        />
                        <KpiCard
                            title="Catastros"
                            data={totales.recaudacionCatastros}
                            icon={DollarSign}
                            color="bg-purple-100 text-purple-600"
                            isMoney
                        />
                        <KpiCard
                            title="Total recaudado"
                            data={totales.recaudacionTotal}
                            icon={DollarSign}
                            color="bg-blue-100 text-blue-600"
                            isMoney
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}