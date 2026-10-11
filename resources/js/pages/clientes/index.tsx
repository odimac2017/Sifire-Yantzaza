import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { BanIcon, BlocksIcon, Building2Icon, MoreHorizontalIcon, PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clientes',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface Cliente {
    id: number;
    documento: string;
    nombre: string;
    parroquia?: Parroquia;
    direccion: string;
    telefonos: string;
    archivo_fisico: string;
    estado: string;
    actividades_economicas_count: number;
    catastros_count: number;
}

interface ClientePagination {
    data: Cliente[];
    links: LinkProps[];
}

interface FilterProps {
    search?: string;
}

interface IndexProps {
    clientes: ClientePagination;    
    filters: FilterProps;
}

export default function Index({ clientes, filters: initialFilters }: IndexProps) {

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

    const [clienteToCancel, setClienteToCancel] = useState<number | null>(null);

    const [clienteToActive, setClienteToActive] = useState<number | null>(null);

    const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'clientes');

    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar cliente",
        },
    ];

    return ( 
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/clientes/create"
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
                {clientes.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Documento</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Parroquia</th>
                                            <th className="py-2 px-4 text-left border-b">Dirección</th>
                                            <th className="py-2 px-4 text-left border-b">Teléfonos</th>
                                            <th className="py-2 px-4 text-left border-b">Archivo</th>

                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={2}
                                                columns={7}
                                            />
                                        ) : (
                                            clientes.data.map((cliente) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={cliente.id}>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{cliente.documento}</span></td>
                                                    <td className="py-2 px-4 border-b">{cliente.nombre}</td>
                                                    <td className="py-2 px-4 border-b">{cliente.parroquia?.nombre}</td>
                                                    <td className="py-2 px-4 border-b">{cliente.direccion}</td>
                                                    <td className="py-2 px-4 border-b">{cliente.telefonos}</td>
                                                    <td className="py-2 px-4 border-b">{cliente.archivo_fisico}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${cliente.estado === "ACTIVO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                            {cliente.estado}
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
                                                                    {cliente.estado !== 'INACTIVO' && (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link
                                                                                    href={`/clientes/${cliente.id}/edit`}
                                                                                    data={{ search: filters.search }}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <PencilIcon className="h-4 w-4" />
                                                                                    <span>Editar</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => setClienteToCancel(cliente.id)}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <BanIcon className="h-4 w-4" />
                                                                                <span>Inactivar</span>
                                                                            </DropdownMenuItem>
                                                                            {cliente.actividades_economicas_count === 0 && cliente.catastros_count === 0 && (
                                                                                <DropdownMenuItem
                                                                                    variant="destructive"
                                                                                    onClick={() => setClienteToDelete(cliente.id)}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <Trash2Icon className="h-4 w-4" />
                                                                                    Eliminar
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {cliente.estado === 'INACTIVO' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => setClienteToActive(cliente.id)}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <RotateCcwIcon className="h-4 w-4" />
                                                                            <span>Reactivar</span>
                                                                        </DropdownMenuItem>
                                                                    )}  
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/clientes/${cliente.id}`}
                                                                            data={{ search: filters.search }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Building2Icon className="h-4 w-4" />
                                                                            <span>Actividades</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/clientes/catastros/${cliente.id}`}
                                                                            data={{ search: filters.search }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <BlocksIcon className="h-4 w-4" />
                                                                            <span>Catastros</span>
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
                            <Pagination links={clientes.links} />
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
                open={clienteToCancel !== null}
                onOpenChange={() => setClienteToCancel(null)}
                title="¿Está seguro?"
                description="El cliente será inactivado."
                confirmText="Inactivar"
                cancelText="Cancelar"
                variant="cancel"
                onConfirm={() => {
                    if (clienteToCancel) {
                        router.patch(`/clientes/${clienteToCancel}/inactivar`, {
                            search: filters.search ?? '',
                        },
                        {
                            preserveScroll: true,
                        });
                    }
                    setClienteToCancel(null);
                }}
            />

            <ConfirmDialog
                open={clienteToActive !== null}
                onOpenChange={() => setClienteToActive(null)}
                title="¿Está seguro?"
                description="El cliente será reactivado."
                confirmText="Reactivar"
                cancelText="Cancelar"
                variant="active"
                onConfirm={() => {
                    if (clienteToActive) {
                        router.patch(`/clientes/${clienteToActive}/reactivar`, {
                            search: filters.search ?? '',
                        },
                        {
                            preserveScroll: true,
                        });
                    }
                    setClienteToActive(null);
                }}
            />

            <ConfirmDialog
                open={clienteToDelete !== null}
                onOpenChange={() => setClienteToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El cliente será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="delete"
                onConfirm={() => {
                    if (clienteToDelete) {
                        router.delete(`/clientes/${clienteToDelete}`, {
                            data: {
                                search: filters.search ?? '',
                            },
                            preserveScroll: true,
                        });
                    }
                    setClienteToDelete(null);
                }}
            />
        </AppLayout>
    );
}
