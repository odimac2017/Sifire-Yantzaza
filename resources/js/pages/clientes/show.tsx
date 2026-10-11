import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BanIcon, Building2Icon, Car, HistoryIcon, Home, IdCard, Mail, MapPin, MoreHorizontalIcon, PencilIcon, Phone, PlusIcon, RotateCcwIcon, Trash2Icon, TriangleAlertIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Actividades económicas',
        href: '/clientes',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface ActividadEconomica {
    id: number;
    tipo_actividad: string;
    e_nombre_comercial: string;
    e_actividad_principal: string;
    parroquia?: Parroquia;
    e_direccion: string;
    v_placa: string;
    v_marca: string;
    v_tipo: string;
    v_clase: string;
    v_color: string;
    fecha_inicio: string;
    estado: string;    
    procesos_permisos_count: number;
}

interface Cliente {
    id: number,
    documento: string,
    nombre: string,
    parroquia?: Parroquia;
    direccion: string,
    telefonos: string,
    email: string,
}

interface Props {
    actividadesEconomicas: ActividadEconomica[];
    cliente: Cliente;
    filters: {
        search: string;
    };
}

export default function Show({actividadesEconomicas, cliente, filters}: Props) {

    const { flash, show } = useFlashAlert();

    const [actividadToCancel, setActividadToCancel] = useState<number | null>(null);

    const [actividadToActive, setActividadToActive] = useState<number | null>(null);

    const [actividadToDelete, setActividadToDelete] = useState<number | null>(null);    

    const search = filters?.search ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Actividades económicas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <User2Icon className="w-8 h-8 text-gray-700" />
                            </div>
                            <div className="w-full">
                                <h1 className="text-lg font-semibold leading-tight">{cliente.nombre}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                    <IdCard className="h-3.5 w-3.5" />
                                    <span>Documento:</span>
                                    <span className="font-medium text-foreground">{cliente.documento}</span>
                                </div>
                            </div>
                        </div>                        
                        <div className="md:col-span-2 flex gap-2 justify-end">
                            <Button asChild size="sm">
                                <Link 
                                    href={`/actividadeseconomicas/create/${cliente.id}`}
                                    data={{ search: search }}
                                >
                                    <PlusIcon /> Nuevo
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href="/clientes" 
                                    data={{ search: search }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>                             
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Home className="h-3.5 w-3.5" />
                        <span>Dirección:</span>
                        <span className="font-medium text-foreground">{cliente.direccion}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{cliente.parroquia?.nombre}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Teléfonos:</span>
                            <span className="font-medium text-foreground">{cliente.telefonos}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            <span>Email:</span>
                            <span className="font-medium text-foreground">{cliente.email}</span>
                        </div>
                    </div>
                </div>
                {actividadesEconomicas.length ? (
                    <div className="border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="py-2 px-4 text-left border-b">Nombre comercial</th>
                                        <th className="py-2 px-4 text-left border-b">Actividad principal</th>
                                        <th className="py-2 px-4 text-left border-b">Parroquia / Direccion</th>
                                        <th className="py-2 px-4 text-left border-b">Estado</th>
                                        <th className="py-2 px-4 text-left border-b"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actividadesEconomicas.map((actividad) => (
                                        <tr className="odd:bg-muted/50 hover:bg-gray-50" key={actividad.id}>
                                            <td className="py-2 px-4 border-b">
                                                {actividad.tipo_actividad === "E" ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">
                                                            {actividad.e_nombre_comercial}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Building2Icon className="w-5 h-5" />
                                                            Establecimiento
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">
                                                            {actividad.v_placa}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Car className="w-5 h-5" />
                                                            {actividad.v_marca}{" "}
                                                            {actividad.v_tipo}{" "}
                                                            {actividad.v_clase}{" "}
                                                            {actividad.v_color}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">{actividad.e_actividad_principal || 'SIN ACTIVIDAD PRINCIPAL'}</td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        {actividad.parroquia?.nombre}
                                                    </span>
                                                    <span className="text-gray-900">
                                                        {actividad.e_direccion}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <Badge
                                                    className={`border-none focus-visible:outline-none
                                                        ${actividad.estado === "ACTIVO"
                                                            ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                            : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                        }
                                                    `}
                                                >
                                                    {actividad.estado}
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
                                                            {actividad.estado !== 'INACTIVO' && (
                                                                <>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/actividadeseconomicas/${actividad.id}/edit`}
                                                                            data={{ search: search }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <PencilIcon className="h-4 w-4" />
                                                                            <span>Editar</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() => setActividadToCancel(actividad.id)}
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <BanIcon className="h-4 w-4" />
                                                                        <span>Inactivar</span>
                                                                    </DropdownMenuItem>
                                                                    {actividad.procesos_permisos_count === 0 && (
                                                                        <DropdownMenuItem
                                                                            variant="destructive"
                                                                            onClick={() => setActividadToDelete(actividad.id)}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Trash2Icon className="h-4 w-4" />
                                                                            Eliminar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </>
                                                            )}
                                                            {actividad.estado === 'INACTIVO' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => setActividadToActive(actividad.id)}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <RotateCcwIcon className="h-4 w-4" />
                                                                    <span>Reactivar</span>
                                                                </DropdownMenuItem>
                                                            )}                                                            
                                                            <DropdownMenuItem>
                                                                <Link
                                                                    href={`/actividadeseconomicas/${actividad.id}`}
                                                                    data={{ search: search }}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <HistoryIcon className="h-4 w-4" />
                                                                    <span>Historiales</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center my-6">
                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>Este cliente no cuenta con actividades económicas registradas</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Por favor agregue una nueva actividad.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}   
            </div>

            <ConfirmDialog
                open={actividadToCancel !== null}
                onOpenChange={() => setActividadToCancel(null)}
                title="¿Está seguro?"
                description="La actividad económica será inactivada."
                confirmText="Inactivar"
                cancelText="Cancelar"
                variant="cancel"
                onConfirm={() => {
                    if (actividadToCancel) {
                        router.patch(`/actividadeseconomicas/${actividadToCancel}/inactivar`, {
                            search: filters.search ?? '',
                        },
                        {
                            preserveScroll: true,
                        });
                    }
                    setActividadToCancel(null);
                }}
            />

            <ConfirmDialog
                open={actividadToActive !== null}
                onOpenChange={() => setActividadToActive(null)}
                title="¿Está seguro?"
                description="La actividad económica será reactivada."
                confirmText="Reactivar"
                cancelText="Cancelar"
                variant="active"
                onConfirm={() => {
                    if (actividadToActive) {
                        router.patch(`/actividadeseconomicas/${actividadToActive}/reactivar`, {
                            search: filters.search ?? '',
                        },
                        {
                            preserveScroll: true,
                        });
                    }
                    setActividadToActive(null);
                }}
            />

            <ConfirmDialog
                open={actividadToDelete !== null}
                onOpenChange={() => setActividadToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. La actividad económica será eliminada permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (actividadToDelete) {
                        router.delete(`/actividadeseconomicas/${actividadToDelete}`, {
                            data: {
                                search: filters.search ?? '',
                            },
                            preserveScroll: true,
                        });
                    }
                    setActividadToDelete(null);
                }}
            />
        </AppLayout>
    )
}
