import InspeccionesHistory from "@/pages/inspecciones/InspeccionesHistory";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BlocksIcon, BuildingIcon, CarIcon, Home, IdCard, Mail, MapPin, Phone, TriangleAlertIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial',
        href: '/catastros',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
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

interface RecaudacionCatastro {
    id: number,
    numero: number,
    fecha: string,
    valor_total: number,
    estado: string,
}

interface Catastro {
    id: number;
    clave_catastral: string;
    numero_predio: string;
    direccion: string;
    parroquia?: Parroquia;
    valor_propiedad: string;
    recaudaciones_catastros?: RecaudacionCatastro[];
}

interface Props {
    catastro: Catastro;
    cliente: Cliente;    
    filters: {
        search: string;
    };
}

export default function Show({catastro, cliente, filters}: Props) {

    const search = filters?.search ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">                
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
                                <Link href={`/clientes/catastros/${cliente.id}`}>
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
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <BlocksIcon className="w-8 h-8 text-gray-700" />
                            </div>
                            <div className="w-full">
                                <h1 className="text-lg font-semibold leading-tight">{catastro.clave_catastral}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                    {catastro.numero_predio}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2 md:col-span-2">
                            <Home className="h-3.5 w-3.5" />
                            <span>Dirección:</span>
                            <span className="font-medium text-foreground">{catastro.direccion}</span>
                        </div>                    
                        <div className="flex items-start gap-2 md:col-span-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{catastro.parroquia?.nombre}</span>
                        </div>                        
                    </div>
                </div>
                {catastro.recaudaciones_catastros?.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border overflow-hidden rounded-md text-sm">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="py-2 px-4 text-left border-b">Número</th>
                                    <th className="py-2 px-4 text-left border-b">Fecha</th>
                                    <th className="py-2 px-4 text-left border-b">Valor total</th>
                                    <th className="py-2 px-4 text-left border-b">Estado</th>                                    
                                </tr>
                            </thead>
                            <tbody>
                                {catastro.recaudaciones_catastros?.map((recaudacion) => (
                                    <tr className="odd:bg-muted/50 hover:bg-gray-50" key={recaudacion.id}>
                                        <td className="bg-muted/75 hover:bg-transparent py-2 px-4 border-b">{recaudacion.numero}</td>
                                        <td className="py-2 px-4 border-b">{recaudacion.fecha}</td>
                                        <td className="py-2 px-4 border-b">{recaudacion.valor_total}</td>
                                        <td className="py-2 px-4 border-b">
                                            <Badge
                                                className={`border-none focus-visible:outline-none
                                                    ${recaudacion.estado === "EXPEDIDO"
                                                        ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                        : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                    }
                                                `}
                                            >
                                                {recaudacion.estado}
                                            </Badge>
                                        </td>                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>    
                ) : (
                    <div className="flex justify-center my-6">
                        <Alert className="w-full sm:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>
                                El catastro no tiene historial
                            </AlertTitle>
                        </Alert>
                    </div>
                )}   
            </div>
        </AppLayout>
    )
}
