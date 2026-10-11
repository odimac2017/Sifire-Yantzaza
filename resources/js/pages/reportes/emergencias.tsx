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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartNoAxesCombined, LifeBuoy, TriangleAlertIcon, UserPlus, UserPlus2 } from 'lucide-react';
import UserAvatar from '@/components/user-avatar';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes de emergencias',
        href: '/reportesemergencias',
    },
];

interface Emergencia {
    personal_id: number;
    personal: string;
    total_atenciones: number;
    total_qap: number;
    total: number;
    user: {
        full_name_simplex: string;
        avatar?: string;
        is_online: boolean;
    };
}

interface FilterProps {
    rango_fecha?: DateRange;
}

interface IndexProps {    
    emergencias: Emergencia[];
    filters: FilterProps;
}

export default function Index({ emergencias, filters: initialFilters }: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(parsedFilters, 'reportesemergencias');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "dateRange",
            key: "rango_fecha",
            presets: true,
        }
    ];

    const data: Emergencia[] = emergencias ?? [];

    const total = data.reduce(
        (acc, item) => acc + item.total_atenciones,
        0
    );

    const totalQap = data.reduce(
        (acc, item) => acc + item.total_qap,
        0
    );

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div></div>
                        <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 shadow-sm border border-green-200">
                            <div>
                                <p className="text-xs text-green-600">Atenciones</p>
                                <p className="text-xl font-bold text-green-700">
                                    {total}
                                </p>
                            </div>
                            <span className="text-sm text-green-600 font-medium">
                                <LifeBuoy className="w-5 h-5 text-green-600" />
                            </span>
                        </div> 
                        <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 shadow-sm border border-orange-200">
                            <div>
                                <p className="text-xs text-orange-600">Apoyos QAP</p>
                                <p className="text-xl font-bold text-orange-700">
                                    {totalQap ?? 0}
                                </p>
                            </div>
                            <span className="text-sm text-orange-600 font-medium">
                                <UserPlus2 className="w-5 h-5 text-orange-600" />
                            </span>
                        </div>                        
                    </div>
                    {data.length > 0 ? (
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">     
                                            <th className="py-2 px-4 text-left border-b">#</th>                           
                                            <th className="py-2 px-4 text-left border-b">Personal</th>
                                            <th className="py-2 px-4 text-left border-b">Atenciones</th>
                                            <th className="py-2 px-4 text-left border-b">Apoyo QAP</th>
                                            <th className="py-2 px-4 text-left border-b">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>                                        
                                        {data.map((item, index) => (
                                            <tr className="odd:bg-muted/50 hover:bg-gray-50" key={item.personal_id}>
                                                <td className="py-2 px-4 border-b">{index + 1}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <div className="flex items-center gap-3">        
                                                        <UserAvatar
                                                            name={item.user.full_name_simplex}
                                                            avatar={item.user.avatar}
                                                            isOnline={item.user.is_online}
                                                            size="md"
                                                        />
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.personal}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 border-b font-medium">{item.total_atenciones}</td>
                                                <td className="py-2 px-4 border-b font-medium">{item.total_qap}</td>
                                                <td className="py-2 px-4 border-b font-medium">{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center my-6">
                            <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                <TriangleAlertIcon className="h-4 w-4" />
                                <AlertTitle>No existen atenciones de emergencias</AlertTitle>
                                <AlertDescription className="text-destructive/80">
                                    Por favor intente de nuevo con otro período de búsqueda.
                                </AlertDescription>
                            </Alert>
                        </div>                   
                    )} 
                </div>
            </div>
        </AppLayout>
    );
}