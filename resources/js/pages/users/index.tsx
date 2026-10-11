import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { MoreHorizontalIcon, PencilIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserAvatar from "@/components/user-avatar";
import { useEffect, useState } from 'react';
import dayjs from '@/lib/dayjs';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
    },
];

interface Role {
    nombre: string;
    color: string;
}

interface User {
    id: number,
    first_name: string;
    second_name?: string | null;
    first_surname: string;
    second_surname?: string | null;
    full_name_simplex: string;
    full_name: string;
    email: string,
    avatar?: string | null,    
    roles?: Role[];
    is_online?: boolean,
    last_login_at?: string | null
}

interface UserPagination {
    data: User[];
    links: LinkProps[];
}

interface FilterProps {
    search: string;
}

interface IndexProps {
    users: UserPagination;
    filters: FilterProps;
}

export default function Index({users, filters: initialFilters }: IndexProps) {

    const [now, setNow] = useState(Date.now());

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

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'users');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar usuario",
        },
    ];

    // Actualizar cada minuto para recalcular "Activo hace X"
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/users/create"
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
                {users.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b w-[10px]">Avatar</th>
                                            <th className="py-2 px-4 text-left border-b w-[200px]">Nombre</th>
                                            <th className="py-2 px-4 text-left border-b w-[100px]">Email</th>
                                            <th className="py-2 px-4 text-left border-b w-[100px]">Roles</th>
                                            <th className="py-2 px-4 text-left border-b w-[50px]">Actividad</th>
                                            <th className="py-2 px-4 text-left border-b w-[10px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={6}
                                            />
                                        ) : (
                                            users.data.map((user) => {
                                                const lastSeenText = user.is_online
                                                    ? 'Activo ahora'
                                                    : user.last_login_at
                                                    ? `Activo ${dayjs(user.last_login_at).from(dayjs(now))}`
                                                    : 'Nunca';
                                                return (
                                                    <tr className="odd:bg-muted/50 hover:bg-gray-50" key={user.id}>
                                                        <td className="py-2 px-4 border-b">
                                                            <UserAvatar
                                                                name={user.full_name_simplex}
                                                                avatar={user.avatar}
                                                                isOnline={user.is_online}
                                                                size="md"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            {user.full_name}
                                                        </td>
                                                        <td className="py-2 px-4 border-b">{user.email}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="space-y-1">
                                                                {user.roles?.length ? (
                                                                    user.roles.map((rol, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                                                                            style={{
                                                                                backgroundColor: rol.color,
                                                                                color: '#fff',
                                                                            }}
                                                                        >
                                                                            {rol.nombre}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        SIN ROL
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">{lastSeenText}</td>
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
                                                                                href={`/users/${user.id}/edit`}
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
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={users.links} />
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
