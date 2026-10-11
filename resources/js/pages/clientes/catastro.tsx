import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckIcon, HistoryIcon, Home, IdCard, Mail, MapPin, MoreHorizontalIcon, Phone, TriangleAlertIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import { money } from "@/utils/format";
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catastros',
        href: '/clientes/catastro',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface ComprobanteInfo {
    numero_formateado: string;
    fecha: string;
}

interface Catastro {
    id: number;
    clave_catastral: string;
    numero_predio: string;
    direccion: string;
    parroquia?: Parroquia;
    valor_propiedad: string;
    comprobante_info?: ComprobanteInfo | null;
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
    catastros: Catastro[];
    cliente: Cliente;
    filters: {
        search: string;
    };
}

export default function Show({catastros, cliente, filters}: Props) {

    const { flash, show } = useFlashAlert();

    const [catastroToDelete, setCatastroToDelete] = useState<number | null>(null);    

    const search = filters?.search ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catastros" />
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
                {catastros.length ? (
                    <div className="border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="w-40 py-2 px-4 text-left border-b">Clave Catastral</th>
                                        <th className="w-40 py-2 px-4 text-left border-b">Número predio </th>
                                        <th className="w-40 py-2 px-4 text-left border-b">Parroquia / Direccion</th>
                                        <th className="w-40 py-2 px-4 text-left border-b">Valor propiedad</th>
                                        <th className="w-40 py-2 px-4 text-left border-b">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {catastros.map((catastro) => (
                                        <tr className="odd:bg-muted/50 hover:bg-gray-50" key={catastro.id}>
                                            <td className="py-2 px-4 border-b">{catastro.clave_catastral}</td>
                                            <td className="py-2 px-4 border-b">{catastro.numero_predio}</td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        {catastro.parroquia?.nombre}
                                                    </span>
                                                    <span className="text-gray-900">
                                                        {catastro.direccion}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <span className="font-semibold text-slate-700">
                                                    {money(catastro.valor_propiedad)}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    USD
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {catastro.comprobante_info && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1">
                                                            <CheckIcon className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-gray-900">
                                                                {catastro.comprobante_info.numero_formateado}
                                                            </span>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                                {catastro.comprobante_info.fecha}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                            <AlertTitle>Este cliente no cuenta con catastros registrados</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Por favor agregue un nuevo catastro.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}   
            </div>

            <ConfirmDialog
                open={catastroToDelete !== null}
                onOpenChange={() => setCatastroToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El catastro será eliminada permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (catastroToDelete) {
                        router.delete(`/actividadeseconomicas/${catastroToDelete}`, {
                            preserveScroll: true,
                        });
                    }
                    setCatastroToDelete(null);
                }}
            />
        </AppLayout>
    )
}
