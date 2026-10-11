import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { BanIcon, Building2Icon, Car, ClipboardListIcon, Clock, DollarSign, DownloadIcon, InfoIcon, MoreHorizontalIcon, RefreshCcwIcon, Send, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { money } from "@/utils/format";
import EstadoFirmaBadge from '@/pages/permisosFuncionamientos/EstadoFirmaBadge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ModalFirmarPermiso from '@/pages/permisosFuncionamientos/ModalFirmarPermiso';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permisos de funcionamiento',
        href: '/permisosfuncionamientos',
    },
];

interface Totales {
    total: number;
    expedidos: number;
    anulados: number;
    monto_expedidos: number;
    monto_anulados: number;
    monto_total: number;
}

interface PermisoFuncionamiento {
    id: number;
    proceso_permiso_id: number;
    numero_formateado: string;
    fecha_inspeccion: string;
    fecha_expedicion: string;
    fecha_caducidad: string;
    valor_total: number;
    estado: string;
    estado_firma: string;
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

interface PermisoFuncionamientoPagination {
    data: PermisoFuncionamiento[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;
    estado: string;     
}

interface IndexProps {
    permisosFuncionamientos: PermisoFuncionamientoPagination;
    totales: Totales;
    filters: FilterProps;    
}

export default function Index({permisosFuncionamientos, totales, filters: initialFilters}: IndexProps) {

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

    useEffect(() => {
        const hayPendientes = permisosFuncionamientos.data.some(
            (i) => i.estado_firma === "PENDIENTE"
        );

        if (!hayPendientes) return;

        const interval = setInterval(() => {
            router.get('/permisosfuncionamientos', {}, {
                only: ['permisosFuncionamientos'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 15000); 

        return () => clearInterval(interval);
    }, [permisosFuncionamientos.data]);

    const [permisoFuncionamientoToCancel, setPermisoFuncionamientoToCancel] = useState<number | null>(null);

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'permisosfuncionamientos');
    
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
        },
        {
            type: "select",
            key: "estado",
            options: [
                { value: "APROBADO", label: "APROBADOS" },
                { value: "EXPEDIDO", label: "EXPEDIDOS" },
                { value: "ANULADO", label: "ANULADOS" },
            ]
        }
    ];

    const [modalFirmarOpen, setModalFirmarOpen] = useState(false);
    const [permisoToSign, setPermisoToSign] = useState<number | null>(null);

    const reenviarCorreo = (permisosFuncionamientos: PermisoFuncionamiento) => {
        router.post(`/permisosfuncionamientos/${permisosFuncionamientos.id}/reenviarCorreo`, {}, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permisos de funcionamiento" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>    
                {permisosFuncionamientos.data.length ? (
                    <>
                        {filters.estado !== "APROBADO" && (
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
                        )}
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Tipo permiso</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>                                            
                                            <th className="py-2 px-4 text-left border-b">Fechas</th>
                                            <th className="py-2 px-4 text-left border-b">Valor</th>
                                            <th className="py-2 px-4 text-left border-b">Estado</th>   
                                            <th className="py-2 px-4 text-left border-b">Estado Firma</th>  
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={9}
                                            />
                                        ) : (
                                            permisosFuncionamientos.data.map((permiso) => (                                        
                                                <tr
                                                    key={permiso.id}
                                                    className={`
                                                        transition-colors
                                                        ${
                                                            permiso.estado === "ANULADO"
                                                                ? "bg-red-50 text-gray-400"
                                                                : permiso.estado !== 'APROBADO' && new Date(permiso.fecha_expedicion).getFullYear() !== new Date().getFullYear()
                                                                    ? "bg-yellow-50 text-yellow-700"
                                                                    : "odd:bg-muted/50 hover:bg-gray-50"
                                                        }
                                                    `}
                                                >
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{permiso.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-sm text-gray-800">
                                                                {permiso.proceso_permiso?.tipo_permiso?.nombre}
                                                            </span>

                                                            <span className="text-[10px] tracking-wide uppercase font-bold bg-slate-900 text-white px-2 py-1 rounded-md">
                                                                {dayjs(permiso.fecha_expedicion).year()}
                                                            </span>
                                                        </div>
                                                    </td>   
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{permiso.proceso_permiso?.cliente?.documento}</div>
                                                            <div className='font-medium'>{permiso.proceso_permiso?.cliente?.nombre}</div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                            <InfoIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <div className="text-xs space-y-1">
                                                                            <div><strong>Email:</strong> {permiso.proceso_permiso?.cliente?.email}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {permiso.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {permiso.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Building2Icon className="w-5 h-5" />
                                                                    Establecimiento
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {permiso.proceso_permiso?.actividad_economica?.v_placa}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Car className="w-5 h-5" />
                                                                    {permiso.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                                                    {permiso.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                                                    {permiso.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                                                    {permiso.proceso_permiso?.actividad_economica?.v_color}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {permiso.estado === 'APROBADO' ? (
                                                            // 🔹 SOLO FECHA DE INSPECCIÓN
                                                            <div className="flex flex-col text-sm">
                                                                <span className="text-muted-foreground text-xs">INSPECCIÓN</span>
                                                                <span className="font-medium">
                                                                    {dayjs.utc(permiso.fecha_inspeccion).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                </span>
                                                            </div>
                                                        ) : (                                                        
                                                            // 🔹 EMISIÓN + CADUCIDAD
                                                            <div className="flex flex-col text-sm">
                                                                <span className="text-muted-foreground text-xs">EMISIÓN</span>
                                                                <span className="font-medium">
                                                                    {dayjs.utc(permiso.fecha_expedicion).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                </span>
                                                                <span className="text-muted-foreground text-xs mt-1">CADUCIDAD</span>
                                                                <span className="font-semibold text-red-600">
                                                                    {dayjs.utc(permiso.fecha_caducidad).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(permiso.valor_total)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${permiso.estado === "EXPEDIDO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : permiso.estado === "ANULADO"
                                                                    ? "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400"
                                                                    : "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                                                                }
                                                            `}
                                                        >
                                                            {permiso.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {permiso.estado !== 'APROBADO' && permiso.estado !== 'ANULADO' && (
                                                            <EstadoFirmaBadge permisoFuncionamiento={permiso} />
                                                        )}
                                                    </td>
                                                    <td className="text-center border-b">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-48" align="end">
                                                                <DropdownMenuGroup>
                                                                    {permiso.estado === 'APROBADO' && (
                                                                        <>
                                                                            {/* 📄 CREAR PERMISO */}
                                                                            <DropdownMenuItem asChild>
                                                                                <Link 
                                                                                    href={`/permisosfuncionamientos/${permiso.proceso_permiso_id}/create`}
                                                                                    data={{ search: filters.search, year: filters.year, estado: filters.estado }}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <ClipboardListIcon className="h-4 w-4" />
                                                                                    <span>Crear permiso</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    {permiso.estado !== 'APROBADO' && permiso.estado !== 'ANULADO' && (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link 
                                                                                    href={`/permisosfuncionamientos/${permiso.id}/edit`}
                                                                                    data={{ search: filters.search, year: filters.year, estado: filters.estado }}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <RefreshCcwIcon className="h-4 w-4" />
                                                                                    <span>Editar</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                    
                                                                            {/* 🗑️ ANULAR */}
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => setPermisoFuncionamientoToCancel(permiso.id)}
                                                                                disabled={permiso.estado === "ANULADO"}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <BanIcon className="h-4 w-4" />
                                                                                <span>Anular</span>
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    {['ERROR_FIRMA', 'PENDIENTE'].includes(permiso.estado_firma) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                router.post(`/permisosfuncionamientos/${permiso.id}/firmar`);
                                                                            }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>
                                                                                {permiso.estado_firma === 'ERROR_FIRMA'
                                                                                    ? 'Reintentar firma'
                                                                                    : 'Firmar'}
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {permiso.estado !== 'APROBADO' && permiso.estado !== 'ANULADO' &&
                                                                    ['SIN_FIRMA','FIRMADO'].includes(permiso.estado_firma) && (
                                                                        <>
                                                                            {/* 📥 DESCARGAR PDF */}
                                                                            <DropdownMenuItem asChild>
                                                                                <a
                                                                                    href={`/permisosfuncionamientos/${permiso.id}/descargar`}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <DownloadIcon className="h-4 w-4" />
                                                                                    Descargar PDF
                                                                                </a>
                                                                            </DropdownMenuItem>                                                                            
                                                                            <DropdownMenuItem
                                                                                onClick={() => reenviarCorreo(permiso)}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                                Reenviar correo
                                                                            </DropdownMenuItem>                                                                            
                                                                        </>
                                                                    )}
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>                           
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={permisosFuncionamientos.links} />
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

            <ConfirmDialog
                open={permisoFuncionamientoToCancel !== null}
                onOpenChange={() => setPermisoFuncionamientoToCancel(null)}
                title="¿Está seguro?"
                description="El permiso de funcionamiento será anulado."
                confirmText="Anular"
                cancelText="Cancelar"
                variant="cancel"
                onConfirm={() => {
                    if (permisoFuncionamientoToCancel) {
                        router.patch(`/permisosfuncionamientos/${permisoFuncionamientoToCancel}/anular`, {
                            preserveScroll: true,
                        });
                    }
                    setPermisoFuncionamientoToCancel(null);
                }}
            />

            <ModalFirmarPermiso
                open={modalFirmarOpen}
                onClose={() => {
                    setModalFirmarOpen(false);
                    setPermisoToSign(null);
                }}
                permisoId={permisoToSign}
                onSuccess={() => {
                    // 🔄 recargar datos sin perder filtros
                    router.reload();
                }}
            />
        </AppLayout>
    );
}
