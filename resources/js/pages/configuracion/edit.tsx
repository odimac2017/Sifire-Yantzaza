import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCcwIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import InputField from '@/components/form/InputField';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración',
        href: 'configuracion/1/edit',
    },
];

interface Configuracion {
    id: number,    
    plazo_reinspeccion: number,
    plazo_obtencion_permiso: number,
    plazo_primera_notificacion: number,
    plazo_segunda_notificacion: number,
    plazo_tercera_notificacion: number,
    porcentaje_reinspeccion: number,
    porcentaje_multas: number,
    porcentaje_planos: number,
    valor_duplicado_permisos: number,
    valor_certificados: number,
}

interface Props {
    configuracion: Configuracion;    
}

export default function Edit({ configuracion }: Props) {

    const { flash, show } = useFlashAlert();

    const { data, setData, put, processing, errors } = useForm({        
        plazo_reinspeccion: configuracion.plazo_reinspeccion,
        plazo_obtencion_permiso: configuracion.plazo_obtencion_permiso,
        plazo_primera_notificacion: configuracion.plazo_primera_notificacion,
        plazo_segunda_notificacion: configuracion.plazo_segunda_notificacion,
        plazo_tercera_notificacion: configuracion.plazo_tercera_notificacion,
        porcentaje_reinspeccion: configuracion.porcentaje_reinspeccion,
        porcentaje_multas: configuracion.porcentaje_multas,
        porcentaje_planos: configuracion.porcentaje_planos,
        valor_duplicado_permisos: configuracion.valor_duplicado_permisos,
        valor_certificados: configuracion.valor_certificados,
    });
    
    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/configuracion/${configuracion.id}`);
    }
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <Tabs defaultValue="plazos" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="plazos">Plazos</TabsTrigger>
                        <TabsTrigger value="porcentajes">Porcentajes</TabsTrigger>
                        <TabsTrigger value="valores">Valores</TabsTrigger>
                    </TabsList>
                    <TabsContent value="plazos">
                        <Card>
                            <CardContent>
                                <form onSubmit={handleUpdate} className='space-y-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                        <div className="grid w-full gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="plazo_reinspeccion">Plazo para realizar una reinspección</Label>
                                                <span className="text-muted-foreground text-sm">
                                                    {data.plazo_reinspeccion} días
                                                </span>
                                            </div>                                            
                                            <Slider
                                                    defaultValue={[data.plazo_reinspeccion]}
                                                    min={0}
                                                    max={30}
                                                    step={1}
                                                    className="w-full"
                                                    onValueChange={(value) => setData('plazo_reinspeccion', value[0])}
                                                />
                                            <InputError
                                                message={errors.plazo_reinspeccion}
                                            />
                                        </div>                                    
                                        <div className="grid w-full gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="plazo_obtencion_permiso">Plazo para que el cliente puede obtener el permiso de funcionamiento</Label>
                                                <span className="text-muted-foreground text-sm">
                                                    {data.plazo_obtencion_permiso} días
                                                </span>
                                            </div>
                                            <Slider
                                                defaultValue={[data.plazo_obtencion_permiso]}
                                                min={0}
                                                max={30}
                                                step={1}
                                                className="w-full"
                                                onValueChange={(value) => setData('plazo_obtencion_permiso', value[0])}
                                            />
                                            <InputError
                                                message={errors.plazo_obtencion_permiso}
                                            />
                                        </div>    
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>                            
                                        <div className="grid w-full gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="plazo_primera_notificacion">Plazo para emitir la primera notificación</Label>
                                                <span className="text-muted-foreground text-sm">
                                                    {data.plazo_primera_notificacion} días
                                                </span>
                                            </div>
                                            <Slider
                                                    defaultValue={[data.plazo_primera_notificacion]}
                                                    min={0}
                                                    max={30}
                                                    step={1}
                                                    className="w-full"
                                                    onValueChange={(value) => setData('plazo_primera_notificacion', value[0])}
                                                />
                                            <InputError
                                                message={errors.plazo_primera_notificacion}
                                            />
                                        </div>                                    
                                        <div className="grid w-full gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="plazo_segunda_notificacion">Plazo para emitir la segunda notificación</Label>
                                                <span className="text-muted-foreground text-sm">
                                                    {data.plazo_segunda_notificacion} días
                                                </span>
                                            </div>
                                            <Slider
                                                defaultValue={[data.plazo_segunda_notificacion]}
                                                min={0}
                                                max={30}
                                                step={1}
                                                className="w-full"
                                                onValueChange={(value) => setData('plazo_segunda_notificacion', value[0])}
                                            />
                                            <InputError
                                                message={errors.plazo_segunda_notificacion}
                                            />
                                        </div>    
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>                            
                                        <div className="grid w-full gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor="plazo_tercera_notificacion">Plazo para emitir la tercera notificación</Label>
                                                <span className="text-muted-foreground text-sm">
                                                    {data.plazo_tercera_notificacion} días
                                                </span>
                                            </div>
                                            <Slider
                                                defaultValue={[data.plazo_tercera_notificacion]}
                                                min={0}
                                                max={30}
                                                step={1}
                                                className="w-full"
                                                onValueChange={(value) => setData('plazo_tercera_notificacion', value[0])}
                                            />
                                            <InputError
                                                message={errors.plazo_tercera_notificacion}
                                            />
                                        </div>
                                    </div>
                                    <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                                        {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="porcentajes">
                        <Card>
                            <CardContent className="space-y-4">
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                    <div className="grid w-full gap-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label htmlFor="porcentaje_reinspeccion">Porcentaje para calcular el valor de reinspección</Label>
                                            <span className="text-muted-foreground text-sm">
                                                {data.porcentaje_reinspeccion} %
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[data.porcentaje_reinspeccion]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                            onValueChange={(value) => setData('porcentaje_reinspeccion', value[0])}
                                        />
                                        <InputError
                                            message={errors.porcentaje_reinspeccion}
                                        />
                                    </div>  
                                    <div className='grid w-full gap-3 items-start'> 
                                        <div className="flex items-center justify-between gap-2">
                                            <Label htmlFor="porcentaje_multas">Porcentaje para calcular el valor de multas</Label>
                                            <span className="text-muted-foreground text-sm">
                                                {data.porcentaje_multas} %
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[data.porcentaje_multas]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                            onValueChange={(value) => setData('porcentaje_multas', value[0])}
                                        />
                                        <InputError
                                            message={errors.porcentaje_multas}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                    <div className="grid w-full gap-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label htmlFor="porcentaje_planos">Porcentaje para calcular el valor de visto bueno de planos</Label>
                                            <span className="text-muted-foreground text-sm">
                                                {data.porcentaje_planos} %
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[data.porcentaje_planos]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                            onValueChange={(value) => setData('porcentaje_planos', value[0])}
                                        />
                                        <InputError
                                            message={errors.porcentaje_planos}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="valores">
                        <Card>
                            <CardContent className="space-y-4">
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                    <div className="grid w-full gap-3">
                                        <InputField
                                            label="Valor por duplicado de permiso de funcionamiento"
                                            name="valor_duplicado_permisos"
                                            type='valor_duplicado_permisos'
                                            value={data.valor_duplicado_permisos}
                                            onChange={e => setData('valor_duplicado_permisos',  Number(e.target.value))}
                                            error={errors.valor_duplicado_permisos}
                                            placeholder="Valor"
                                        />
                                    </div>
                                    <div className='grid w-full gap-3 items-start'> 
                                        <InputField
                                            label="Valor por emisión de certificados"
                                            name="valor_certificados"
                                            type='valor_certificados'
                                            value={data.valor_certificados}
                                            onChange={e => setData('valor_certificados',  Number(e.target.value))}
                                            error={errors.valor_certificados}
                                            placeholder="Valor"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>                    
                </Tabs>                
            </div>
        </AppLayout>
    )
}
