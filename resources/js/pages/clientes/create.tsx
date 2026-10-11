import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SaveIcon, Undo2Icon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import SelectField from '@/components/form/SelectField';
import InputField from '@/components/form/InputField';
import NumberInput from '@/components/form/NumberInput';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear cliente',
        href: 'clientes/create',
    },
];

interface Documento {
    id: number;
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

interface TipoCliente {
    id: number;
    nombre: string;
}

interface Props {
    documentos: Documento[];
    provincias: Provincia[];
    tipoCliente: TipoCliente[];
    filters: {
        search: string;
    };
}

export default function Create({documentos, provincias, tipoCliente, filters}: Props) {   
     
    const { data, setData, post, processing, errors } = useForm<{
        tipo_cliente_id: number;
        documento_id: number;
        documento: string;
        nombre: string;
        documento_representante_legal: string;
        nombre_representante_legal: string;
        provincia_id: number;
        canton_id: number;
        parroquia_id: number;
        direccion: string;
        telefonos: string;
        email: string;
        archivo_fisico: string;
        porcentaje_descuento: number;
        search: string;
    }>({
        tipo_cliente_id: 0,
        documento_id: 0,        
        documento: '',
        nombre: '',
        documento_representante_legal: '',
        nombre_representante_legal: '',
        provincia_id: 0,
        canton_id: 0,
        parroquia_id: 0,
        direccion: '',
        telefonos: '',
        email: '',
        archivo_fisico: '',
        porcentaje_descuento: 0,
        search: filters?.search ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/clientes');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear cliente" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <SelectField
                                label="Tipo de cliente"
                                name="tipo_cliente_id"
                                value={data.tipo_cliente_id}
                                options={tipoCliente}
                                error={errors.tipo_cliente_id}
                                onChange={(value) => setData("tipo_cliente_id", Number(value))}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <SelectField
                                label="Tipo de documento"
                                name="documento_id"
                                value={data.documento_id}
                                options={documentos}
                                error={errors.documento_id}
                                onChange={(value) => setData("documento_id", Number(value))}
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <InputField
                                label="Documento"
                                name="documento"
                                value={data.documento}
                                onChange={e => setData('documento', e.target.value)}
                                error={errors.documento}
                                placeholder="Documento del cliente"
                            />
                        </div>
                    </div>
                    <div className='grid w-full gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Nombre o razón social"
                                name="nombre"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                placeholder="Nombre o razón social del cliente"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Documento del representante legal"
                                name="documento_representante_legal"
                                value={data.documento_representante_legal}
                                onChange={e => setData('documento_representante_legal', e.target.value)}
                                error={errors.documento_representante_legal}
                                placeholder="Documento del representante legal"
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
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
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <SearchableSelectField
                                label="Provincia"
                                name="provincia_id"
                                value={data.provincia_id}
                                options={provincias ?? []}
                                error={errors.provincia_id}
                                onChange={(value) => {
                                    setData("provincia_id", Number(value));
                                    setData("canton_id", 0);
                                    setData("parroquia_id", 0);
                                }}
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <SearchableSelectField
                                label="Cantón"
                                name="canton_id"
                                value={data.canton_id}
                                options={cantones ?? []}
                                error={errors.canton_id}
                                onChange={(value) => {
                                    setData("canton_id", Number(value));
                                    setData("parroquia_id", 0);
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
                            value={data.direccion}
                            onChange={e => setData('direccion', e.target.value)}
                            error={errors.direccion}
                            placeholder="Dirección del cliente"
                        />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Teléfonos"
                                name="telefonos"
                                value={data.telefonos}
                                onChange={e => setData('telefonos', e.target.value)}
                                error={errors.telefonos}
                                placeholder="Teléfonos del cliente"
                            />
                        </div>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Email"
                                name="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="Email del cliente"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Ubicación archivo físico (cajón-carpeta)"
                                name="archivo_fisico"
                                value={data.archivo_fisico}
                                onChange={e => setData('archivo_fisico', e.target.value)}
                                error={errors.archivo_fisico}
                                placeholder="Archivo físico del cliente"
                            />
                        </div>
                        <div className="grid w-full gap-3">
                            <NumberInput
                                label="Porcentaje de descuento"
                                name="porcentaje_descuento"
                                value={data.porcentaje_descuento}
                                onChange={(value) => setData('porcentaje_descuento', value)}
                                min={0}
                                max={100}
                                error={errors.porcentaje_descuento}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear cliente
                        </Button>                    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href="/clientes" 
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
