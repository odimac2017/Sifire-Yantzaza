import AppLayout from '@/layouts/app-layout';
import { LinkProps, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2Icon, Car, Clock, DollarSign, FileSpreadsheet, FileText, PlusIcon, TriangleAlertIcon } from "lucide-react";
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
import ModalEditReportePermiso from '@/pages/reportes/ModalEditReportePermiso';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import Pagination from '@/components/pagination';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reporte de clientes sin permiso de funcionamiento',
        href: '/reportesclientessinpermisos',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface PermisoFuncionamiento {
    id: number;
    numero: number;
    numero_formateado: string;
    fecha_expedicion: string;
    fecha_caducidad: string;
}

interface ProcesoPermiso {
    id: number;
    tipo_permiso_id: number;
    permiso_funcionamiento: PermisoFuncionamiento | null;
}

interface ClienteSinPermiso {
    id: number;
    e_nombre_comercial: string;
    parroquia?: Parroquia;
    cliente: {
        documento: string;
        nombre: string;
        email: string;            
    };
    ultimo_proceso_permiso: ProcesoPermiso | null;
}

interface ClienteSinPermisoPagination {
    data: ClienteSinPermiso[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;   
}


interface IndexProps {
    clientesSinPermisos: ClienteSinPermisoPagination;
    filters: FilterProps;    
}

export default function Index({clientesSinPermisos, filters: initialFilters}: IndexProps) {

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

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'reportesclientessinpermisos');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar",
        },
        {
            type: "year",
            key: "year",
            fromYear: startYear,
            toYear: endYear,
        }
    ];

    const [processing, setProcessing] = useState(false);

    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [reporteToEdit, setReporteToEdit] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de permisos de funcionamiento" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <div className="flex items-center gap-2">
                            
                        </div>
                    }
                >
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>
                {clientesSinPermisos.data.length ? (
                    <>                          
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>
                                            <th className="py-2 px-4 text-left border-b">Parroquia</th> 
                                            <th className="py-2 px-4 text-left border-b">Último permiso</th>                                                                                     
                                            <th className="py-2 px-4 text-left border-b">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={9}
                                            />
                                        ) : (
                                            clientesSinPermisos.data.map((clientes) => (
                                                <tr>   
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{clientes.cliente?.documento}</div>
                                                            <div className='font-medium'>{clientes.cliente?.nombre}</div>                                        
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">                                                        
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">
                                                                {clientes.e_nombre_comercial}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Building2Icon className="w-5 h-5" />
                                                                Establecimiento
                                                            </span>
                                                        </div>                                                        
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{clientes.parroquia?.nombre}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        {clientes.ultimo_proceso_permiso?.permiso_funcionamiento ? (
                                                            <div className="relative pl-3 border-l-2 border-slate-300">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                                                        AÑO {dayjs(
                                                                            clientes.ultimo_proceso_permiso.permiso_funcionamiento.fecha_expedicion
                                                                        ).format('YYYY')}
                                                                    </span>
                                                                </div>
                                                                <div className="font-bold text-sm text-gray-900">
                                                                    N.º {clientes.ultimo_proceso_permiso.permiso_funcionamiento.numero_formateado}
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                                    <span>
                                                                        Exp. <strong className="text-gray-700">
                                                                            {dayjs(
                                                                                clientes.ultimo_proceso_permiso.permiso_funcionamiento.fecha_expedicion
                                                                            ).format('DD/MM/YYYY')}
                                                                        </strong>
                                                                    </span>
                                                                    <span>
                                                                        Cad. <strong className="text-gray-700">
                                                                            {dayjs(
                                                                                clientes.ultimo_proceso_permiso.permiso_funcionamiento.fecha_caducidad
                                                                            ).format('DD/MM/YYYY')}
                                                                        </strong>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                Sin permisos anteriores
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="text-[10px] tracking-wide uppercase font-bold bg-slate-900 text-white px-2 py-1 rounded-md">
                                                                Año {filters.year}
                                                            </span>

                                                            <span className="font-semibold text-sm text-gray-800">
                                                                SIN PERMISO
                                                            </span>
                                                        </div>
                                                    </td>                                                    
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={clientesSinPermisos.links} />
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center my-4">
                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>No existen resultados</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Por favor intente de nuevo con otros criterios de búsqueda.
                            </AlertDescription>
                        </Alert>
                    </div>                 
                )}            
            </div>
        </AppLayout>
    );
}
