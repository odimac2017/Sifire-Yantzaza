import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, DownloadIcon, EyeIcon, FileTextIcon, FlagIcon, ImageIcon, MapPin, Trash2Icon, TriangleAlertIcon, Undo2Icon, UploadIcon, User2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FileField from '@/components/form/FileField';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archivos',
        href: '/partesemergencias/',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface Archivo {
    id: number;
    nombre: string;
    ruta: string;
    tipo: string;
    size: number;
    created_at: string;
}

interface ParteEmergencia {
    id: number,
    personal_id: number,
    numero: string,
    categoria1: string,
    categoria2: string;
    parroquia?: Parroquia;
    direccion: string,
    latitud: string,
    longitud: string;
    fecha_salida: string,
    nombre_personal: string,
    archivos: Archivo[],
}

interface ArchivoWithDeleting extends Archivo {
    deleting?: boolean;
}

interface Props {    
    parteEmergencia: ParteEmergencia;
    auth_personal_id: number;
    filters: {
        year: number;
        search: string;
    };
}

export default function Show({parteEmergencia, auth_personal_id, filters}: Props) {    

    const { flash, show } = useFlashAlert(); 
    
    const { data, setData, post, processing, errors } = useForm({
        archivo: null as File | null,
    });

    const search = filters?.search ?? '';
    const year = filters.year ?? new Date().getFullYear();

    const [archivoToDelete, setArchivoToDelete] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    const [archivos, setArchivos] = useState<ArchivoWithDeleting[]>(
        parteEmergencia.archivos.map(a => ({ ...a, deleting: false }))
    );

    useEffect(() => {
        setArchivos(
            parteEmergencia.archivos.map(a => ({
                ...a,
                deleting: false
            }))
        );
    }, [parteEmergencia.archivos]);

    const imagenes = archivos.filter(a => a.tipo?.startsWith("imagen"));
    const pdfs = archivos.filter(a => a.tipo === "pdf");

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
                        <div>
                            <h1 className="text-lg font-semibold leading-tight">{parteEmergencia.categoria1}</h1>
                            <div className="flex items-center gap-2 font-medium text-foreground mt-1">{parteEmergencia.categoria2}</div>
                        </div>
                        <div className="md:col-span-2 flex gap-2 justify-end">
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href="/partesemergencias" 
                                    data={{ search: search, year: year }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>                             
                        </div>
                    </div>                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2">
                            <FlagIcon className="h-3.5 w-3.5" />
                            <span>Número:</span>
                            <span className="font-medium text-foreground">{parteEmergencia.numero}</span>
                        </div> 
                        <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Parroquia / Dirección:</span>
                            <span className="font-medium text-foreground">{parteEmergencia.parroquia?.nombre} / {parteEmergencia.direccion}</span>
                        </div>                        
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            <span>Fecha de salida:</span>
                            <span className="font-medium text-foreground">{dayjs.utc(parteEmergencia.fecha_salida).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <User2Icon className="h-3.5 w-3.5" />
                            <span>Personal responsable:</span>
                            <span className="font-medium text-foreground">{parteEmergencia.nombre_personal}</span>
                        </div>
                    </div>
                </div>
                {parteEmergencia.personal_id === auth_personal_id && (
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
                                                accept=".jpg,.jpeg,.png,.pdf"
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
                                                post(`/partesemergenciasarchivos/${parteEmergencia.id}/archivos`, {
                                                    forceFormData: true,
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                    only: ['parteEmergencia', 'flash'],
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
                        <TabsTrigger value="documentos"><FileTextIcon className="w-5 h-5 text-red-600" /> 
                            Documentos PDF
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {pdfs && pdfs.length}
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
                                                            {parteEmergencia.personal_id === auth_personal_id && (
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
                                                El parte de emergencia no cuenta con fotografías
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
                    <TabsContent value="documentos">
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
                                                    {parteEmergencia.personal_id === auth_personal_id && (
                                                        <button
                                                            onClick={() => setArchivoToDelete(archivo.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg cursor-pointer"
                                                        >
                                                            <Trash2Icon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>                                                
                                                <p className="text-sm font-medium truncate mb-1">{archivo.nombre}</p>
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
                                                El parte de emergencia no cuenta con documentos PDF
                                            </AlertTitle>
                                            <AlertDescription className="text-destructive/80">
                                                Por favor agregue un nuevo documento.
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
                        router.delete(`/partesemergenciasarchivos/${archivoToDelete}`, {
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
    )
}
