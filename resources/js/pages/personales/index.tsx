import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { MoreHorizontalIcon, PencilIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/user-avatar';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Personal',
        href: '/personales',
    },
];

interface Personal {
    id: number,
    documento: string,
    apellidos: string,
    nombres: string,
    fecha_nacimiento: string,
    direccion: string,
    telefonos: string,
    estado: string,
    full_name_simplex: string;
    avatar?: string | null,
    is_online?: boolean,
}

interface PersonalPagination {
    data: Personal[];
    links: LinkProps[];
}

interface FilterProps {
    search: string;
}

interface IndexProps {
    personales: PersonalPagination;    
    filters: FilterProps;
}

export default function Index({personales, filters: initialFilters }: IndexProps) {

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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'personales');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar personal",
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personal" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>   
                {personales.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Avatar</th>
                                            <th className="py-2 px-4 text-left border-b">Documento</th>
                                            <th className="py-2 px-4 text-left border-b">Nombre</th>
                                            <th className="py-2 px-4 text-left border-b">Fecha de nacimiento</th>
                                            <th className="py-2 px-4 text-left border-b">Dirección</th>
                                            <th className="py-2 px-4 text-left border-b">Teléfonos</th>
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
                                            personales.data.map((personal) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={personal.id}>
                                                    <td className="py-2 px-4 border-b">
                                                        <UserAvatar
                                                            name={personal.full_name_simplex}
                                                            avatar={personal.avatar}
                                                            isOnline={personal.is_online}
                                                            size="md"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{personal.documento}</span></td>
                                                    <td className="py-2 px-4 border-b">{personal.apellidos} {personal.nombres}</td>
                                                    <td className="py-2 px-4 border-b">{personal.fecha_nacimiento}</td>
                                                    <td className="py-2 px-4 border-b">{personal.direccion}</td>
                                                    <td className="py-2 px-4 border-b">{personal.telefonos}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${personal.estado === "ACTIVO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                            {personal.estado}
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
                                                                            href={`/personales/${personal.id}/edit`}
                                                                            data={{ search: filters.search }}
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
                            <Pagination links={personales.links} />
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