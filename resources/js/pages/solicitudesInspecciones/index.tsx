import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Building2Icon, Car, DownloadIcon, FoldersIcon, InfoIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
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
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Solicitudes de inspección',
        href: '/solicitudesinspecciones',
    },
];

interface SolicitudInspeccion {
    id: number;
    numero_formateado: string;
    tipo_solicitud: string;
    fecha_solicitud: string;
    fecha_inspeccion: string;
    nombre_personal: string;
    estado: string;
    ruta_pdf: string;
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
        };
    };    
}

interface SolicitudInspeccionPagination {
    data: SolicitudInspeccion[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;
    estado: string;     
}

interface IndexProps {
    solicitudesInspecciones: SolicitudInspeccionPagination;
    filters: FilterProps;    
}

export default function Index({solicitudesInspecciones, filters: initialFilters}: IndexProps) {

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

    const [solicitudInspeccionToDelete, setSolicitudInspeccionToDelete] = useState<number | null>(null);

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'solicitudesinspecciones');
    
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
                { value: "GENERADO", label: "GENERADOS" },
                { value: "REALIZADO", label: "REALIZADOS" }
            ]
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de inspección" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/solicitudesinspecciones/create"
                                data={{ search: filters.search, year: filters.year, estado: filters.estado  }}
                            >
                                <PlusIcon className="mr-1 h-4 w-4"/>
                                Nuevo
                            </Link>
                        </Button>
                    }
                >
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>    
                {solicitudesInspecciones.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Fecha solicitud</th>
                                            <th className="py-2 px-4 text-left border-b">Fecha inspección</th>
                                            <th className="py-2 px-4 text-left border-b">Tipo permiso</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>
                                            <th className="py-2 px-4 text-left border-b">Inspector asignado</th> 
                                            <th className="py-2 px-4 text-left border-b">Estado</th>        
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
                                            solicitudesInspecciones.data.map((solicitud) => (
                                                <tr className="odd:bg-muted/50 hover:bg-muted/30" key={solicitud.id}>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{solicitud.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">{solicitud.fecha_solicitud}</td>
                                                    <td className="py-2 px-4 border-b">{solicitud.fecha_inspeccion}</td>
                                                    <td className="py-2 px-4 border-b">{solicitud.proceso_permiso?.tipo_permiso?.nombre}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{solicitud.proceso_permiso?.cliente?.documento}</div>
                                                            <div className='font-medium'>{solicitud.proceso_permiso?.cliente?.nombre}</div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                            <InfoIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <div className="text-xs space-y-1">
                                                                            <div><strong>Email:</strong> {solicitud.proceso_permiso?.cliente?.email}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {solicitud.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {solicitud.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Building2Icon className="w-5 h-5" />
                                                                    Establecimiento
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {solicitud.proceso_permiso?.actividad_economica?.v_placa}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Car className="w-5 h-5" />
                                                                    {solicitud.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                                                    {solicitud.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                                                    {solicitud.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                                                    {solicitud.proceso_permiso?.actividad_economica?.v_color}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{solicitud.nombre_personal}</td>   
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${solicitud.estado === "REALIZADO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                                                                }
                                                            `}
                                                        >
                                                            {solicitud.estado}
                                                        </Badge>
                                                    </td>                             
                                                    <td className="text-center border-b">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-40" align="end">
                                                                <DropdownMenuGroup> 
                                                                    {solicitud.estado !== 'REALIZADO' && (
                                                                        <>
                                                                            <DropdownMenuItem asChild disabled={solicitud.estado === "REALIZADO"}>
                                                                                <Link 
                                                                                    href={`/solicitudesinspecciones/${solicitud.id}/edit`}
                                                                                    data={{ search: filters.search, year: filters.year, estado: filters.estado }}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <PencilIcon className="h-4 w-4" />
                                                                                    <span>Editar</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => setSolicitudInspeccionToDelete(solicitud.id)}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                                disabled={solicitud.estado === "REALIZADO"}
                                                                            >
                                                                                <Trash2Icon className="h-4 w-4" />
                                                                                Eliminar
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/solicitudesinspecciones/${solicitud.id}`}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <FoldersIcon className="h-4 w-4" />
                                                                            <span>Requisitos</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <a
                                                                            href={`/solicitudesinspecciones/${solicitud.id}/descargar`}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <DownloadIcon className="h-4 w-4" />
                                                                            <span>Descargar PDF</span>
                                                                        </a>
                                                                    </DropdownMenuItem>                                                    
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
                            <Pagination links={solicitudesInspecciones.links} />
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
                open={solicitudInspeccionToDelete !== null}
                onOpenChange={() => setSolicitudInspeccionToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. La solicitud de inspección será eliminada permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="delete"
                onConfirm={() => {
                    if (solicitudInspeccionToDelete) {
                        router.delete(`/solicitudesinspecciones/${solicitudInspeccionToDelete}`, {
                            preserveScroll: true,
                        });
                    }
                    setSolicitudInspeccionToDelete(null);
                }}
            />
        </AppLayout>
    );
}
