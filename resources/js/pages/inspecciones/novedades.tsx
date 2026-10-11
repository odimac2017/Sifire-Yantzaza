import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Building2Icon, Car, ClipboardListIcon, InfoIcon, MoreHorizontalIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Novedades de inspecciones',
        href: '/inspecciones/novedades',
    },
];

interface Inspeccion {
    id: number;
    proceso_permiso_id: number;
    personal_id: number;
    numero_formateado: string;
    tipo_inspeccion: string;
    fecha_inspeccion: string;
    nombre_personal: string;
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
            tipo_inspeccion: {
                nombre: string;
            };
        }
    };    
}

interface InspeccionPagination {
    data: Inspeccion[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;   
}

interface IndexProps {
    inspecciones: InspeccionPagination;
    filters: FilterProps; 
}

export default function Index({inspecciones, filters: initialFilters}: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'inspecciones/novedades');
    
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novedades de inspecciones" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>    
                {inspecciones.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Fecha inspección</th>
                                            <th className="py-2 px-4 text-left border-b">Tipo inspección</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>
                                            <th className="py-2 px-4 text-left border-b">Inspector</th> 
                                            <th className="py-2 px-4 text-left border-b">Estado</th>  
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={8}
                                            />
                                        ) : (
                                            inspecciones.data.map((inspeccion) => (
                                                <tr className="odd:bg-muted/50 hover:bg-muted/30" key={inspeccion.id}>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{inspeccion.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">{dayjs.utc(inspeccion.fecha_inspeccion).tz('America/Guayaquil').format('YYYY-MM-DD')}</td>
                                                    <td className="py-2 px-4 border-b">{inspeccion.proceso_permiso?.tipo_permiso?.tipo_inspeccion?.nombre}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{inspeccion.proceso_permiso?.cliente?.documento}</div>
                                                            <div className='font-medium'>{inspeccion.proceso_permiso?.cliente?.nombre}</div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                            <InfoIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <div className="text-xs space-y-1">
                                                                            <div><strong>Email:</strong> {inspeccion.proceso_permiso?.cliente?.email}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {inspeccion.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Building2Icon className="w-5 h-5" />
                                                                    Establecimiento
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.v_placa}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Car className="w-5 h-5" />
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                                                    {inspeccion.proceso_permiso?.actividad_economica?.v_color}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{inspeccion.nombre_personal}</td>   
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${inspeccion.estado === "APROBADO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : inspeccion.estado === "REINSPECCION"
                                                                    ? "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400"
                                                                    : "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                                                                }
                                                            `}
                                                        >
                                                            {inspeccion.estado}
                                                        </Badge>
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
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            router.post(`/solicitudesinspecciones/${inspeccion.id}/generarreinspeccion`, {
                                                                                search: filters.search,
                                                                                year: filters.year,
                                                                            })
                                                                        }
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <ClipboardListIcon className="h-4 w-4" />
                                                                        <span>Crear solicitud</span>
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
                            <Pagination links={inspecciones.links} />
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
