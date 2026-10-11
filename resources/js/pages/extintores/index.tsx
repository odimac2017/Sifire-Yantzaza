import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Building2Icon, Car, InfoIcon, MoreHorizontalIcon, PencilIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extintores',
        href: '/extintores',
    },
];

interface Extintor {
    id: number;
    numero_formateado: string;
    tipo: string;
    capacidad: number;
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
        };
        inspeccion: {
            numero_formateado: string;
        }
    };    
}

interface ExtintorPagination {
    data: Extintor[];
    links: LinkProps[];
}

interface FilterProps {
    year: number;
    search: string;
}

interface IndexProps {
    extintores: ExtintorPagination;
    filters: FilterProps;    
}

export default function Index({extintores, filters: initialFilters}: IndexProps) {
    
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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'extintores');
    
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
            <Head title="Extintores" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>
                {extintores.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número extintor</th>
                                            <th className="py-2 px-4 text-left border-b">Tipo</th>
                                            <th className="py-2 px-4 text-left border-b">Capacidad</th>
                                            <th className="py-2 px-4 text-left border-b">Estado</th>
                                            <th className="py-2 px-4 text-left border-b">Inspección</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Actividad económica</th>                                
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
                                            extintores.data.map((extintor) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={extintor.id}>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{extintor.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">{extintor.tipo}</td>
                                                    <td className="py-2 px-4 border-b">{extintor.capacidad} LBS</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${extintor.estado === "BUENO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : extintor.estado === "REGULAR"
                                                                    ? "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                            {extintor.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{extintor.proceso_permiso?.inspeccion?.numero_formateado}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{extintor.proceso_permiso?.cliente?.documento}</div>
                                                            <div className='font-medium'>{extintor.proceso_permiso?.cliente?.nombre}</div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                            <InfoIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <div className="text-xs space-y-1">
                                                                            <div><strong>Email:</strong> {extintor.proceso_permiso?.cliente?.email}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {extintor.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {extintor.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Building2Icon className="w-5 h-5" />
                                                                    Establecimiento
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">
                                                                    {extintor.proceso_permiso?.actividad_economica?.v_placa}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Car className="w-5 h-5" />
                                                                    {extintor.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                                                    {extintor.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                                                    {extintor.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                                                    {extintor.proceso_permiso?.actividad_economica?.v_color}
                                                                </span>
                                                            </div>
                                                        )}
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
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/extintores/${extintor.id}/edit`}
                                                                            data={{ search: filters.search, year: filters.year }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <PencilIcon className="h-4 w-4" />
                                                                            <span>Editar</span>
                                                                        </Link>
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
                            <Pagination links={extintores.links} />
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center my-6">
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
