import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Clock, DownloadIcon, FoldersIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import ConfirmDialog from "@/components/form/ConfirmDialog";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import TableSkeleton from '@/components/skeletons/TableSkeleton';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partes emergencias',
        href: '/partesemergencias',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface ParteEmergencia {
    id: number,
    personal_id: number,
    numero_formateado: string,
    categoria1: string,
    categoria2: string;
    parroquia?: Parroquia;
    direccion: string,
    latitud: string,
    longitud: string;
    fecha_salida: string,
    nombre_personal: string,
}

interface ParteEmergenciaPagination {
    data: ParteEmergencia[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;
}

interface IndexProps {
    partesEmergencias: ParteEmergenciaPagination;
    auth_personal_id: number;
    filters: FilterProps;
}

export default function Index({partesEmergencias, auth_personal_id, filters: initialFilters }: IndexProps) {    

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

    const [parteEmergenciaToDelete, setParteEmergenciaToDelete] = useState<number | null>(null);

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'partesemergencias');
    
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
            <Head title="Partes emergencias" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/partesemergencias/create"
                                data={{ search: filters.search, year: filters.year  }}
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
                {partesEmergencias.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Categoría</th>
                                            <th className="py-2 px-4 text-left border-b">Parroquia / Dirección</th>
                                            <th className="py-2 px-4 text-left border-b">Geolocalización</th>
                                            <th className="py-2 px-4 text-left border-b">Fecha de salida</th>
                                            <th className="py-2 px-4 text-left border-b">Personal responsable</th>
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={7}
                                            />
                                        ) : (
                                            partesEmergencias.data.map((parte) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={parte.id}>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{parte.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">
                                                                {parte.categoria1}
                                                            </span>
                                                            <span className="text-gray-900">
                                                                {parte.categoria2}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">
                                                                {parte.parroquia?.nombre}
                                                            </span>
                                                            <span className="text-gray-900">
                                                                {parte.direccion}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{parte.longitud}, {parte.latitud}</td>
                                                    <td className="py-2 px-4 border-b">{dayjs.utc(parte.fecha_salida).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm')}</td>
                                                    <td className="py-2 px-4 border-b">{parte.nombre_personal}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-40" align="end">
                                                                <DropdownMenuGroup>
                                                                    {parte.personal_id === auth_personal_id && (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link
                                                                                    href={`/partesemergencias/${parte.id}/edit`}
                                                                                    data={{ search: filters.search, year: filters.year }}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <PencilIcon className="h-4 w-4" />
                                                                                    <span>Editar</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => setParteEmergenciaToDelete(parte.id)}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <Trash2Icon className="h-4 w-4" />
                                                                                Eliminar
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/partesemergencias/${parte.id}`}
                                                                            data={{ search: filters.search, year: filters.year }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <FoldersIcon className="h-4 w-4" />
                                                                            <span>Archivos</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <a
                                                                            href={`/partesemergencias/${parte.id}/descargar`}
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
                            <Pagination links={partesEmergencias.links} />
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

            <ConfirmDialog
                open={parteEmergenciaToDelete !== null}
                onOpenChange={() => setParteEmergenciaToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El parte de emergencia será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="delete"
                onConfirm={() => {
                    if (parteEmergenciaToDelete) {
                        router.delete(`/partesemergencias/${parteEmergenciaToDelete}`, {
                            preserveScroll: true,
                        });
                    }
                    setParteEmergenciaToDelete(null);
                }}
            />
        </AppLayout>
    );
}
