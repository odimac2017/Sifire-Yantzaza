import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { CheckCheckIcon, LifeBuoy, MapPinIcon, PlusIcon, SaveIcon, Trash2, TriangleAlertIcon, Undo2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MapPicker from '@/components/MapPicker';
import InputField from '@/components/form/InputField';
import axios from 'axios';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import DateField from '@/components/form/DateField';
import dayjs from 'dayjs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/form/RichTextEditor';
import { useDuracion } from "@/hooks/useDuracion";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear parte de emergencia',
        href: 'partesemergencias/create',
    },
];

interface Coordenada {
    latitud: number;
    longitud: number;
}

interface Categoria {
    id: number;
    principal: string;
    nombre: string;
}

interface Provincia {
    id: number;
    nombre: string;
}

interface Canton {
    id: number;
    nombre: string;
}

interface Parroquia {
    id: number;
    nombre: string;
}

interface Personal {
    id: number;
    nombre: string;
}

interface PersonalPuesto {
    id: number;
    nombre: string;
}

interface Props {
    coordenadas: Coordenada;
    categorias: Categoria[];
    provincias: Provincia[];
    personales: Personal[];
    personalesPuestos: PersonalPuesto[];
    numero: number;
    filters: {
        search: string;
        year: number;
    };
}

export default function Create({ coordenadas, categorias, provincias, personales, personalesPuestos, numero, filters }: Props) {

    const { data, setData, post, processing, errors } = useForm<{
        categoria_id: number;
        provincia_id: number;
        canton_id: number;
        parroquia_id: number;
        personal_puesto_oficial_id: number;
        numero: number;
        direccion: string;
        fecha_salida: string;
        fecha_llegada: string;
        nombre_propietario: string;
        tipo_cons_hormigon: boolean;
        tipo_cons_cana: boolean;
        tipo_cons_madera: boolean;
        tipo_cons_mixta: boolean;
        tipo_cons_metalica: boolean;
        tipo_cons_ladrillo: boolean;
        danos_materiales: string;
        victimas: string;
        cias_asisten: string;
        equipos_materiales: string;
        personal_externo: string;
        novedades: string;
        ver_geolocalizacion: number;
        latitud: number | null;
        longitud: number | null;
        personalesQap: number[];
        search: string;
        year: number;
    }>({
        categoria_id: 0,
        provincia_id: 0,
        canton_id: 0,
        parroquia_id: 0,
        personal_puesto_oficial_id: 0,
        numero: numero,
        direccion: '',
        fecha_salida: dayjs().format("YYYY-MM-DDTHH:mm"),
        fecha_llegada: dayjs().format("YYYY-MM-DDTHH:mm"),
        nombre_propietario: '',
        tipo_cons_hormigon: false,
        tipo_cons_cana: false,
        tipo_cons_madera: false,
        tipo_cons_mixta: false,
        tipo_cons_metalica: false,
        tipo_cons_ladrillo: false,
        danos_materiales: '',
        victimas: '',
        cias_asisten: '',
        equipos_materiales: '',
        personal_externo: '',
        novedades: '',
        ver_geolocalizacion: 1,
        latitud: coordenadas.latitud,
        longitud: coordenadas.longitud,
        personalesQap: [],
        search: filters?.search ?? '',
        year: filters.year ?? new Date().getFullYear(),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/partesemergencias');
    };

    const [cantones, setCantones] = useState<Canton[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);

    useEffect(() => {
        if (!data.provincia_id) {
            setCantones([]);
            setParroquias([]);
            return;
        }
    
        const controller = new AbortController();
    
        axios.get(`/cantones/obtenerCanton/${data.provincia_id}`, {
            signal: controller.signal
        })
        .then(res => setCantones(res.data))
        .catch(() => setCantones([]));
    
        return () => controller.abort();
    }, [data.provincia_id]);

    useEffect(() => {
        if (!data.canton_id) {
            setParroquias([]);
            return;
        }
    
        const controller = new AbortController();
    
        axios.get(`/parroquias/obtenerParroquia/${data.canton_id}`, {
            signal: controller.signal
        })
        .then(res => setParroquias(res.data))
        .catch(() => setParroquias([]));
    
        return () => controller.abort();
    }, [data.canton_id]);

    const duracionTexto = useDuracion(
        data.fecha_salida,
        data.fecha_llegada
    );

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada por este navegador.');
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
    
                setData('latitud', latitude);
                setData('longitud', longitude);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Permiso de ubicación denegado.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Ubicación no disponible.');
                        break;
                    case error.TIMEOUT:
                        alert('Tiempo de espera agotado.');
                        break;
                    default:
                        alert('Error al obtener la ubicación.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const [personalQapSeleccionado, setPersonalQapSeleccionado] = useState<number | null>(null);
    const [mensajePersonalQap, setMensajePersonalQap] = useState<{
        texto: string;
        tipo: "success" | "error";
    } | null>(null);

    const handleAgregarPersonalQap = () => {

        if (!personalQapSeleccionado) {
            setMensajePersonalQap({
                texto: "Debe seleccionar un personal para agregar",
                tipo: "error"
            });
            return;
        }
    
        if (data.personalesQap.includes(personalQapSeleccionado)) {
            setMensajePersonalQap({
                texto: "El personal ya fue agregado",
                tipo: "error"
            });
            return;
        }
    
        setData("personalesQap", [
            ...data.personalesQap,
            personalQapSeleccionado
        ]);
    
        setMensajePersonalQap({
            texto: "Personal agregado correctamente",
            tipo: "success"
        });
    
        setPersonalQapSeleccionado(null);
    };

    useEffect(() => {
        if (!mensajePersonalQap) return;

        const timer = setTimeout(() => {
            setMensajePersonalQap(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [mensajePersonalQap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear parte de emergencia" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">    
                    <div className="flex items-center justify-between">        
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <LifeBuoy className="w-8 h-8 text-gray-700" />
                            </div>
                            <h1 className="text-lg font-semibold leading-tight">
                                Registro oficial del incidente
                            </h1>
                        </div>
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                            <span className="text-xs opacity-80 mr-1">Parte de emergencia</span>
                            <span className="font-bold tracking-wider">#{numero}</span>
                        </div>
                    </div>
                </div>
                <Tabs defaultValue="parte" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="parte">Parte de emergencia</TabsTrigger>
                        <TabsTrigger value="geolocalizacion">Geolocalización</TabsTrigger>
                    </TabsList>
                    <TabsContent value="parte">
                        <Card>
                            <CardContent>
                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    <div className='grid w-full gap-3 items-start'>
                                        <SearchableSelectField
                                            label="Categoría"
                                            name="categoria_id"
                                            value={data.categoria_id}
                                            options={categorias ?? []}
                                            error={errors.categoria_id}
                                            onChange={(value) => setData("categoria_id", Number(value))}
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                        <div className="grid w-full gap-3">
                                            <DateField
                                                label="Fecha y hora de salida"
                                                value={data.fecha_salida}
                                                onChange={(value) => setData("fecha_salida", value)}
                                                error={errors.fecha_salida}
                                                disableFuture
                                                withTime
                                                maxDate={data.fecha_llegada}
                                            />
                                        </div>   
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Fecha y hora de llegada</span>
                                                {duracionTexto && (
                                                    <span className="text-xs text-muted-foreground font-semibold">
                                                        Tiempo de atención: {duracionTexto}
                                                    </span>
                                                )}
                                            </div>
                                            <DateField
                                                label=""
                                                value={data.fecha_llegada}
                                                onChange={(value) => setData("fecha_llegada", value)}
                                                error={errors.fecha_llegada}
                                                disableFuture
                                                withTime
                                                minDate={data.fecha_salida}
                                            />
                                        </div>
                                    </div>  
                                    <div className='grid w-full gap-3 items-start'>
                                        <InputField
                                            label="Nombre del propietario o arrendatario"
                                            name="nombre_propietario"
                                            value={data.nombre_propietario ?? ''}
                                            onChange={e => setData('nombre_propietario', e.target.value)}
                                            error={errors.nombre_propietario}
                                            placeholder="Nombre del propietario o arrendatario"
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <SearchableSelectField
                                                label="Provincia"
                                                name="provincia_id"
                                                value={data.provincia_id}
                                                options={provincias ?? []}
                                                error={errors.provincia_id}
                                                onChange={(value) => setData("provincia_id", Number(value))}
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <SearchableSelectField
                                                label="Cantón"
                                                name="canton_id"
                                                value={data.canton_id}
                                                options={cantones ?? []}
                                                error={errors.canton_id}
                                                onChange={(value) => setData("canton_id", Number(value))}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                        <div className="grid w-full gap-3">
                                            <SearchableSelectField
                                                label="Parroquia"
                                                name="parroquia_id"
                                                value={data.parroquia_id}
                                                options={parroquias ?? []}
                                                error={errors.parroquia_id}
                                                onChange={(value) => setData("parroquia_id", Number(value))}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <InputField
                                            label="Dirección"
                                            name="direccion"
                                            value={data.direccion ?? ''}
                                            onChange={e => setData('direccion', e.target.value)}
                                            error={errors.direccion}
                                            placeholder="Dirección"
                                        />
                                    </div>
                                    <Card className="rounded-xl shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-semibold leading-none">
                                                Tipo de Construcción
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="hormigon"
                                                    checked={data.tipo_cons_hormigon}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_hormigon', checked)
                                                    }
                                                />
                                                <Label htmlFor="hormigon">Hormigón</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="cana"
                                                    checked={data.tipo_cons_cana}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_cana', checked)
                                                    }
                                                />
                                                <Label htmlFor="cana">Caña</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="madera"
                                                    checked={data.tipo_cons_madera}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_madera', checked)
                                                    }
                                                />
                                                <Label htmlFor="madera">Madera</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="mixta"
                                                    checked={data.tipo_cons_mixta}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_mixta', checked)
                                                    }
                                                />
                                                <Label htmlFor="mixta">Mixta</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="metalica"
                                                    checked={data.tipo_cons_metalica}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_metalica', checked)
                                                    }
                                                />
                                                <Label htmlFor="metalica">Metálica</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="ladrillo"
                                                    checked={data.tipo_cons_ladrillo}
                                                    onCheckedChange={(checked) =>
                                                        setData('tipo_cons_ladrillo', checked)
                                                    }
                                                />
                                                <Label htmlFor="ladrillo">Ladrillo</Label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Daños materiales"
                                            value={data.danos_materiales}
                                            onChange={(value) => setData('danos_materiales', value)}
                                            error={errors.danos_materiales}
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Víctimas"
                                            value={data.victimas}
                                            onChange={(value) => setData('victimas', value)}
                                            error={errors.victimas}
                                        />
                                    </div>                                    
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Cia que asisten"
                                            value={data.cias_asisten}
                                            onChange={(value) => setData('cias_asisten', value)}
                                            error={errors.cias_asisten}
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Equipos y materiales que se utilizan"
                                            value={data.equipos_materiales}
                                            onChange={(value) => setData('equipos_materiales', value)}
                                            error={errors.equipos_materiales}
                                        />
                                    </div>
                                    <Card className="rounded-xl shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-semibold leading-none">
                                                Personal de QAP (Apoyo en emergencia)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="w-full">
                                                <div className="flex items-center gap-3">
                                                    <Label htmlFor="personalQap" className="whitespace-nowrap">
                                                        Personal
                                                    </Label>
                                                    <SearchableSelectField
                                                        name="personalQap"
                                                        value={personalQapSeleccionado ?? null}
                                                        options={personales}
                                                        onChange={(value) => setPersonalQapSeleccionado(value ? Number(value) : null)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="bg-slate-500 hover:bg-slate-700 h-9 cursor-pointer"
                                                        onClick={handleAgregarPersonalQap}
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                        Agregar
                                                    </Button>
                                                </div>
                                                {mensajePersonalQap && (
                                                    <Alert                                        
                                                        className={`mt-4 border-none w-full px-4 py-2
                                                        ${
                                                            mensajePersonalQap.tipo === "error"
                                                            ? "bg-red-500/10 text-red-600"
                                                            : "bg-green-500/10 text-green-600"
                                                        }
                                                        `}
                                                    >
                                                        {mensajePersonalQap.tipo === "error" ? (
                                                            <TriangleAlertIcon className="h-4 w-4" />
                                                        ) : (
                                                            <CheckCheckIcon className="h-4 w-4" />
                                                        )}
                                                        <AlertTitle>{mensajePersonalQap.texto}</AlertTitle>
                                                    </Alert>
                                                )}
                                            </div>
                                            {data.personalesQap.length ? (
                                                <div className="overflow-x-auto mt-4">
                                                    <table className="w-full border overflow-hidden rounded-md text-sm">
                                                        <thead>
                                                            <tr className="bg-muted">
                                                                <th className="py-2 px-4 text-left border-b w-[50px]">#</th>
                                                                <th className="py-2 px-4 text-left border-b w-[1000px]">Nombre</th>
                                                                <th className="py-2 px-4 text-left border-b w-[20px]"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.personalesQap.map((personalId, index) => {
                                                                const personalObj = personales?.find(p => p.id === personalId);
                                                                return (
                                                                    <tr className="odd:bg-muted/50 hover:bg-gray-50" key={personalId}>
                                                                        <td className="py-2 px-4 border-b">{index + 1}</td>
                                                                        <td className="py-2 px-4 border-b">{personalObj?.nombre ?? "No encontrado"}</td>
                                                                        <td className="py-2 px-4 border-b">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="destructive"
                                                                                className='cursor-pointer'
                                                                                onClick={() =>
                                                                                    setData(
                                                                                        "personalesQap",
                                                                                        data.personalesQap.filter(id => id !== personalId)
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center mt-6">
                                                    <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                                        <TriangleAlertIcon className="h-4 w-4" />
                                                        <AlertTitle>Este parte de emergencia no cuenta con personal QAP</AlertTitle>
                                                        <AlertDescription className="text-destructive/80">
                                                            Por favor agregue un nuevo personal.
                                                        </AlertDescription>
                                                    </Alert>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Personal externo (Apoyo en emergencia)"
                                            value={data.personal_externo}
                                            onChange={(value) => setData('personal_externo', value)}
                                            error={errors.personal_externo}
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <RichTextEditor
                                            label="Novedades registradas"
                                            value={data.novedades}
                                            onChange={(value) => setData('novedades', value)}
                                            error={errors.novedades}
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <SearchableSelectField
                                            label="Jefe de guardia"
                                            name="personal_puesto_oficial_id"
                                            value={data.personal_puesto_oficial_id}
                                            options={personalesPuestos ?? []}
                                            error={errors.personal_puesto_oficial_id}
                                            onChange={(value) => setData("personal_puesto_oficial_id", Number(value))}
                                        />
                                    </div>
                                    <div className="flex gap-2">                           
                                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear parte
                                        </Button>                    
                                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                            <Link 
                                                href='/partesemergencias' 
                                                data={{ search: data.search, year: data.year }}
                                            >
                                                <Undo2Icon /> Regresar
                                            </Link>
                                        </Button>
                                    </div> 
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="geolocalizacion">
                        <Card>
                            <CardContent className="space-y-4">                                                          
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                    <div className="grid w-full gap-3">
                                        <InputField
                                            label="Latitud"
                                            name="latitud"
                                            type='latitud'
                                            value={data.latitud ?? ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setData(
                                                    'latitud',
                                                    e.target.value === '' ? null : Number(e.target.value)
                                                )
                                            }
                                            error={errors.latitud}
                                            placeholder="Ej: -0.180653"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <InputField
                                            label="Longitud"
                                            name="longitud"
                                            type='longitud'
                                            value={data.longitud ?? ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setData(
                                                    'longitud',
                                                    e.target.value === '' ? null : Number(e.target.value)
                                                )
                                            }
                                            error={errors.longitud}
                                            placeholder="Ej: -78.467834"
                                        />
                                    </div>
                                </div>
                                <MapPicker
                                    lat={data.latitud}
                                    lng={data.longitud}
                                    onChange={(lat, lng) => {
                                        setData('latitud', lat);
                                        setData('longitud', lng);
                                    }}
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        Haz clic en el mapa para seleccionar la ubicación.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={getCurrentLocation}
                                        className="flex items-center gap-2"
                                    >
                                        <MapPinIcon size={16} />
                                        Usar mi ubicación actual
                                    </Button>      
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>                
            </div>
        </AppLayout>
    )
}
