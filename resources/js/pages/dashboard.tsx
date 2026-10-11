import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import CountUp from 'react-countup';
import InspectionsTable from '@/components/tables/InspectionsTable';
import InspectionsTableSkeleton from '@/components/skeletons/InspectionsTableSkeleton';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatData = (data: any) => {
    return meses.map((mes, index) => ({
        mes,
        total: data?.[index + 1] ?? 0,
    }));
};

const getTotal = (data: any) => {
    return Object.values(data || {}).reduce((acc: number, val: any) => acc + val, 0);
};

const getGrowth = (data: any) => {
    const values = Object.values(data || {});
    if (values.length < 2) return 0;

    const last = values[values.length - 1] as number;
    const prev = values[values.length - 2] as number;

    if (prev === 0) return 100;
    return ((last - prev) / prev) * 100;
};

const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
};

const CardChart = ({ title, dataRaw, color }: any) => {
    const data = formatData(dataRaw);
    const total = getTotal(dataRaw);
    const growth = getGrowth(dataRaw);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">
                    {title}
                </h2>
                <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        growth >= 0
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                    }`}
                >
                    {growth >= 0 ? '+' : ''}
                    {growth.toFixed(0)}%
                </span>
            </div>

            <div className="mt-2 text-3xl font-bold text-gray-900">
                <CountUp
                    end={total}
                    duration={1.5}
                />
            </div>

            <div className="h-20 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="mes" hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={color}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
                style={{ backgroundColor: color }}
            />
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

export default function Dashboard({ inspecciones, permisos, partes, solicitudesInspecciones, auth_personal_id }: any) {
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
        setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-6 md:grid-cols-3">
                    <CardChart
                        title="Inspecciones"
                        dataRaw={inspecciones}
                        color="#f59e0b"
                    />
                    <CardChart
                        title="Permisos de funcionamiento"
                        dataRaw={permisos}
                        color="#16a34a"
                    />
                    <CardChart
                        title="Emergencia atendidas"
                        dataRaw={partes}
                        color="#dc2626"
                    />
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Solicitudes de inspección
                        </h2>
                        <p className="text-sm text-gray-500">
                            Gestión de inspecciones del sistema
                        </p>
                    </div>
                    {loading ? (
                        <InspectionsTableSkeleton />
                    ) : (
                        <InspectionsTable
                            solicitudes={solicitudesInspecciones}
                            auth_personal_id={auth_personal_id}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}