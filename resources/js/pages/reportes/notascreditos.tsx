import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DollarSign, FileSpreadsheet, FileText, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { money } from "@/utils/format";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import ModalEditReporteCatastro from '@/pages/reportes/ModalEditReporteCatastro';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import Pagination from '@/components/pagination';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reporte de notas de crédito',
        href: '/reportesnotascreditos',
    },
];

interface NotaCredito {
    id: number;
    valor_total: number;
    saldo: number;
    observaciones: string;
    cliente: {
        documento: string;
        nombre: string;
    };
    actividad_economica: {
        e_nombre_comercial: string;
    };
}

interface NotaCreditoPagination {
    data: NotaCredito[];
    links: LinkProps[];
}

interface FilterProps {
    search: string; 
}

interface IndexProps {
    notasCreditos: NotaCreditoPagination;
    filters: FilterProps;    
}

export default function Index({notasCreditos, filters: initialFilters}: IndexProps) {

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on("start", () => {
            setLoading(true);
        });

        const removeFinish = router.on("finish", () => {
            setLoading(false);
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'reportesnotascreditos');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar",
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de notas de crédito" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FiltersBar
                    actions={
                        <div className="flex items-center gap-2">
                            {notasCreditos.data.length > 0 && ( 
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                    variant="outline"
                                    onClick={() => {                                            
                                        window.open(`/reportesnotascreditos/exportExcel?search=${filters.search}`, '_blank');
                                    }}
                                >
                                    <FileSpreadsheet className="mr-1 h-4 w-4" />
                                    Excel
                                </Button>
                            )}                            
                        </div>
                    }
                >
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>
                {notasCreditos.data.length ? (
                    <>                          
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">#</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>
                                            <th className="py-2 px-4 text-left border-b">Valor</th> 
                                            <th className="py-2 px-4 text-left border-b">Saldo</th>
                                            <th className="py-2 px-4 text-left border-b">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={6}
                                            />
                                        ) : (
                                            notasCreditos.data.map((notaCredito, index) => (
                                                <tr
                                                    key={notaCredito.id}
                                                    className="odd:bg-muted/50 hover:bg-gray-50"
                                                >
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{index + 1}</span></td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{notaCredito.cliente?.documento}</div>
                                                            <div className='font-medium'>{notaCredito.cliente?.nombre}</div>                                        
                                                        </div>
                                                    </td>                                                    
                                                    <td className="py-2 px-4 border-b">{notaCredito.actividad_economica?.e_nombre_comercial}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(notaCredito.valor_total)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(notaCredito.saldo)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{notaCredito.observaciones}</td>                          
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={notasCreditos.links} />
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center my-4">
                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>No existen resultados</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Por favor intente de nuevo con otra fecha.
                            </AlertDescription>
                        </Alert>
                    </div>                 
                )}            
            </div>
        </AppLayout>
    );
}
