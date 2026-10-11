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
import { DateRange } from "react-day-picker";
import Pagination from '@/components/pagination';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes avanzados',
        href: '/reportesavanzados',
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

interface PermisoData {
    tabla: "P";

    id: number;
    numero_formateado: string;
    fecha_expedicion: string;
    fecha_caducidad: string;
    fecha_deposito: string;
    documento_deposito: string;
    valor_total: number;
    estado: string;
    proceso_permiso: {
        cliente: {
            documento: string;
            nombre: string;
            email: string;            
        };
        actividad_economica: {
            tipo_actividad: string;
            e_nombre_comercial: string;
            e_actividad_principal: string;
            e_direccion: string;
            v_placa: string;
            v_marca: string;
            v_tipo: string;
            v_clase: string;
            v_color: string;
            parroquia: {
                nombre: string;
            };
        };
        tipo_permiso: {
            nombre: string;
        }
    };    
}

interface CatastroData {
    tabla: "C";

    id: number;
    numero_formateado: string;
    fecha: string;
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

type Data = PermisoData | CatastroData;

interface ReportePagination {
    data: Data[];
    links: LinkProps[];
}

interface FilterProps {
    rango_fecha?: DateRange;
    tabla: string; 
}

interface IndexProps {
    reportes: ReportePagination;
    totales: Total;
    filters: FilterProps;    
}

export default function Index({reportes, totales, filters: initialFilters}: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(parsedFilters, 'reportesavanzados');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "dateRange",
            key: "rango_fecha",
            presets: true,
        },
        {
            type: "select",
            key: "tabla",
            options: [
                { value: "P", label: "PERMISOS DE FUNCIONAMIENTO" },
                { value: "C", label: "RECAUDACIONES DE CATASTROS" },
            ]
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes avanzados" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <div className="flex items-center gap-2">
                            {reportes?.data?.length > 0 && (
                                <>                        
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                        variant="outline"
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                tabla: filters.tabla ?? "P",
                                                "rango_fecha[from]": filters.rango_fecha?.from
                                                    ? dayjs(filters.rango_fecha.from).format("YYYY-MM-DD")
                                                    : "",
                                                "rango_fecha[to]": filters.rango_fecha?.to
                                                    ? dayjs(filters.rango_fecha.to).format("YYYY-MM-DD")
                                                    : "",
                                            });

                                            window.open(`/reportesavanzados/exportExcel?${params.toString()}`, "_blank");
                                        }}
                                    >
                                        <FileSpreadsheet className="mr-1 h-4 w-4" />
                                        Excel
                                    </Button>
                                </>
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
                {reportes.data.length ? (
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
                                            {filters.tabla === "P" && (
                                                <>
                                                    <th className="py-2 px-4 text-left border-b">Número</th>
                                                    <th className="py-2 px-4 text-left border-b">Tipo permiso</th>
                                                    <th className="py-2 px-4 text-left border-b">Cliente</th>
                                                    <th className="py-2 px-4 text-left border-b">Actividad económica</th>                                            
                                                    <th className="py-2 px-4 text-left border-b">Valor</th>
                                                    <th className="py-2 px-4 text-left border-b">Fechas</th>
                                                    <th className="py-2 px-4 text-left border-b">Fecha depósito</th>
                                                    <th className="py-2 px-4 text-left border-b">Documento depósito</th>
                                                    <th className="py-2 px-4 text-left border-b">Estado</th>
                                                </>
                                            )}
                                            {filters.tabla === "C" && (
                                                <>
                                                    <th className="py-2 px-4 text-left border-b">Número</th>
                                                    <th className="py-2 px-4 text-left border-b">Cliente</th>
                                                    <th className="py-2 px-4 text-left border-b">Catastro</th>
                                                    <th className="py-2 px-4 text-left border-b">Parroquia</th>
                                                    <th className="py-2 px-4 text-left border-b">Fecha</th>
                                                    <th className="py-2 px-4 text-left border-b">Valor total</th>
                                                    <th className="py-2 px-4 text-left border-b">Estado</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            filters.tabla === "P" ? (
                                                <TableSkeleton rows={8} columns={9} />
                                            ) : (
                                                <TableSkeleton rows={8} columns={7} />
                                            )
                                        ) : (
                                            reportes.data.map((reporte) => (
                                                <tr
                                                    key={reporte.id}
                                                    className={`
                                                        transition-colors
                                                        ${reporte.estado === "ANULADO"
                                                            ? "bg-red-50 text-gray-400"
                                                            : "odd:bg-muted/50 hover:bg-gray-50"
                                                        }
                                                    `}
                                                >
                                                     {reporte.tabla === "P" && (
                                                        <>
                                                            <td className="py-2 px-4 border-b"><span className='font-medium'>{reporte.numero_formateado}</span></td>
                                                            <td className="py-2 px-4 border-b">{reporte.proceso_permiso?.tipo_permiso?.nombre}</td>   
                                                            <td className="py-2 px-4 border-b">
                                                                <div className="relative pr-6">
                                                                    <div>{reporte.proceso_permiso?.cliente?.documento}</div>
                                                                    <div className='font-medium'>{reporte.proceso_permiso?.cliente?.nombre}</div>                                        
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                {reporte.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold text-gray-900">
                                                                            {reporte.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Building2Icon className="w-5 h-5" />
                                                                            Establecimiento
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold text-gray-900">
                                                                            {reporte.proceso_permiso?.actividad_economica?.v_placa}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Car className="w-5 h-5" />
                                                                            {reporte.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                                                            {reporte.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                                                            {reporte.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                                                            {reporte.proceso_permiso?.actividad_economica?.v_color}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                <span className="font-semibold text-slate-700">
                                                                    {money(reporte.valor_total)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground ml-1">
                                                                    USD
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                <div className="flex flex-col text-sm">
                                                                    <span className="text-muted-foreground text-xs">EMISIÓN</span>
                                                                    <span className="font-medium">
                                                                        {dayjs.utc(reporte.fecha_expedicion).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                    </span>
                                                                    <span className="text-muted-foreground text-xs mt-1">CADUCIDAD</span>
                                                                    <span className="font-semibold text-red-600">
                                                                        {dayjs.utc(reporte.fecha_caducidad).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">{dayjs.utc(reporte.fecha_deposito).tz('America/Guayaquil').format('YYYY-MM-DD')}</td>
                                                            <td className="py-2 px-4 border-b">{reporte.documento_deposito}</td>
                                                            <td className="py-2 px-4 border-b">
                                                                <Badge
                                                                    className={`border-none focus-visible:outline-none
                                                                        ${reporte.estado === "EXPEDIDO"
                                                                            ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                            : "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400"
                                                                        }
                                                                    `}
                                                                >
                                                                    {reporte.estado}
                                                                </Badge>
                                                            </td>
                                                        </>
                                                    )}
                                                     {reporte.tabla === "C" && (
                                                        <>
                                                            <td className="py-2 px-4 border-b"><span className='font-medium'>{reporte.numero_formateado}</span></td>
                                                            <td className="py-2 px-4 border-b">
                                                                <div className="relative pr-6">
                                                                    <div>{reporte.catastro?.cliente?.documento}</div>
                                                                    <div className='font-medium'>{reporte.catastro?.cliente?.nombre}</div>                                        
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                <div className='font-medium'>{reporte.catastro?.clave_catastral}</div>
                                                                <div className='text-muted-foreground mt-0.5'>{reporte.catastro?.numero_predio}</div>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">{reporte.catastro?.parroquia?.nombre}</td>
                                                            <td className="py-2 px-4 border-b">{dayjs.utc(reporte.fecha).tz('America/Guayaquil').format('YYYY-MM-DD')}</td>
                                                            <td className="py-2 px-4 border-b">
                                                                <span className="font-semibold text-slate-700">
                                                                    {money(reporte.valor_total)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground ml-1">
                                                                    USD
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-4 border-b">
                                                                <Badge
                                                                    className={`border-none focus-visible:outline-none
                                                                        ${reporte.estado === "EXPEDIDO"
                                                                            ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                            : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                        }
                                                                    `}
                                                                >
                                                                    {reporte.estado}
                                                                </Badge>
                                                            </td>   
                                                        </>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={reportes.links} />
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