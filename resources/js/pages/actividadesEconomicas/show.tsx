import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BuildingIcon, CarIcon, Home, IdCard, Mail, MapPin, Phone, Undo2Icon, User2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import InspeccionesHistory from "@/pages/inspecciones/InspeccionesHistory";
import PermisosHistory from "@/pages/permisosFuncionamientos/permisosHistory";
import NotificacionesHistory from "@/pages/notificaciones/notificacionesHistory";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial',
        href: '/actividadeseconomicas',
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
}

interface Inspeccion {
    id: number;
    nombre_personal: string;
    numero_formateado: string;
    fecha_inspeccion: string;
    valor_total: number;
    estado: string;
    proceso_permiso: {
        tipo_permiso: {
            tipo_inspeccion: {
                nombre: string;
            }
        }
    }
}

interface PermisoFuncionamiento {
    id: number;
    numero_formateado: string;
    fecha_expedicion: string;
    fecha_caducidad: string;
    valor_total: number;
    estado: string;
    proceso_permiso: {
        tipo_permiso: {            
            nombre: string;           
        }
    }
}

interface Notificacion {
    id: number;
    nombre_personal: string;
    numero_formateado: string;
    numero_notificacion: number;
    fecha_entrega: string;
    fecha_plazo: string;
    estado: string;
}

interface Props {
    actividadEconomica: ActividadEconomica;
    cliente: Cliente;
    inspecciones: Inspeccion[];
    permisosFuncionamientos: PermisoFuncionamiento[];
    notificaciones: Notificacion[];
    filters: {
        search: string;
    };
}

export default function Show({actividadEconomica, cliente, inspecciones, permisosFuncionamientos, notificaciones, filters}: Props) {

    const search = filters?.search ?? '';

    const ES_ESTABLECIMIENTO = actividadEconomica.tipo_actividad === "E";

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
                                <Link 
                                    href={`/clientes/${cliente.id}`}
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
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div>
                            {ES_ESTABLECIMIENTO ? (
                                <>  
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                            <BuildingIcon className="w-8 h-8 text-gray-700" />
                                        </div>
                                        <div className="w-full">
                                            <h1 className="text-lg font-semibold leading-tight">{actividadEconomica.e_nombre_comercial}</h1>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                {actividadEconomica.e_actividad_principal}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>  
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                            <CarIcon className="w-8 h-8 text-gray-700" />
                                        </div>
                                        <div className="w-full">
                                            <h1 className="text-lg font-semibold leading-tight">{actividadEconomica.v_placa}</h1>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                {actividadEconomica.v_marca} {actividadEconomica.v_tipo} {actividadEconomica.v_clase} {actividadEconomica.v_color}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>                        
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2 md:col-span-2">
                            <Home className="h-3.5 w-3.5" />
                            <span>Dirección:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.e_direccion}</span>
                        </div>                    
                        <div className="flex items-start gap-2 md:col-span-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.parroquia?.nombre}</span>
                        </div>                        
                    </div>
                </div>
                <Tabs defaultValue="inspecciones" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="inspecciones">
                            Inspecciones
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {inspecciones.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="permisos">
                            Permisos de funcionamiento
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {permisosFuncionamientos.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="notificaciones">
                            Notificaciones
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {notificaciones.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="inspecciones">
                        <Card>
                            <CardContent>
                                <InspeccionesHistory inspecciones={inspecciones} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="permisos">
                        <Card>
                            <CardContent>
                                <PermisosHistory permisosFuncionamientos={permisosFuncionamientos} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="notificaciones">
                        <Card>
                            <CardContent>
                                <NotificacionesHistory notificaciones={notificaciones} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
