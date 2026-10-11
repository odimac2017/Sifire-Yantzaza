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
        title: 'Reporte de recaudaciones de catastros',
        href: '/reportescatastros',
    },
];

interface Total {
    total: number;
    expedidos: number;
    anulados: number;
    monto_expedidos: number;
    monto_anulados: number;
    monto_total: number;
}

interface Catastro {
    id: number;
    numero_formateado: string;
    valor_total: string;
    estado: string;
    catastro: {
        clave_catastral: string;
        numero_predio: string;
        cliente: {
            documento: string;
            nombre: string;
            email: string;
        };
        parroquia: {
            nombre: string;
        };
    };
}

interface CatastroPagination {
    data: Catastro[];
    links: LinkProps[];
}

interface FilterProps {
    fecha?: string; 
    estado: string; 
}

interface IndexProps {
    catastros: CatastroPagination;
    numero: string;
    reporte_id: number | null;
    totales: Total;
    filters: FilterProps;    
}

export default function Index({catastros, numero, reporte_id, totales, filters: initialFilters}: IndexProps) {

    const { flash, show } = useFlashAlert();

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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'reportescatastros');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "date",
            key: "fecha",
        },
        {
            type: "select",
            key: "estado",
            options: [
                { value: "ALL", label: "TODOS" },
                { value: "EXPEDIDO", label: "EXPEDIDOS" },
                { value: "ANULADO", label: "ANULADOS" },
            ]
        }
    ];

    const [processing, setProcessing] = useState(false);

    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [reporteToEdit, setReporteToEdit] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de recaudaciones de catastros" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <div className="flex items-center gap-2">
                            {numero && (
                                <>
                                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                                        <span className="text-xs opacity-80 mr-1">Reporte</span>
                                        <span className="text-sm font-bold tracking-wider">#{numero}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                        variant="outline"
                                        onClick={() => {
                                            setReporteToEdit(reporte_id);
                                            setModalEditOpen(true);
                                        }}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                        variant="outline"
                                        onClick={() => {                                            
                                            window.open(`/reportescatastros/excel?fecha=${filters.fecha}&estado=${filters.estado}`, '_blank');
                                        }}
                                    >
                                        <FileSpreadsheet className="mr-1 h-4 w-4" />
                                        Excel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                        variant="outline"
                                        onClick={() => {
                                            window.open(`/reportescatastros/pdf?fecha=${filters.fecha}&estado=${filters.estado}`, '_blank');
                                        }}
                                    >
                                        <FileText className="mr-1 h-4 w-4" />
                                        PDF
                                    </Button>
                                </>
                            )}
                            {!numero && catastros.data.length > 0 && (
                                <Button
                                    size="sm"
                                    className='cursor-pointer'
                                    disabled={processing}
                                    onClick={() => {
                                        setProcessing(true);                                        
                                        router.post('/reportescatastros/generar', {
                                            fecha: filters.fecha,
                                        }, {
                                            onFinish: () => setProcessing(false),
                                        });
                                    }}
                                >
                                    {processing ? (
                                        <Spinner className="mr-1 h-4 w-4" />
                                    ) : (
                                        <PlusIcon className="mr-1 h-4 w-4" />
                                    )}
                                    Generar número
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
                {catastros.data.length ? (
                    <>  
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
                            <div className="rounded-xl border bg-muted/50 p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="text-xl font-bold">
                                        {money(totales.monto_total)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 shadow-sm border border-green-200">
                                <div>
                                    <p className="text-xs text-green-600">Expedidos</p>
                                    <p className="text-xl font-bold text-green-700">
                                        {money(totales.monto_expedidos)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <span className="text-sm text-green-600 font-medium">
                                    {totales.expedidos}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 shadow-sm border border-red-200">
                                <div>
                                    <p className="text-xs text-red-600">Anulados</p>
                                    <p className="text-xl font-bold text-red-700">
                                        {money(totales.monto_anulados)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <span className="text-sm text-red-600 font-medium">
                                    {totales.anulados}
                                </span>
                            </div>
                        </div>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Catastro</th>
                                            <th className="py-2 px-4 text-left border-b">Parroquia</th> 
                                            <th className="py-2 px-4 text-left border-b">Valor total</th>
                                            <th className="py-2 px-4 text-left border-b">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={6}
                                            />
                                        ) : (
                                            catastros.data.map((catastro) => (
                                                <tr
                                                    key={catastro.id}
                                                    className={`
                                                        transition-colors
                                                        ${catastro.estado === "ANULADO"
                                                            ? "bg-red-50 text-gray-400"
                                                            : "odd:bg-muted/50 hover:bg-gray-50"
                                                        }
                                                    `}
                                                >
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{catastro.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{catastro.catastro.cliente?.documento}</div>
                                                            <div className='font-medium'>{catastro.catastro?.cliente?.nombre}</div>                                        
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className='font-medium'>{catastro.catastro.clave_catastral}</div>
                                                        <div className='text-muted-foreground mt-0.5'>{catastro.catastro.numero_predio}</div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{catastro.catastro.parroquia.nombre}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(catastro.valor_total)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${catastro.estado === "EXPEDIDO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                            {catastro.estado}
                                                        </Badge>
                                                    </td>                             
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={catastros.links} />
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

            <ModalEditReporteCatastro
                open={modalEditOpen}
                onClose={() => {
                    setModalEditOpen(false);
                    setReporteToEdit(null);
                }}
                reporteId={reporteToEdit}
                onSuccess={() => {
                    // 🔄 recargar datos sin perder filtros
                    router.reload();
                }}
            />
        </AppLayout>
    );
}
