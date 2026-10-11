import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, BellRing, BuildingIcon, Calendar1Icon, CarIcon, DownloadIcon, EyeIcon, Home, IdCard, ImageIcon, Mail, MapPin, Phone, Trash2Icon, TriangleAlertIcon, Undo2Icon, UploadIcon, User2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { useFlashAlert } from "@/hooks/useFlashAlert";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect, useRef, useState } from 'react';
import FileField from '@/components/form/FileField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import FlashAlert from '@/components/FlashAlert';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archivos',
        href: '/inspecciones/',
    },
];

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
}

interface Archivo {
    id: number;
    nombre: string;
    ruta: string;
    tipo: string;
    size: number;
    created_at: string;
}

interface Inspeccion {
    id: number;
    personal_id: number
    numero_formateado: string
    proceso_permiso: ProcesoPermiso;
    archivos: Archivo[],
}

interface ArchivoWithDeleting extends Archivo {
    deleting?: boolean;
}

interface Props {
    inspeccion: Inspeccion;  
    auth_personal_id: number;
    filters: {
        year: number;
        search: string;
        estado: string;
    };
}

export default function Show({inspeccion, auth_personal_id, filters}: Props) {

    const { flash, show } = useFlashAlert(); 

    const cliente = inspeccion.proceso_permiso.cliente;
    const actividadEconomica = inspeccion.proceso_permiso.actividad_economica;
    const ES_ESTABLECIMIENTO = inspeccion.proceso_permiso.actividad_economica.tipo_actividad === "E";

    const { data, setData, post, processing, errors } = useForm({
        archivo: null as File | null,
    });

    const search = filters?.search ?? '';
    const year = filters.year ?? new Date().getFullYear();
    const estado = filters.estado ?? '';    

    const [archivoToDelete, setArchivoToDelete] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    const [archivos, setArchivos] = useState<ArchivoWithDeleting[]>(
        inspeccion.archivos.map(a => ({ ...a, deleting: false }))
    );

    useEffect(() => {
        setArchivos(
            inspeccion.archivos.map(a => ({
                ...a,
                deleting: false
            }))
        );
    }, [inspeccion.archivos]);

    const imagenes = archivos.filter(a => a.tipo?.startsWith("imagen"));

    const formatFileSize = (bytes: number) => {
        if (!bytes) return "0 KB";
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archivos" />
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
                                    href={`/inspecciones`}
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
                <div className="relative border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="absolute top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                        <span className="text-xs opacity-80 mr-1">Informe de inspección</span>
                        <span className="font-bold tracking-wider">#{inspeccion.numero_formateado}</span>
                    </div>
                    <div className="flex items-start gap-3 pb-2">
                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                            <Calendar1Icon className="w-8 h-8 text-gray-700" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold leading-tight">Fecha de inspección</h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleString('es-EC', {
                                    dateStyle: 'long',
                                    timeStyle: 'short'
                                }).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
                {inspeccion.personal_id === auth_personal_id && (
                    <div className="border-2 border-gray-300 focus-within:border-blue-500 rounded-md bg-background shadow-sm p-4 text-[13px] transition-all">
                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div></div>
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-sm font-medium">Archivo</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <FileField
                                                name="archivo"
                                                accept=".jpg,.jpeg,.png,"
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
                                                post(`/inspeccionesarchivos/${inspeccion.id}/archivos`, {
                                                    forceFormData: true,
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                    only: ['inspeccion', 'flash'],
                                                    onSuccess: () => {
                                                        setData('archivo', null);
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
                            {preview && (
                                <div className="flex justify-center mt-8">
                                    <img
                                        src={preview}
                                        className="w-64 h-64 object-cover rounded-xl shadow-lg border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <Tabs defaultValue="fotografias" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="fotografias"><ImageIcon className="w-5 h-5 text-red-600" />
                            Fotografías
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {imagenes && imagenes.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="fotografias">
                        <Card>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {imagenes && imagenes.length ? (
                                    <>
                                        {imagenes.map((archivo) => (
                                            <div
                                                key={archivo.id}
                                                className={`
                                                    group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out
                                                    ${archivo.deleting ? 'opacity-0 scale-95 h-0 p-0 m-0 overflow-hidden' : 'opacity-100 scale-100'}
                                                `}
                                            >
                                                <img
                                                    src={`/storage/${archivo.ruta}`}
                                                    alt={archivo.nombre}
                                                    className="w-full h-56 object-cover group-hover:scale-105 transition"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-4">
                                                        <div className="flex justify-end">
                                                            {inspeccion.personal_id === auth_personal_id && (
                                                                <button
                                                                    onClick={() => setArchivoToDelete(archivo.id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg cursor-pointer"
                                                                >
                                                                    <Trash2Icon className="w-4 h-4" />
                                                                </button>
                                                                )}
                                                        </div>                                                    
                                                    <div>
                                                        <p className="text-white text-sm font-semibold truncate">{archivo.nombre}</p>
                                                        <p className="text-white/80 text-xs">
                                                            {formatFileSize(archivo.size)} • {dayjs(archivo.created_at).format("DD/MM/YYYY HH:mm")}
                                                        </p>
                                                        <div className="flex gap-2 mt-3">
                                                            <a
                                                                href={`/storage/${archivo.ruta}`}
                                                                target="_blank"
                                                                className="flex-1 flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-white text-black"
                                                            >
                                                                <EyeIcon className="w-4 h-4" /> Ver
                                                            </a>
                                                            <a
                                                                href={`/storage/${archivo.ruta}`}
                                                                download
                                                                className="flex-1 flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-600 text-white"
                                                            >
                                                                <DownloadIcon className="w-4 h-4" /> Descargar
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-center">
                                        <Alert className="w-full sm:w-2/3 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                            <TriangleAlertIcon className="h-4 w-4" />
                                            <AlertTitle>
                                                El informe de inspección no cuenta con fotografías
                                            </AlertTitle>
                                            <AlertDescription className="text-destructive/80">
                                                Por favor agregue una nueva fotografía.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
                        setArchivos(prev =>
                            prev.map(a =>
                                a.id === archivoToDelete ? { ...a, deleting: true } : a
                            )
                        );
                
                        // borrar del backend
                        router.delete(`/inspeccionesarchivos/${archivoToDelete}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                // esperar la transición antes de remover del estado
                                setTimeout(() => {
                                    setArchivos(prev => prev.filter(a => a.id !== archivoToDelete));
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