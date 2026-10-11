import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, BellRing, BuildingIcon, CarIcon, Home, IdCard, Mail, MapPin, Phone, SaveIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import InputField from '@/components/form/InputField';
import TextAreaField from '@/components/form/TextAreaField';
import SelectField from '@/components/form/SelectField';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear notificacion',
        href: '/notificaciones/create',
    },
];

interface Personal {
    id: number;
    nombre: string;
}

interface Parroquia {
    id: number;
    nombre: string;
}

interface Cliente {
    id: number,
    tipo_cliente_id: number,
    documento: string,
    nombre: string,
    parroquia?: Parroquia;
    direccion: string,
    telefonos: string,
    email: string,
    documento_representante_legal: string;
    nombre_representante_legal: string;
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
}

interface ProcesoPermiso {
    id: number;
    notificaciones_count: number;
    cliente: Cliente;
    actividad_economica: ActividadEconomica;
}

interface Props {
    procesoPermiso: ProcesoPermiso;  
    numero: string;
    personales: Personal[];
    filters: {
        year: number;
        search: string;
        estado: string;
    };
}

export default function Create({procesoPermiso, numero, personales, filters}: Props) {

    const cliente = procesoPermiso.cliente;
    const actividadEconomica = procesoPermiso.actividad_economica;
    const ES_ESTABLECIMIENTO = procesoPermiso.actividad_economica.tipo_actividad === "E";

    const { data, setData, post, processing, errors } = useForm<{
        proceso_permiso_id: number;
        personal_id: number | null;
        numero: string;
        numero_notificacion: number;
        documento_representante_legal: string;
        nombre_representante_legal: string;
        observaciones: string;
        search: string;
        year: number;
        estado: string;
    }>({
        proceso_permiso_id: procesoPermiso.id,
        personal_id: 0,
        numero: numero,
        numero_notificacion: procesoPermiso.notificaciones_count + 1,
        documento_representante_legal: procesoPermiso.cliente?.documento_representante_legal,
        nombre_representante_legal: procesoPermiso.cliente?.nombre_representante_legal,
        observaciones: '',       
        search: filters?.search ?? '',
        year: filters.year ?? new Date().getFullYear(),
        estado: filters?.estado ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/notificaciones');
    };

    const numeroNotificacion = data.numero_notificacion;

    const config = {
        1: {
            texto: "PRIMERA NOTIFICACIÓN",
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: <Bell className="h-5 w-5 text-amber-600" />
        },
        2: {
            texto: "SEGUNDA NOTIFICACIÓN",
            color: "text-orange-600",
            bg: "bg-orange-50",
            icon: <BellRing className="h-5 w-5 text-orange-600" />
        },
        3: {
            texto: "TERCERA NOTIFICACIÓN",
            color: "text-red-600",
            bg: "bg-red-50",
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />
        }
    };

    const estado = config[numeroNotificacion as 1 | 2 | 3];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear notificación" />
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
                                    <IdCard className="w-4 h-4" />
                                    <span>Documento:</span>
                                    <span className="font-medium text-foreground">{cliente.documento}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex gap-2 justify-end">                            
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href={`/notificaciones`}
                                    data={{ search: data.search, year: data.year, estado: data.estado }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>                             
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Home className="w-4 h-4" />
                        <span>Dirección:</span>
                        <span className="font-medium text-foreground">{cliente.direccion}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{cliente.parroquia?.nombre}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4" />
                            <span>Teléfonos:</span>
                            <span className="font-medium text-foreground">{cliente.telefonos}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4" />
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
                            <Home className="w-4 h-4" />
                            <span>Dirección:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.e_direccion}</span>
                        </div>                    
                        <div className="flex items-start gap-2 md:col-span-1">
                            <MapPin className="w-4 h-4" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.parroquia?.nombre}</span>
                        </div>
                    </div>
                </div>
                <div className="relative border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="absolute top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                        <span className="text-xs opacity-80 mr-1">Boleta</span>
                        <span className="font-bold tracking-wider">#{numero}</span>
                    </div>
                    <div className="flex items-center gap-3 pb-2">
                        {estado.icon}
                        <span className={`font-semibold tracking-wide ${estado.color}`}>
                            {estado.texto}
                        </span>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <Card className="rounded-xl shadow-sm">                        
                        <CardContent>
                            {procesoPermiso?.cliente?.tipo_cliente_id === 2 && (
                                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                                    <div className="grid gap-3">
                                        <InputField
                                            label="Documento del representante legal"
                                            name="documento_representante_legal"
                                            value={data.documento_representante_legal}
                                            onChange={e => setData('documento_representante_legal', e.target.value)}
                                            error={errors.documento_representante_legal}
                                            placeholder="Documento del representante legal"
                                        />
                                    </div>  
                                    <div className="grid gap-3">
                                        <InputField
                                            label="Nombre del representante legal"
                                            name="nombre_representante_legal"
                                            value={data.nombre_representante_legal}
                                            onChange={e => setData('nombre_representante_legal', e.target.value)}
                                            error={errors.nombre_representante_legal}
                                            placeholder="Nombre del representante legal"
                                        />
                                    </div> 
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 w-full mb-4">
                                <div className="grid gap-3">
                                    <SelectField
                                        label="Inspector asignado"
                                        name="personal_id"
                                        value={data.personal_id}
                                        options={personales}
                                        error={errors.personal_id}
                                        uppercase={true}
                                        onChange={(value) => setData("personal_id", Number(value) || null)}
                                    />
                                </div>
                            </div>
                            <div className='grid w-full gap-3 items-start'> 
                                <TextAreaField
                                    label="Observaciones"
                                    name="observaciones"
                                    value={data.observaciones}
                                    maxLength={300}
                                    placeholder="Observaciones"
                                    error={errors.observaciones}
                                    onChange={value => setData('observaciones', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear notificación
                        </Button>
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href={`/notificaciones`}
                                data={{ search: data.search, year: data.year, estado: data.estado }}
                            >
                                <Undo2Icon /> Regresar
                            </Link>
                        </Button>
                    </div> 
                </form>             
            </div>
        </AppLayout>
    );    
}
