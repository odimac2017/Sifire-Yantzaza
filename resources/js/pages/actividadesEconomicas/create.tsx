import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BuildingIcon, CarIcon, MapPinIcon, SaveIcon, Undo2Icon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import InputField from '@/components/form/InputField';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import DateField from "@/components/form/DateField";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapPicker from '@/components/MapPicker';

interface Coordenada {
    latitud: number;
    longitud: number;
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

interface Props {
    coordenadas: Coordenada;
    provincias: Provincia[];
    clienteId: number;
    filters: {
        search: string;
    };
}

export default function Create({coordenadas, provincias, clienteId, filters}: Props) {   
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Crear actividad económica',
            href: `/actividadeseconomicas/create/${clienteId}`,
        },
    ];

    const { data, setData, post, processing, errors } = useForm<{
        cliente_id: number;
        provincia_id: number | null;
        canton_id: number | null;
        parroquia_id: number | null;
        tipo_actividad: string;
        e_nombre_comercial: string | null;
        e_actividad_principal: string | null;
        e_actividad_secundaria: string | null;
        e_sector: string | null;
        e_direccion: string | null;
        e_edificio: string | null;
        e_piso: string | null;
        e_departamento: string | null;
        e_telefonos: string | null;
        e_latitud: number | null;
        e_longitud: number | null;
        v_placa: string | null;
        v_marca: string | null;
        v_tipo: string | null;
        v_clase: string | null;
        v_color: string | null;
        fecha_inicio: string;
        search: string;
    }>({
        cliente_id: clienteId,
        provincia_id: null,
        canton_id: null,
        parroquia_id: null,
        tipo_actividad: 'E',
        e_nombre_comercial: null,
        e_actividad_principal: null,
        e_actividad_secundaria: null,
        e_sector: null,
        e_direccion: null,
        e_edificio: null,
        e_piso: null,
        e_departamento: null,
        e_telefonos: null,
        e_latitud: coordenadas.latitud,
        e_longitud: coordenadas.longitud,
        v_placa: null,
        v_marca: null,
        v_tipo: null,
        v_clase: null,
        v_color: null,
        fecha_inicio: new Date().toISOString().split('T')[0],
        search: filters?.search ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/actividadeseconomicas');
    };

    const [cantones, setCantones] = useState<Canton[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);

    useEffect(() => {
        if (!data.provincia_id) return;

        axios.get(`/cantones/obtenerCanton/${data.provincia_id}`)
            .then(res => setCantones(res.data))
            .catch(() => setCantones([]));
    }, [data.provincia_id]);
    
    useEffect(() => {
        if (!data.canton_id) return;
        
        axios.get(`/parroquias/obtenerParroquia/${data.canton_id}`)
            .then(res => setParroquias(res.data))
            .catch(() => setParroquias([]));
    }, [data.canton_id]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada por este navegador.');
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
    
                setData('e_latitud', latitude);
                setData('e_longitud', longitude);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear actividad económica" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <RadioGroup
                        value={data.tipo_actividad}
                        onValueChange={(value) => {
                            if (value === "E") {
                                // Limpia campos de vehículo
                                setData(prev => ({
                                    ...prev,
                                    tipo_actividad: value,
                                    v_placa: null,
                                    v_marca: null,
                                    v_tipo: null,
                                    v_clase: null,
                                    v_color: null,
                                }))
                            }
                            if (value === "V") {
                                // Limpia campos de establecimiento
                                setData(prev => ({
                                    ...prev,
                                    tipo_actividad: value,
                                    provincia_id: null,
                                    canton_id: null,
                                    parroquia_id: null,
                                    e_nombre_comercial: null,
                                    e_actividad_principal: null,
                                    e_actividad_secundaria: null,
                                    e_sector: null,
                                    e_direccion: null,
                                    e_edificio: null,
                                    e_piso: null,
                                    e_departamento: null,
                                    e_telefonos: null,
                                    e_latitud: coordenadas.latitud,
                                    e_longitud: coordenadas.longitud,
                                }))
                            }
                        }}
                        className="mx-auto grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-center gap-3 rounded-md border p-4 shadow-xs outline-none">
                            <RadioGroupItem
                                value="E"
                                id="tipo-1"
                                className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3 cursor-pointer"
                            />
                            <div className="grid justify-items-center gap-2">
                                <BuildingIcon />
                                <Label htmlFor="tipo-1">Establecimiento</Label>
                            </div>
                        </div>
                        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-center gap-3 rounded-md border p-4 shadow-xs outline-none">
                            <RadioGroupItem
                                value="V"
                                id="tipo-2"
                                className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3 cursor-pointer"
                            />
                            <div className="grid justify-items-center gap-2">
                                <CarIcon />
                                <Label htmlFor="tipo-2">Vehículo</Label>
                            </div>
                        </div>
                    </RadioGroup>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <SearchableSelectField
                                label="Provincia"
                                name="provincia_id"
                                value={data.provincia_id}
                                options={provincias}
                                error={errors.provincia_id}
                                onChange={(value) => {
                                    setData("provincia_id", value);
                                    setData("canton_id", null);
                                    setData("parroquia_id", null);
                                }}
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <SearchableSelectField
                                label="Cantón"
                                name="canton_id"
                                value={data.canton_id}
                                options={cantones}
                                error={errors.canton_id}
                                onChange={(value) => {
                                    setData("canton_id", value);
                                    setData("parroquia_id", null);
                                }}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                        <div className="grid w-full gap-3">
                            <SearchableSelectField
                                label="Parroquia"
                                name="parroquia_id"
                                value={data.parroquia_id}
                                options={parroquias}
                                error={errors.parroquia_id}
                                onChange={(value) => setData("parroquia_id", value)}
                            />
                        </div>                                          
                        <div className="grid w-full gap-3">
                            <DateField
                                label="Fecha de inicio de actividades"
                                value={data.fecha_inicio}
                                onChange={(value) => setData("fecha_inicio", value)}
                                error={errors.fecha_inicio}
                                disableFuture                                
                            />
                        </div> 
                    </div>
                    {data.tipo_actividad === "E" && (
                        <>
                            <div className='grid w-full gap-3 items-start'>
                                <InputField
                                    label="Nombre comercial"
                                    name="e_nombre_comercial"
                                    value={data.e_nombre_comercial ?? ''}
                                    onChange={e => setData('e_nombre_comercial', e.target.value)}
                                    error={errors.e_nombre_comercial}
                                    placeholder="Nombre comercial"
                                />
                            </div>
                            <div className='grid w-full gap-3 items-start'>
                                <InputField
                                    label="Actividad principal"
                                    name="e_actividad_principal"
                                    value={data.e_actividad_principal ?? ''}
                                    onChange={e => setData('e_actividad_principal', e.target.value)}
                                    error={errors.e_actividad_principal}
                                    placeholder="Actividad principal"
                                />
                            </div>
                            <div className='grid w-full gap-3 items-start'>
                                <InputField
                                    label="Actividad secundaria"
                                    name="e_actividad_secundaria"
                                    value={data.e_actividad_secundaria ?? ''}
                                    onChange={e => setData('e_actividad_secundaria', e.target.value)}
                                    error={errors.e_actividad_secundaria}
                                    placeholder="Actividad secundaria"
                                />
                            </div>
                            <div className='grid w-full gap-3 items-start'>
                                <InputField
                                    label="Sector"
                                    name="e_sector"
                                    value={data.e_sector ?? ''}
                                    onChange={e => setData('e_sector', e.target.value)}
                                    error={errors.e_sector}
                                    placeholder="Sector"
                                />
                            </div>
                            <div className='grid w-full gap-3 items-start'>
                                <InputField
                                    label="Dirección"
                                    name="e_direccion"
                                    value={data.e_direccion ?? ''}
                                    onChange={e => setData('e_direccion', e.target.value)}
                                    error={errors.e_direccion}
                                    placeholder="Dirección"
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                <div className="grid w-full gap-3">
                                    <InputField
                                        label="Edificio"
                                        name="e_edificio"
                                        value={data.e_edificio ?? ''}
                                        onChange={e => setData('e_edificio', e.target.value)}
                                        error={errors.e_edificio}
                                        placeholder="Edificio"
                                    />
                                </div>
                                <div className="grid w-full gap-3 items-start">
                                    <InputField
                                        label="Piso"
                                        name="e_piso"
                                        value={data.e_piso ?? ''}
                                        onChange={e => setData('e_piso', e.target.value)}
                                        error={errors.e_piso}
                                        placeholder="Piso"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                <div className="grid w-full gap-3">
                                    <InputField
                                        label="Departamento"
                                        name="e_departamento"
                                        value={data.e_departamento ?? ''}
                                        onChange={e => setData('e_departamento', e.target.value)}
                                        error={errors.e_departamento}
                                        placeholder="Departamento"
                                    />
                                </div>
                                <div className="grid w-full gap-3 items-start">
                                    <InputField
                                        label="Teléfonos"
                                        name="e_telefonos"
                                        value={data.e_telefonos ?? ''}
                                        onChange={e => setData('e_telefonos', e.target.value)}
                                        error={errors.e_telefonos}
                                        placeholder="Teléfonos"
                                    />
                                </div>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold leading-none">
                                        Geolocalización
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">                                                          
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <InputField
                                                label="Latitud"
                                                name="latitud"
                                                type='latitud'
                                                value={data.e_latitud ?? ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setData(
                                                        'e_latitud',
                                                        e.target.value === '' ? null : Number(e.target.value)
                                                    )
                                                }
                                                error={errors.e_latitud}
                                                placeholder="Ej: -0.180653"
                                            />
                                        </div>
                                        <div className='grid w-full gap-3 items-start'>
                                            <InputField
                                                label="Longitud"
                                                name="longitud"
                                                type='longitud'
                                                value={data.e_longitud ?? ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setData(
                                                        'e_longitud',
                                                        e.target.value === '' ? null : Number(e.target.value)
                                                    )
                                                }
                                                error={errors.e_longitud}
                                                placeholder="Ej: -78.467834"
                                            />
                                        </div>
                                    </div>
                                    <MapPicker
                                        lat={data.e_latitud}
                                        lng={data.e_longitud}
                                        onChange={(lat, lng) => {
                                            setData('e_latitud', lat);
                                            setData('e_longitud', lng);
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
                        </>
                    )}   
                    {data.tipo_actividad === "V" && (
                        <>              
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                <div className="grid w-full gap-3">
                                    <InputField
                                        label="Placa"
                                        name="v_placa"
                                        value={data.v_placa ?? ''}
                                        onChange={e => setData('v_placa', e.target.value)}
                                        error={errors.v_placa}
                                        placeholder="Placa del vehículo"
                                    />
                                </div>
                                <div className="grid w-full gap-3 items-start">
                                    <InputField
                                        label="Marca"
                                        name="v_marca"
                                        value={data.v_marca ?? ''}
                                        onChange={e => setData('v_marca', e.target.value)}
                                        error={errors.v_marca}
                                        placeholder="Marca del vehículo"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                <div className="grid w-full gap-3">
                                    <InputField
                                        label="Tipo"
                                        name="v_tipo"
                                        value={data.v_tipo ?? ''}
                                        onChange={e => setData('v_tipo', e.target.value)}
                                        error={errors.v_tipo}
                                        placeholder="Tipo de vehículo"
                                    />
                                </div>
                                <div className="grid w-full gap-3 items-start">
                                    <InputField
                                        label="Clase"
                                        name="v_clase"
                                        value={data.v_clase ?? ''}
                                        onChange={e => setData('v_clase', e.target.value)}
                                        error={errors.v_clase}
                                        placeholder="Clase de vehículo"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                <div className="grid w-full gap-3">
                                    <InputField
                                        label="Color"
                                        name="v_color"
                                        value={data.v_color ?? ''}
                                        onChange={e => setData('v_color', e.target.value)}
                                        error={errors.v_color}
                                        placeholder="Color de vehículo"
                                    />
                                </div>
                            </div>
                        </>
                    )}      
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear actividad
                        </Button>                    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href={`/clientes/${clienteId}`}
                                data={{ search: data.search }}
                            >
                                <Undo2Icon /> Regresar
                            </Link>
                        </Button>
                    </div>     
                </form>
            </div>
        </AppLayout>
    )
}
