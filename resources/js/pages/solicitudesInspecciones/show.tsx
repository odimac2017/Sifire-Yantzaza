import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BuildingIcon, CalendarDays, CarIcon, ClipboardCheckIcon, ClipboardListIcon, DownloadIcon, EyeIcon, FileTextIcon, Home, IdCard, Mail, MapPin, Phone, Trash2Icon, TriangleAlertIcon, Undo2Icon, UploadIcon, User2Icon, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashAlert } from '@/hooks/useFlashAlert';
import { useEffect, useRef, useState } from 'react';
import FlashAlert from '@/components/FlashAlert';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SelectField from '@/components/form/SelectField';
import FileField from '@/components/form/FileField';
import ConfirmDialog from '@/components/form/ConfirmDialog';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitos',
        href: '/solicitudesinspecciones',
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
    id: number
    nombre: string
    parent_id?: number
    parent?: Tarifario
}

interface TipoInspeccionRequisito {
    id: number;
    nombre: string;
}

interface Requisito {
    id: number;
    tipo_inspeccion_requisito_id: number;
    requisito?: TipoInspeccionRequisito;
    nombre: string;
    ruta: string;
    tipo: string;
    size: number;
    created_at: string;
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
    cliente: Cliente;
    actividad_economica: ActividadEconomica;
    tipo_permiso: TipoPermiso;
    tarifario?: Tarifario;
    requisitos: Requisito[];
}

interface SolicitudInspeccion {
    id: number;
    numero_formateado: string;
    fecha_solicitud: string;
    fecha_inspeccion: string;
    nombre_personal: string;
    proceso_permiso: ProcesoPermiso;
}

interface RequisitoWithDeleting extends Requisito {
    deleting?: boolean;
}

interface Props {
    tiposInspeccionesRequisitos: TipoInspeccionRequisito[];
    solicitudInspeccion: SolicitudInspeccion;
    filters: {
        year: number | null;
        search: string;
        estado: string;
    };
}

export default function Show({solicitudInspeccion, tiposInspeccionesRequisitos, filters}: Props) {

    const cliente = solicitudInspeccion.proceso_permiso.cliente;
    const actividadEconomica = solicitudInspeccion.proceso_permiso.actividad_economica;
    const tipoPermiso = solicitudInspeccion.proceso_permiso.tipo_permiso;

    const ES_ESTABLECIMIENTO = solicitudInspeccion.proceso_permiso.actividad_economica.tipo_actividad === "E";
    
    const { data, setData, post, processing, errors } = useForm({
        tipo_inspeccion_requisito_id: 0,
        archivo: null as File | null,
    });

    const { flash, show } = useFlashAlert(); 
    
    const search = filters?.search ?? '';
    const year = filters.year ?? new Date().getFullYear();
    const estado = filters?.estado ?? '';

    const [archivoToDelete, setArchivoToDelete] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const [requisitos, setRequisitos] = useState<RequisitoWithDeleting[]>(
        solicitudInspeccion.proceso_permiso.requisitos.map(a => ({ ...a, deleting: false }))
    );

    useEffect(() => {
        setRequisitos(
            solicitudInspeccion.proceso_permiso.requisitos.map(a => ({
                ...a,
                deleting: false
            }))
        );
    }, [solicitudInspeccion.proceso_permiso.requisitos]);

    const pdfs = requisitos.filter(a => a.tipo === "pdf");

    const formatFileSize = (bytes: number) => {
        if (!bytes) return "0 KB";
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisitos" />
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
                                    <IdCard className="w-4 h-4" />
                                    <span>Documento:</span>
                                    <span className="font-medium text-foreground">{cliente.documento}</span>
                                </div>
                            </div>
                        </div>    
                        <div className="md:col-span-2 flex gap-2 justify-end">                            
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href={`/solicitudesinspecciones`}
                                    data={{ search: search, year: year, estado: estado }}
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
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <ClipboardListIcon className="w-8 h-8 text-gray-700" />
                            </div>
                            <div className="w-full">
                                <h1 className="text-lg font-semibold leading-tight">Solicitud de Inspección</h1>
                                <div className="flex items-center gap-2 mt-1 text-sm">
                                    <span className="text-muted-foreground">
                                        {solicitudInspeccion.proceso_permiso.tarifario?.parent?.nombre}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="font-semibold">
                                        {solicitudInspeccion.proceso_permiso.tarifario?.nombre}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>Fecha de solicitud:</span>
                            <span className="font-medium text-foreground">
                                {solicitudInspeccion.fecha_solicitud}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>Fecha para la inspección:</span>
                            <span className="font-medium text-foreground">
                                {solicitudInspeccion.fecha_inspeccion ?? 'No asignada'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User2Icon className="w-4 h-4" />
                            <span>Inspector:</span>
                            <span className="font-medium text-foreground">
                                {solicitudInspeccion.nombre_personal ?? 'No asignado'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="border-2 border-gray-300 focus-within:border-blue-500 rounded-md bg-background shadow-sm p-4 text-[13px] transition-all">
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <SelectField
                                    label="Requisito"
                                    name="requisito_id"
                                    value={data.tipo_inspeccion_requisito_id}
                                    options={tiposInspeccionesRequisitos ?? []}
                                    error={errors.tipo_inspeccion_requisito_id}
                                    onChange={(value) => setData("tipo_inspeccion_requisito_id", Number(value))}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-medium">Archivo</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <FileField
                                            name="archivo"
                                            accept=".pdf"
                                            error={errors.archivo}
                                            showError={false}
                                            onChange={(file) => setData('archivo', file)}
                                            ref={fileInputRef}
                                        />
                                    </div>
                                    <Button
                                        disabled={processing}
                                        type="button"
                                        className="cursor-pointer shrink-0"
                                        onClick={() =>
                                            post(`/procesospermisosrequisitos/${solicitudInspeccion.proceso_permiso.id}/requisitos`, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                                preserveState: true,
                                                only: ['solicitudInspeccion', 'flash'],
                                                onSuccess: () => {
                                                    setData('archivo', null);
                                                    setData('tipo_inspeccion_requisito_id', 0);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';                                                        
                                                    }
                                                },
                                            })
                                        }
                                    >
                                        {!processing && <UploadIcon />}
                                        {processing && <Spinner />}
                                        Subir
                                    </Button>
                                </div>
                                {errors.archivo && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.archivo}
                                    </p>
                                )}
                            </div>                          
                        </div>                        
                    </div>
                </div>
                <Card>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pdfs && pdfs.length ? (
                            <>
                                {pdfs.map((archivo) => (
                                    <div
                                        key={archivo.id}
                                        className={`
                                            group border rounded-xl p-4 shadow-sm hover:shadow-md transition
                                            ${archivo.deleting ? 'opacity-0 scale-95 h-0 p-0 m-0 overflow-hidden' : 'opacity-100 scale-100'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-lg bg-red-100">
                                                <FileTextIcon className="w-5 h-5 text-red-600" />
                                            </div>
                                            <button
                                                onClick={() => setArchivoToDelete(archivo.id)}
                                                className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg cursor-pointer"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium truncate mb-1">{archivo.requisito?.nombre}</p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            {formatFileSize(archivo.size)} • {dayjs(archivo.created_at).format("DD/MM/YYYY HH:mm")}
                                        </p>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/storage/${archivo.ruta}`}
                                                target="_blank"
                                                className="flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                                            >
                                                <EyeIcon className="w-4 h-4" /> Ver
                                            </a>
                                            <a
                                                href={`/storage/${archivo.ruta}`}
                                                download
                                                className="flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                            >
                                                <DownloadIcon className="w-4 h-4" /> Descargar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-center">
                                <Alert className="w-full sm:w-2/3 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                    <TriangleAlertIcon className="h-4 w-4" />
                                    <AlertTitle>
                                        La solicitud de inspección no cuenta con documentos PDF
                                    </AlertTitle>
                                    <AlertDescription className="text-destructive/80">
                                        Por favor agregue un nuevo documento.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={archivoToDelete !== null}
                onOpenChange={() => setArchivoToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El archivo será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (archivoToDelete) {
                        // marcar como eliminando para animación
                        setRequisitos(prev =>
                            prev.map(a =>
                                a.id === archivoToDelete ? { ...a, deleting: true } : a
                            )
                        );
                
                        // borrar del backend
                        router.delete(`/procesospermisosrequisitos/${archivoToDelete}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                // esperar la transición antes de remover del estado
                                setTimeout(() => {
                                    setRequisitos(prev => prev.filter(a => a.id !== archivoToDelete));
                                }, 300); // duración del fade out
                            },
                        });
                    }
                    setArchivoToDelete(null);
                }}
            />
        </AppLayout>
    );    
}
