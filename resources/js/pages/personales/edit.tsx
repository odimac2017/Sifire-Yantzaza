import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';
import { CheckCheckIcon, PlusIcon, RefreshCcwIcon, TriangleAlertIcon, Undo2Icon } from 'lucide-react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import SelectField from '@/components/form/SelectField';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import InputField from '@/components/form/InputField';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar personal',
        href: 'personales/edit',
    },
];

interface Titulo {
    id: number;
    nombre: string;
}

interface Documento {
    id: number;
    nombre: string;
}

interface Genero {
    id: number;
    nombre: string;
}

interface GrupoSanguineo {
    id: number;
    nombre: string;
}

interface EstadoCivil {
    id: number;
    nombre: string;
}

interface Etnia {
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

interface Puesto {
    id: number;
    nombre: string;
}

interface PuestoAsignado {
    id: number;
    nombre: string;
    predeterminado: boolean;
    estado: string;
}

interface Personal {
    id: number,
    documento_id: number | null,
    titulo_id: number | null, 
    genero_id: number | null,
    gruposanguineo_id: number | null,
    estadocivil_id: number | null,
    etnia_id: number | null,
    provincia_id: number | null,
    canton_id: number | null,
    parroquia_id: number | null,
    documento: string | null,
    apellidos: string,
    nombres: string,
    fecha_nacimiento: string | null,
    direccion: string | null,
    telefonos: string | null,
    puestos: PuestoAsignado[],
}

interface Props {
    titulos: Titulo[];
    documentos: Documento[];
    generos: Genero[];
    gruposSanguineos: GrupoSanguineo[];
    estadosCiviles: EstadoCivil[];
    etnias: Etnia[];
    provincias: Provincia[];
    puestos: Puesto[];
    personal: Personal;
    filters: {
        search: string;
    };
}

export default function Edit({titulos, generos, gruposSanguineos, estadosCiviles, etnias, documentos, provincias, puestos, personal, filters}: Props) {
    
    const {data, setData, put, processing, errors} = useForm({
        documento_id: personal.documento_id as number | null,
        titulo_id: personal.titulo_id as number | null,
        genero_id: personal.genero_id as number | null,
        gruposanguineo_id: personal.gruposanguineo_id as number | null,
        estadocivil_id: personal.estadocivil_id as number | null,
        etnia_id: personal.etnia_id as number | null,
        provincia_id: personal.provincia_id as number | null,
        canton_id: personal.canton_id as number | null,
        parroquia_id: personal.parroquia_id as number | null,
        documento: personal.documento ?? '',
        apellidos: personal.apellidos,
        nombres: personal.nombres,
        fecha_nacimiento: personal.fecha_nacimiento ?? '',
        direccion: personal.direccion ?? '',
        telefonos: personal.telefonos ?? '',
        puestos: personal.puestos ?? [],
        search: filters?.search ?? '',
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/personales/${personal.id}`);
    }

    const [cantones, setCantones] = useState<Canton[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);

    useEffect(() => {
        if (data.provincia_id) {
            axios.get(`/cantones/obtenerCanton/${data.provincia_id}`)
                .then(res => setCantones(res.data));
        }
    }, [data.provincia_id]);
    
    useEffect(() => {
        if (data.canton_id) {
            axios.get(`/parroquias/obtenerParroquia/${data.canton_id}`)
                .then(res => setParroquias(res.data));
        }
    }, [data.canton_id]);

    const [puestoSeleccionado, setPuestoSeleccionado] = useState<number | null>(null);
    const [mensajePuesto, setMensajePuesto] = useState<{
        texto: string;
        tipo: "success" | "error";
    } | null>(null);

    const handleAgregarPuesto = () => {
        
        if (!puestoSeleccionado) {
            setMensajePuesto({
                texto: "Debe seleccionar un puesto para agregar",
                tipo: "error"
            });
            return;
        }

        const puestoId = puestoSeleccionado;
        const puestoObj = puestos.find(p => p.id === puestoId);

        if (!puestoObj) {
            setMensajePuesto({
                texto: "Puesto no válido",
                tipo: "error"
            });
            return;
        }

        if (data.puestos.some(p => p.id === puestoObj.id)) {
            setMensajePuesto({
                texto: "El puesto ya fue agregado",
                tipo: "error"
            });
            return;
        }

        const nuevoPuesto: PuestoAsignado = {
            id: puestoObj.id,
            nombre: puestoObj.nombre,
            predeterminado: false, // valor inicial
            estado: "ACTIVO",      // valor inicial
        };

        setData("puestos", [
            ...data.puestos,
            nuevoPuesto
        ]);

        setMensajePuesto({
            texto: "Puesto agregado correctamente",
            tipo: "success"
        });

        setPuestoSeleccionado(null);
    };

    useEffect(() => {
        if (!mensajePuesto) return;

        const timer = setTimeout(() => {
            setMensajePuesto(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [mensajePuesto]);

    const handlePredeterminadoChange = (id: number) => {
        const puestosActualizados = data.puestos.map((puesto) => ({
            ...puesto,
            predeterminado: puesto.id === id
        }));

        setData("puestos", puestosActualizados);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar personal" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="personal">Información personal</TabsTrigger>
                        <TabsTrigger value="puestos">
                            Puestos
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                {data.puestos.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal">
                        <Card>
                            <CardContent>
                                <form onSubmit={handleUpdate} className='space-y-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <SearchableSelectField
                                                label="Título"
                                                name="titulo_id"
                                                value={data.titulo_id}
                                                options={titulos ?? []}
                                                uppercase={true}
                                                error={errors.titulo_id}
                                                onChange={(value) => setData("titulo_id", value)}
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
                                                onChange={(value) => setData("documento_id", value)}
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <InputField
                                                label="Documentos"
                                                name="documento"
                                                value={data.documento}
                                                onChange={e => setData('documento', e.target.value)}
                                                error={errors.documento}
                                                placeholder="Documentos"
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <InputField
                                                label="Apellidos"
                                                name="apellidos"
                                                value={data.apellidos}
                                                onChange={e => setData('apellidos', e.target.value)}
                                                error={errors.apellidos}
                                                placeholder="Apellidos"
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <InputField
                                                label="Nombres"
                                                name="nombres"
                                                value={data.nombres}
                                                onChange={e => setData('nombres', e.target.value)}
                                                error={errors.nombres}
                                                placeholder="Nombres"
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <SelectField
                                                label="Género"
                                                name="genero_id"
                                                value={data.genero_id}
                                                options={generos}
                                                error={errors.genero_id}
                                                onChange={(value) => setData("genero_id", value)}
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <SelectField
                                                label="Grupo sanguíneo"
                                                name="gruposanguineo_id"
                                                value={data.gruposanguineo_id}
                                                options={gruposSanguineos}
                                                error={errors.gruposanguineo_id}
                                                onChange={(value) => setData("gruposanguineo_id", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <SelectField
                                                label="Estado civil"
                                                name="estadocivil_id"
                                                value={data.estadocivil_id}
                                                options={estadosCiviles}
                                                error={errors.estadocivil_id}
                                                onChange={(value) => setData("estadocivil_id", value)}
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <SelectField
                                                label="Autoidentificación étnica"
                                                name="etnia_id"
                                                value={data.etnia_id}
                                                options={etnias}
                                                error={errors.etnia_id}
                                                onChange={(value) => setData("etnia_id", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                                        <div className="grid w-full gap-3">
                                            <SearchableSelectField
                                                label="Provincia de residencia"
                                                name="provincia_id"
                                                value={data.provincia_id}
                                                options={provincias ?? []}
                                                error={errors.provincia_id}
                                                onChange={(value) => setData("provincia_id", value)}
                                            />
                                        </div>
                                        <div className="grid w-full gap-3 items-start">
                                            <SearchableSelectField
                                                label="Cantón de residencia"
                                                name="canton_id"
                                                value={data.canton_id}
                                                options={cantones ?? []}
                                                error={errors.canton_id}
                                                onChange={(value) => setData("canton_id", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>                        
                                        <div className="grid w-full gap-3">
                                            <SearchableSelectField
                                                label="Parroquia de residencia"
                                                name="parroquia_id"
                                                value={data.parroquia_id}
                                                options={parroquias ?? []}
                                                error={errors.parroquia_id}
                                                onChange={(value) => setData("parroquia_id", value)}
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
                                            placeholder="Dirección"
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
                                                placeholder="Teléfonos"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">                           
                                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                                            {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar personal
                                        </Button>                    
                                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                            <Link 
                                                href="/personales" 
                                                data={{ search: data.search }}
                                            >
                                                <Undo2Icon /> Regresar
                                            </Link>
                                        </Button>
                                    </div> 
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="puestos">
                        <Card>
                            <CardContent>
                                <div className="w-full">                                    
                                    <div className="flex items-center gap-3">
                                        <Label htmlFor="puesto" className="whitespace-nowrap">
                                            Puestos
                                        </Label>
                                        <SearchableSelectField
                                            name="puesto"
                                            value={puestoSeleccionado}
                                            options={puestos ?? []}
                                            onChange={(value) => setPuestoSeleccionado(value)}
                                        />
                                        <Button
                                            size="sm"
                                            className="bg-slate-500 hover:bg-slate-700 h-9 cursor-pointer"
                                            onClick={handleAgregarPuesto}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Agregar
                                        </Button>
                                    </div>
                                    {mensajePuesto && (
                                        <Alert                                        
                                            className={`mt-4 border-none w-full px-4 py-2
                                            ${
                                                mensajePuesto.tipo === "error"
                                                ? "bg-red-500/10 text-red-600"
                                                : "bg-green-500/10 text-green-600"
                                            }
                                            `}
                                        >
                                            {mensajePuesto.tipo === "error" ? (
                                                <TriangleAlertIcon className="h-4 w-4" />
                                            ) : (
                                                <CheckCheckIcon className="h-4 w-4" />
                                            )}
                                            <AlertTitle>{mensajePuesto.texto}</AlertTitle>
                                        </Alert>
                                    )}
                                </div>
                                {data.puestos.length ? (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full border overflow-hidden rounded-md text-sm">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="py-2 px-4 text-left border-b w-[50px]">#</th>
                                                    <th className="py-2 px-4 text-left border-b w-[1000px]">Puesto</th>
                                                    <th className="py-2 px-4 text-left border-b w-[200px]">Predeterminado</th>
                                                    <th className="py-2 px-4 text-left border-b w-[200px]">Estado</th>
                                                    <th className="py-2 px-4 text-left border-b w-[20px]"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.puestos.map((puesto, index) => (
                                                    <tr className="odd:bg-muted/50 hover:bg-gray-50" key={puesto.id}>
                                                        <td className="py-2 px-4 border-b">{index + 1}</td>
                                                        <td className="py-2 px-4 border-b">{puesto.nombre}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <RadioGroup
                                                                value={data.puestos.find(p => p.predeterminado)?.id?.toString()}
                                                                onValueChange={(value) => handlePredeterminadoChange(Number(value))}
                                                            >
                                                                <RadioGroupItem
                                                                    value={puesto.id.toString()}
                                                                    disabled={puesto.estado === "INACTIVO"}
                                                                />
                                                            </RadioGroup>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <Badge
                                                                className={`border-none focus-visible:outline-none
                                                                    ${puesto.estado === "ACTIVO"
                                                                        ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                        : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                    }
                                                                `}
                                                            >
                                                                {puesto.estado}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                            <TriangleAlertIcon className="h-4 w-4" />
                                            <AlertTitle>Este personal no cuenta con puestos asignados</AlertTitle>
                                            <AlertDescription className="text-destructive/80">
                                                Por favor agregue un nuevo puesto.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}