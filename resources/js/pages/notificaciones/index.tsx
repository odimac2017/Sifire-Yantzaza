import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Building2Icon, Calendar, Car, Check, ChevronDown, ChevronUp, Clock, Download, FoldersIcon, InfoIcon, MessageSquare, MoreHorizontalIcon, Pencil, Plus, Send, TriangleAlertIcon, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notificaciones',
        href: '/notificaciones',
    },
];

interface Notificacion {
    id: number;
    personal_id : number;
    nombre_personal: string;
    numero_formateado: string;
    numero_notificacion: string;
    documento_representante_legal: string;
    nombre_representante_legal: string;
    documento_persona_recibe: string;
    nombre_persona_recibe: string;
    fecha_entrega: string;
    fecha_plazo: string;
    observaciones: string;
    estado: string;
}

interface ProcesoPermiso {
    id: number;
    finished_at: string | null;
    notificaciones_count: number;
    cliente: {
        tipo_cliente_id: number;
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
    };
    inspeccion_aprobada: {
        numero_formateado: string;
        fecha_inspeccion: string;
        plazo_permiso: string;
    } | null;
    notificaciones : Notificacion[]; 
}

interface ProcesoPermisoPagination {
    data: ProcesoPermiso[];
    links: LinkProps[];
}

interface FilterProps {
    year: number;
    search: string;
    estado: string;     
}

interface IndexProps {
    procesosPermisos: ProcesoPermisoPagination;
    auth_personal_id: number;   
    administrador: boolean;
    supervisor: boolean;
    inspector: boolean;
    filters: FilterProps;     
}

export default function Index({procesosPermisos, auth_personal_id, administrador, supervisor, inspector, filters: initialFilters}: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'notificaciones');
    
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
                { value: "ALL", label: "TODOS" },
                { value: "PROCESO", label: "EN PROCESO" },
                { value: "ENTREGADO", label: "ENTREGADOS" },
                { value: "CANCELADO", label: "CANCELADOS" },
            ]
        }
    ];

    const tipoNotificacionColor: Record<number, { badge: string; card: string }> = {
        1: {
            badge: "bg-blue-100 text-blue-700",
            card: "border-blue-200 hover:border-blue-300"
        },
        2: {
            badge: "bg-orange-100 text-orange-700",
            card: "border-orange-200 hover:border-orange-300"
        },
        3: {
            badge: "bg-red-100 text-red-700",
            card: "border-red-200 hover:border-red-300"
        }
    };

    const pasos = [
        { numero: 1, label: "Primera" },
        { numero: 2, label: "Segunda" },
        { numero: 3, label: "Tercera" },
    ];

    const [expandedAll, setExpandedAll] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleAll = () => {
        if (expandedAll) {
            setExpandedRows(new Set());
            setExpandedAll(false);
        } else {
            const allIds = procesosPermisos.data.map((item) => item.id);
            setExpandedRows(new Set(allIds));
            setExpandedAll(true);
        }
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            setExpandedAll(next.size === procesosPermisos.data.length);

            return next;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button
                            size="sm"
                            onClick={toggleAll}
                            className="gap-2"
                        >
                            {expandedAll ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Ocultar estados
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Ver estados
                                </>
                            )}
                        </Button>
                    }
                >
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>    
                {procesosPermisos.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Inspección</th>                                            
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>
                                            <th className="py-2 px-4 text-left border-b">Tipo permiso</th>                                            
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={5}
                                            />
                                        ) : (
                                            procesosPermisos.data.map((proceso) => (
                                                <>
                                                    <tr className="odd:bg-muted/50 hover:bg-muted/30" key={proceso.id}>
                                                        <td className="py-2 px-4 border-b"><span className='font-medium'>{proceso.inspeccion_aprobada?.numero_formateado}</span></td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="relative pr-6">
                                                                <div>{proceso.cliente?.documento}</div>
                                                                <div className='font-medium'>{proceso.cliente?.nombre}</div>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                                <InfoIcon className="h-4 w-4" />
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="right" align="start">
                                                                            <div className="text-xs space-y-1">
                                                                                <div><strong>Email:</strong> {proceso.cliente?.email}</div>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            {proceso.actividad_economica?.tipo_actividad === "E" ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-gray-900">
                                                                        {proceso.actividad_economica?.e_nombre_comercial}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Building2Icon className="w-5 h-5" />
                                                                        Establecimiento
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-gray-900">
                                                                        {proceso.actividad_economica?.v_placa}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Car className="w-5 h-5" />
                                                                        {proceso.actividad_economica?.v_marca}{" "}
                                                                        {proceso.actividad_economica?.v_tipo}{" "}
                                                                        {proceso.actividad_economica?.v_clase}{" "}
                                                                        {proceso.actividad_economica?.v_color}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {proceso.tipo_permiso?.nombre}
                                                                </span>

                                                                <span className="text-sm text-red-500">
                                                                    Plazo obtención:{' '}
                                                                    {proceso.inspeccion_aprobada?.plazo_permiso
                                                                        ? dayjs
                                                                            .utc(proceso.inspeccion_aprobada.plazo_permiso)
                                                                            .tz('America/Guayaquil')
                                                                            .format('YYYY-MM-DD')
                                                                        : '—'}
                                                                </span>
                                                            </div>
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
                                                                        {proceso.notificaciones_count < 3 && (
                                                                            <DropdownMenuItem asChild>
                                                                                {(administrador || supervisor) && (
                                                                                    <Link 
                                                                                        href={`/notificaciones/${proceso.id}/create`}
                                                                                        data={{ search: filters.search, year: filters.year, estado: filters.estado }}
                                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                                    >
                                                                                        <Plus className="h-4 w-4" />
                                                                                        <span>Crear boleta</span>
                                                                                    </Link>
                                                                                )}
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem
                                                                            onSelect={(e) => {
                                                                                e.preventDefault();
                                                                                toggleRow(proceso.id);
                                                                            }}
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <ChevronDown
                                                                                className={`h-4 w-4 transition-transform duration-200 ${
                                                                                    expandedRows.has(proceso.id) ? "rotate-180" : ""
                                                                                }`}
                                                                            />
                                                                            <span>
                                                                                {expandedRows.has(proceso.id) ? "Ocultar estado" : "Ver estado"}
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuGroup>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>                           
                                                        </td>
                                                    </tr>
                                                    {expandedRows.has(proceso.id) && (
                                                        <tr>
                                                            <td colSpan={5} className="bg-muted/30 px-6 py-3">
                                                                {proceso.notificaciones.length > 0 ? (
                                                                    <>
                                                                        <div className="w-full mb-2">
                                                                            <div className="flex items-center justify-between relative">
                                                                                <div className="absolute top-4 left-0 right-0 h-[3px] bg-muted"></div>
                                                                                {pasos.map((paso) => {
                                                                                    
                                                                                    const mapaNotificaciones = Object.fromEntries(
                                                                                        proceso.notificaciones.map(n => [Number(n.numero_notificacion), n])
                                                                                    );

                                                                                    const notificacion = mapaNotificaciones[paso.numero];

                                                                                    const entregado = notificacion?.fecha_entrega;

                                                                                    return (
                                                                                        <div key={paso.numero} className="flex flex-col items-center relative z-10">
                                                                                            <div
                                                                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border
                                                                                                ${
                                                                                                    entregado
                                                                                                        ? "bg-green-500 text-white border-green-500"
                                                                                                        : notificacion
                                                                                                        ? "bg-orange-100 text-orange-600 border-orange-400"
                                                                                                        : "bg-muted text-muted-foreground"
                                                                                                }`}
                                                                                            >
                                                                                                {entregado ? (
                                                                                                    <Check className="w-4 h-4" />
                                                                                                ) : notificacion ? (
                                                                                                    <Clock className="w-4 h-4 animate-spin" />
                                                                                                ) : (
                                                                                                    paso.numero
                                                                                                )}
                                                                                            </div>
                                                                                            <span className="text-[11px] mt-1 text-muted-foreground">
                                                                                                {paso.label}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">                                                        
                                                                            {proceso.notificaciones.map((n) => {

                                                                                const entregado = n.fecha_entrega;

                                                                                const color = tipoNotificacionColor[Number(n.numero_notificacion)] || {};

                                                                                return (
                                                                                    <div
                                                                                        key={n.id}
                                                                                        className={`group relative rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 ${color.card}`}
                                                                                    >
                                                                                        <div className="flex items-center justify-between mb-2">
                                                                                            <span className="text-sm font-bold truncate">
                                                                                                #{n.numero_formateado}
                                                                                            </span>
                                                                                            {entregado ? (
                                                                                                <span className="text-[11px] px-2 py-1 rounded bg-green-100 text-green-700">
                                                                                                    Entregado
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="text-[11px] px-2 py-1 rounded bg-orange-100 text-orange-700">
                                                                                                    Pendiente
                                                                                                </span>
                                                                                            )}                                                                        
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0 space-y-1">                                                                                    
                                                                                            {n.fecha_entrega && (
                                                                                                <p className="text-xs font-medium flex items-center gap-1">
                                                                                                    <Calendar className="w-3 h-3" />
                                                                                                    Entrega: {dayjs.utc(n.fecha_entrega).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss')}
                                                                                                </p>
                                                                                            )}
                                                                                            {n.fecha_plazo && (
                                                                                                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                                                                                                    <Calendar className="w-3 h-3" />
                                                                                                    Plazo: {dayjs.utc(n.fecha_plazo).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                                                                                </p>
                                                                                            )}                                                                                       
                                                                                            <p className="text-xs text-muted-foreground">
                                                                                                Inspector: {n.nombre_personal}
                                                                                            </p>                                                                                     
                                                                                        </div>
                                                                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-xl">
                                                                                            <Popover>
                                                                                                <PopoverTrigger asChild>
                                                                                                    <button className="absolute top-1 left-1 p-1 rounded-md bg-white/80 backdrop-blur text-muted-foreground hover:text-primary transition cursor-pointer">
                                                                                                        <InfoIcon className="h-4 w-4"/>
                                                                                                    </button>
                                                                                                </PopoverTrigger>
                                                                                                <PopoverContent className="w-72 text-xs p-4 space-y-3">
                                                                                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                                                                                        <InfoIcon className="w-4 h-4"/>
                                                                                                        Información de entrega
                                                                                                    </div>
                                                                                                    <div className="border-t mb-3"></div>
                                                                                                    <div className="space-y-2">
                                                                                                        {entregado && (
                                                                                                            <>
                                                                                                                {proceso.cliente?.tipo_cliente_id === 2 && (
                                                                                                                    <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
                                                                                                                        <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5"/>
                                                                                                                        <div>
                                                                                                                            <span className="text-muted-foreground">Representante</span>
                                                                                                                            <div className="font-medium">
                                                                                                                                {n.nombre_representante_legal ?? "—"}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                                <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
                                                                                                                    <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5"/>
                                                                                                                    <div>
                                                                                                                        <span className="text-muted-foreground">Entregado a</span>
                                                                                                                        <div className="font-medium">
                                                                                                                            {n.nombre_persona_recibe ?? "—"}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>                                                                                                        
                                                                                                            </>
                                                                                                        )}
                                                                                                        <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
                                                                                                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5"/>
                                                                                                            <div>
                                                                                                                <span className="text-muted-foreground">Observaciones</span>
                                                                                                                <div className="font-medium">
                                                                                                                    {n.observaciones ?? "Sin observaciones"}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </PopoverContent>
                                                                                            </Popover>  
                                                                                            {!entregado && (
                                                                                                <>                                                                                                
                                                                                                    {(administrador || supervisor) && (
                                                                                                        <Link
                                                                                                            href={`/notificaciones/${n.id}/edit`}
                                                                                                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                                                                        >
                                                                                                            <Pencil className="w-3.5 h-3.5"/>
                                                                                                            Editar
                                                                                                        </Link>
                                                                                                    )}
                                                                                                    {(inspector && auth_personal_id === n.personal_id) && (
                                                                                                        <Link
                                                                                                            href={`/notificaciones/${n.id}/entregar`}
                                                                                                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                                                                        >
                                                                                                            <Send className="w-3.5 h-3.5"/>
                                                                                                            Entregar
                                                                                                        </Link>
                                                                                                    )}
                                                                                                </>
                                                                                            )}
                                                                                            {entregado && ( 
                                                                                                <>
                                                                                                    <Link
                                                                                                        href={`/notificaciones/${n.id}`}
                                                                                                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                                                                    >
                                                                                                        <FoldersIcon className="w-3.5 h-3.5"/>
                                                                                                        Archivos
                                                                                                    </Link>                                                                                             
                                                                                                    <a
                                                                                                        href={`/notificaciones/${n.id}/descargar`}
                                                                                                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                                                                    >
                                                                                                        <Download className="w-3.5 h-3.5"/>
                                                                                                        Descargar
                                                                                                    </a>
                                                                                                </>
                                                                                            )}
                                                                                        </div>                                                                      
                                                                                    </div>
                                                                                );
                                                                            })}                                                                                                                                     
                                                                        </div> 
                                                                    </>  
                                                                ) : (
                                                                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                                                        <TriangleAlertIcon className="h-4 w-4" />
                                                                        Sin notificaciones
                                                                    </div>
                                                                )}                               
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={procesosPermisos.links} />
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
