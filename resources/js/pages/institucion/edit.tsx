import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { MapPinIcon, RefreshCcwIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MapPicker from '@/components/MapPicker';
import InputField from '@/components/form/InputField';
import TextAreaField from '@/components/form/TextAreaField';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Institución',
        href: 'institucion/1/edit',
    },
];

interface Institucion {
    id: number,
    ruc: string,
    razon_social: string,
    ubicacion: string,
    direccion: string,
    telefonos: string,
    pagina_web: string,
    email: string,
    mision_institucional: string,
    vision_institucional: string,
    slogan: string,   
    latitud: number | null,
    longitud: number | null,
}

interface Props {
    institucion: Institucion;    
}

export default function Edit({ institucion }: Props) {

    const { flash, show } = useFlashAlert();

    const { data, setData, put, processing, errors } = useForm({
        ruc: institucion.ruc,
        razon_social: institucion.razon_social,
        ubicacion: institucion.ubicacion,
        direccion: institucion.direccion,
        telefonos: institucion.telefonos,
        pagina_web: institucion.pagina_web,
        email: institucion.email,
        mision_institucional: institucion.mision_institucional,
        vision_institucional: institucion.vision_institucional,
        slogan: institucion.slogan,
        latitud: institucion.latitud,
        longitud: institucion.longitud,
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/institucion/${institucion.id}`);
    }

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Institución" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <Tabs defaultValue="generales" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="generales">Datos generales</TabsTrigger>
                        <TabsTrigger value="geolocalizacion">Geolocalización</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generales">
                        <Card>
                            <CardContent>
                                <form onSubmit={handleUpdate} className='space-y-4'>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <InputField
                                            label="RUC"
                                            name="ruc"
                                            type='ruc'
                                            value={data.ruc}
                                            onChange={e => setData('ruc', e.target.value)}
                                            error={errors.ruc}
                                            placeholder="RUC"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'>
                                        <InputField
                                            label="Razón social"
                                            name="razon_social"
                                            type='razon_social'
                                            value={data.razon_social}
                                            onChange={e => setData('razon_social', e.target.value)}
                                            error={errors.razon_social}
                                            placeholder="Razón social"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <InputField
                                            label="Ubicación"
                                            name="ubicacion"
                                            type='ubicacion'
                                            value={data.ubicacion}
                                            onChange={e => setData('ubicacion', e.target.value)}
                                            error={errors.ubicacion}
                                            placeholder="Provincia / Cantón / Parroquia"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <InputField
                                            label="Dirección"
                                            name="direccion"
                                            type='direccion'
                                            value={data.direccion}
                                            onChange={e => setData('direccion', e.target.value)}
                                            error={errors.direccion}
                                            placeholder="Dirección"
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <InputField
                                                label="Teléfonos"
                                                name="telefonos"
                                                type='telefonos'
                                                value={data.telefonos}
                                                onChange={e => setData('telefonos', e.target.value)}
                                                error={errors.telefonos}
                                                placeholder="Teléfonos"
                                            />
                                        </div>
                                        <div className='grid w-full gap-3 items-start'> 
                                            <InputField
                                                label="Email"
                                                name="email"
                                                type='email'
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                error={errors.email}
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <InputField
                                            label="Slogan"
                                            name="slogan"
                                            type='slogan'
                                            value={data.slogan}
                                            onChange={e => setData('slogan', e.target.value)}
                                            error={errors.slogan}
                                            placeholder="Slogan"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <TextAreaField
                                            label="Misión institucional"
                                            name="mision_institucional"
                                            value={data.mision_institucional}
                                            maxLength={1000}
                                            placeholder="Misión institucional"
                                            error={errors.mision_institucional}
                                            onChange={value => setData('mision_institucional', value)}
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <TextAreaField
                                            label="Visión institucional"
                                            name="vision_institucional"
                                            value={data.vision_institucional}
                                            maxLength={1000}
                                            placeholder="Visión institucional"
                                            error={errors.vision_institucional}
                                            onChange={value => setData('vision_institucional', value)}
                                        />
                                    </div>
                                    <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                                        {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar
                                    </Button>
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
