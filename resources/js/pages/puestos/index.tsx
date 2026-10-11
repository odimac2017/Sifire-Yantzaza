import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
        title: 'Puestos',
        href: '/puestos',
    },
];

interface Puesto {
    id: number,
    nombre: string,
    lugar_trabajo: string,
    observaciones: string,
    estado: string,
}

interface PuestoPagination {
    data: Puesto[];
    links: LinkProps[];
}

interface FilterProps extends Record<string, any> {
    search: string;
}

interface IndexProps {
    puestos: PuestoPagination;    
    filters: FilterProps;
}

export default function Index({puestos, filters: initialFilters}: IndexProps) {

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

    const [puestoToDelete, setPuestoToDelete] = useState<number | null>(null);

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'puestos');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar",
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Puestos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/puestos/create"
                                data={{ search: filters.search }}
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
                {puestos.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Nombre</th>
                                            <th className="py-2 px-4 text-left border-b">Lugar de trabajo</th>
                                            <th className="py-2 px-4 text-left border-b">Observaciones</th>
                                            <th className="py-2 px-4 text-left border-b">Estado</th>
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
                                            puestos.data.map((puesto) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={puesto.id}>
                                                    <td className="py-2 px-4 border-b">{puesto.nombre}</td>
                                                    <td className="py-2 px-4 border-b">{puesto.lugar_trabajo}</td>
                                                    <td className="py-2 px-4 border-b">{puesto.observaciones}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${puesto.estado === "ACTIVO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                        {puesto.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
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
                                                                            href={`/puestos/${puesto.id}/edit`}                                                                    
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <PencilIcon className="h-4 w-4" />
                                                                            <span>Editar</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() => setPuestoToDelete(puesto.id)}
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                        Eliminar
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
                            <Pagination links={puestos.links} />
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
                open={puestoToDelete !== null}
                onOpenChange={() => setPuestoToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El puesto será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="delete"
                onConfirm={() => {
                    if (puestoToDelete) {
                        router.delete(`/puestos/${puestoToDelete}`, { preserveScroll: true });
                        setPuestoToDelete(null);
                    }
                }}
            />
        </AppLayout>
    );
}