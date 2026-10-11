import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BuildingIcon, CarIcon, Home, IdCard, Mail, MapPin, Phone, RefreshCcwIcon, SaveIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import InputField from '@/components/form/InputField';
import { money } from "@/utils/format";
import TextAreaField from '@/components/form/TextAreaField';
import DateField from '@/components/form/DateField';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar permiso de funcionamiento',
        href: '/permisosfuncionamientos/edit',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface Tarifario {
    id: number;
    nombre: string;
    parent_id?: number;
    parent?: Tarifario;
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
}

interface ProcesoPermiso {
    id: number;
    cliente_id: number;
    actividad_economica_id: number;
    cliente: Cliente;
    actividad_economica: ActividadEconomica;
    tarifario?: Tarifario;
}

interface PermisoFuncionamiento {
    id: number;
    proceso_permiso_id: number;
    numero_formateado: string;
    valor_inspeccion: number;
    valor_reinspeccion: number;
    valor_nota_credito: number;
    valor_multa: number;
    valor_total: number;
    fecha_expedicion: string;
    fecha_caducidad: string;
    fecha_deposito: string;
    documento_deposito: string;
    observaciones: string;
}

interface Props {
    procesoPermiso: ProcesoPermiso;
    permisoFuncionamiento: PermisoFuncionamiento;
    filters: {
        year: number | null;
        search: string;
        estado: string;
    };
}

export default function Edit({procesoPermiso, permisoFuncionamiento, filters}: Props) {

    const cliente = procesoPermiso.cliente;
    const actividadEconomica = procesoPermiso.actividad_economica;

    const ES_ESTABLECIMIENTO = procesoPermiso.actividad_economica.tipo_actividad === "E";

    const {data, setData, put, processing, errors} = useForm({
        proceso_permiso_id: permisoFuncionamiento.proceso_permiso_id,
        numero_formateado: permisoFuncionamiento.numero_formateado,
        valor_inspeccion: permisoFuncionamiento.valor_inspeccion,
        valor_reinspeccion: permisoFuncionamiento.valor_reinspeccion,
        valor_nota_credito: permisoFuncionamiento.valor_nota_credito,
        valor_multa: permisoFuncionamiento.valor_multa,
        valor_total: permisoFuncionamiento.valor_total,
        fecha_expedicion: permisoFuncionamiento.fecha_expedicion,
        fecha_caducidad: permisoFuncionamiento.fecha_caducidad,
        fecha_deposito: permisoFuncionamiento.fecha_deposito,
        documento_deposito: permisoFuncionamiento.documento_deposito,
        observaciones: permisoFuncionamiento.observaciones,
        search: filters?.search ?? '',
        year: filters.year ?? new Date().getFullYear(),
        estado: filters?.estado ?? '',
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/permisosfuncionamientos/${permisoFuncionamiento.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar permiso de funcionamiento" />
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
                                    href={`/permisosfuncionamientos`}
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
                <form onSubmit={handleUpdate} className='space-y-4'>
                    <div className="relative border rounded-md bg-background shadow-sm p-4 text-[13px]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                                <span className="text-xs opacity-80 mr-1">Período</span>
                                <span className="font-bold tracking-wider">{data.fecha_expedicion ? dayjs(data.fecha_expedicion).year() : ''}</span>
                            </div>
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                                <span className="text-xs opacity-80 mr-1">Permiso de funcionamiento</span>
                                <span className="font-bold tracking-wider">#{data.numero_formateado}</span>
                            </div>
                        </div>
                        <Card className="rounded-xl shadow-sm mb-4">
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Valor de la inspección técnica
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                                            {money(data.valor_inspeccion)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                            USD
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Valor de la reinspección técnica
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                                            +{money(data.valor_reinspeccion)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                            USD
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Valor por notas de crédito
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">
                                            -{money(data.valor_nota_credito)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                            USD
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Valor por multa
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                                            +{money(data.valor_multa)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">
                                            USD
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-base font-semibold">
                                    <span className="text-gray-600">
                                        Valor total
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-slate-700">
                                            {money(data.valor_total)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">
                                            USD
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 items-start'>                        
                            <div className="grid w-full gap-3">
                                <DateField
                                    label="Fecha de expedicion"
                                    value={data.fecha_expedicion}
                                    onChange={(value) => setData("fecha_expedicion", value)}
                                    error={errors.fecha_expedicion}
                                    maxDate={data.fecha_caducidad}
                                />
                            </div>  
                            <div className="grid w-full gap-3">
                                <DateField
                                    label="Fecha de caducidad"
                                    value={data.fecha_caducidad}
                                    onChange={(value) => setData("fecha_caducidad", value)}
                                    error={errors.fecha_caducidad}                                    
                                    minDate={data.fecha_expedicion}
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 items-start'>                        
                            <div className="grid w-full gap-3">
                                <DateField
                                    label="Fecha de depósito"
                                    value={data.fecha_deposito}
                                    onChange={(value) => setData("fecha_deposito", value)}
                                    error={errors.fecha_deposito}
                                    disableFuture
                                />
                            </div>  
                            <div className="grid w-full gap-3">
                                <InputField
                                    label="Documento de depósito"
                                    name="documento_deposito"
                                    value={data.documento_deposito}
                                    onChange={e => setData('documento_deposito', e.target.value)}
                                    error={errors.documento_deposito}
                                    placeholder="Documento de depósito"
                                />
                            </div>
                        </div>
                        <div className='grid w-full gap-3 items-start'> 
                            <TextAreaField
                                label="Observaciones"
                                name="observaciones"
                                value={data.observaciones}
                                maxLength={1000}
                                placeholder="Observaciones"
                                error={errors.observaciones}
                                onChange={value => setData('observaciones', value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar permiso
                        </Button>    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href={`/permisosfuncionamientos`}
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