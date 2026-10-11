import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Building2Icon, BuildingIcon, Calendar1Icon, CarIcon, FileText, Home, IdCard, Mail, MapPin, Phone, RefreshCcwIcon, SaveIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TextAreaField from '@/components/form/TextAreaField';
import DateField from '@/components/form/DateField';
import SelectField from '@/components/form/SelectField';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar solicitud de inspección',
        href: '/solicitudesinspecciones/edit',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface TipoPermiso {
    id: number;
    nombre: string;
}

interface Tarifario {
    id: number;
    codigo: string;
    nombre: string;
    categoria: string;
    parent_id?: number;
    parent?: Tarifario;
}

interface Personal {
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
    porcentaje_descuento: number,
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

interface ProcesoPermiso {
    id: number;
    cliente_id: number;
    actividad_economica_id: number;
    tipo_permiso_id: number;
    tarifario_id: number,
    actualizacion_planos: boolean,
    cliente: Cliente;
    actividad_economica: ActividadEconomica;
    tarifario?: Tarifario;
}

interface SolicitudInspeccion {
    id: number;
    proceso_permiso_id: number;
    personal_id: number;
    numero_formateado: string;
    fecha_solicitud: string;
    fecha_inspeccion: string;
    observaciones: string;
}

interface Props {
    tiposPermisos: TipoPermiso[];
    tarifarios: Tarifario[];
    personales: Personal[];
    procesoPermiso: ProcesoPermiso;
    solicitudInspeccion: SolicitudInspeccion;
    filters: {
        year: number | null;
        search: string;
        estado: string;
    };
}

export default function Create({tiposPermisos, tarifarios, personales, procesoPermiso, solicitudInspeccion, filters}: Props) {

    const cliente = procesoPermiso.cliente;
    const actividadEconomica = procesoPermiso.actividad_economica;

    const ES_ESTABLECIMIENTO = procesoPermiso.actividad_economica.tipo_actividad === "E";

    const { data, setData, put, processing, errors } = useForm<{
        cliente_id: number;
        actividad_economica_id: number;
        tipo_permiso_id: number | null;
        tarifario_id: number | null;
        actualizacion_planos: boolean;
        personal_id: number | null;
        numero_formateado: string;
        fecha_solicitud: string;
        fecha_inspeccion: string;
        observaciones: string | null;
        fecha_inicio: string | null;
        search: string;
        year: number;
        estado: string;
    }>({
        cliente_id: procesoPermiso.cliente_id,
        actividad_economica_id: procesoPermiso.actividad_economica_id,
        tipo_permiso_id: procesoPermiso.tipo_permiso_id,
        tarifario_id: procesoPermiso.tarifario_id,
        actualizacion_planos: procesoPermiso.actualizacion_planos,
        personal_id: solicitudInspeccion.personal_id,
        numero_formateado: solicitudInspeccion.numero_formateado,
        fecha_solicitud: solicitudInspeccion.fecha_solicitud,
        fecha_inspeccion: solicitudInspeccion.fecha_inspeccion,
        observaciones: solicitudInspeccion.observaciones,
        fecha_inicio: procesoPermiso.actividad_economica.fecha_inicio,
        search: filters?.search ?? '',
        year: filters.year ?? new Date().getFullYear(),
        estado: filters?.estado ?? '',
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/solicitudesinspecciones/${solicitudInspeccion.id}`);
    }

    const tarifariosWithIcon = tarifarios?.map(group => ({
        ...group,
        icon: <Building2Icon className="w-4 h-4 mr-1 text-gray-500" />
    }));

    const [inspectorSugerido, setInspectorSugerido] = useState<any>(null);

    const sugerirInspector = async (fecha: string) => {
        try {
    
            const response = await fetch(`/solicitudesinspecciones/sugerirInspector?fecha=${fecha}`);
    
            if (!response.ok) {
                throw new Error("Error en servidor");
            }
    
            const inspector = await response.json();
    
            if (inspector) {
                setData("personal_id", inspector.id);
                setInspectorSugerido(inspector);
            }
    
        } catch (error) {
            console.error("Error al sugerir inspector", error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar solicitud de inspección" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                       <div className="flex justify-between items-start border-b pb-2 mb-3">
                            <div className="flex items-start gap-3 w-full">
                                <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                    <User2Icon className="w-8 h-8 text-gray-700" />
                                </div>
                                <div className="w-full">
                                    <h1 className="text-lg font-semibold leading-tight">
                                        {cliente.nombre}
                                    </h1>

                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                        <IdCard className="h-3.5 w-3.5" />
                                        <span>Documento:</span>
                                        <span className="font-medium text-foreground">
                                            {cliente.documento}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Descuento</p>
                                <p className="text-lg font-semibold text-red-600">
                                    {cliente.porcentaje_descuento}%
                                </p>
                            </div>
                        </div>  
                        <div className="md:col-span-2 flex gap-2 justify-end">                            
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href={`/solicitudesinspecciones`}
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
                        <span className="text-xs opacity-80 mr-1">Solicitud de inspección</span>
                        <span className="font-bold tracking-wider">#{data.numero_formateado}</span>
                    </div>
                    <div className="flex items-start gap-3 pb-2">
                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                            <Calendar1Icon className="w-8 h-8 text-gray-700" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold leading-tight">Fecha de solicitud</h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date(data.fecha_solicitud).toLocaleString('es-EC', {
                                    dateStyle: 'long',
                                    timeStyle: 'short'
                                }).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                            <div className="grid w-full gap-3">
                                <DateField
                                    label="Fecha de inicio de actividades"
                                    value={data.fecha_inicio ?? undefined}
                                    onChange={(value) => setData("fecha_inicio", value)}
                                    error={errors.fecha_inicio}
                                    disableFuture                                
                                />
                            </div>
                            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-center">
                                    <div className="grid w-full gap-3">
                                        <SelectField
                                            label="Tipo de permiso a obtener"
                                            name="tipo_permiso_id"
                                            value={data.tipo_permiso_id}
                                            options={tiposPermisos}
                                            error={errors.tipo_permiso_id}
                                            uppercase={true}
                                            onChange={(value) => {
                                                const tipoPermisoId = value ? Number(value) : null;

                                                setData({
                                                    ...data,
                                                    tipo_permiso_id: tipoPermisoId,
                                                    actualizacion_planos:
                                                        tipoPermisoId === 4
                                                            ? data.actualizacion_planos
                                                            : false,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="flex min-h-[58px] items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="min-w-0">
                                            <Label
                                                htmlFor="actualizacion_planos"
                                                className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                            >
                                                Actualización de planos
                                            </Label>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {Number(data.tipo_permiso_id) === 4
                                                    ? "Activar si corresponde"
                                                    : "No disponible para este permiso"}
                                            </p>
                                        </div>
                                        <Switch
                                            id="actualizacion_planos"
                                            checked={Boolean(data.actualizacion_planos)}
                                            disabled={Number(data.tipo_permiso_id) !== 4}
                                            onCheckedChange={(checked) =>
                                                setData("actualizacion_planos", checked ? true : false)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid w-full gap-3 md:col-span-2">
                                <SearchableSelectField
                                    label="Tarifario"
                                    name="tarifario_id"
                                    value={data.tarifario_id}
                                    options={tarifariosWithIcon ?? []}
                                    error={errors.tarifario_id}
                                    onChange={(value) =>
                                        setData("tarifario_id", value ? Number(value) : null)
                                    }
                                />
                            </div>
                            <div className="grid w-full gap-3">
                                <DateField
                                    label="Fecha para inspección"
                                    value={data.fecha_inspeccion}
                                    onChange={(value) => {
                                        setData("fecha_inspeccion", value);
                                        sugerirInspector(value);
                                    }}
                                    error={errors.fecha_inspeccion}
                                    disablePast
                                />
                            </div>
                            <div className="grid w-full gap-3 items-start">
                                <SelectField
                                    label="Inspector asignado"
                                    name="personal_id"
                                    value={data.personal_id}
                                    options={personales}
                                    error={errors.personal_id}
                                    uppercase={true}
                                    onChange={(value) =>
                                        setData("personal_id", value ? Number(value) : null)
                                    }
                                />
                                {inspectorSugerido && (
                                    <p className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md mt-1 inline-block">
                                        {inspectorSugerido.total === 0 ? (
                                            <>
                                                Inspector sugerido: Sin inspecciones asignadas aún
                                            </>
                                        ) : (
                                            <>
                                                Inspector sugerido: 
                                                <span className="font-semibold"> {inspectorSugerido.nombre}</span>
                                                {" "}({inspectorSugerido.total}/{inspectorSugerido.limite} inspecciones)
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="grid w-full gap-3 md:col-span-2">
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
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar solicitud
                        </Button>                    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href='/solicitudesinspecciones' 
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