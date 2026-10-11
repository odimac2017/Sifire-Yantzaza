import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { Label } from "@/components/ui/label";
import { ChevronDownIcon, RefreshCcwIcon, Undo2Icon } from 'lucide-react';
import InputField from '@/components/form/InputField';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar extintor',
        href: 'extintores/edit',
    },
];

interface Extintor {
    id: number,
    numero_formateado: string,
    tipo: string;
    capacidad: number;
    estado: string;
    periodo: number,
}

interface Props {
    extintor: Extintor;
    filters: {
        search: string;
        year: number;
    };
}

export default function Edit({ extintor, filters }: Props) {

    const { data, setData, put, processing, errors } = useForm({
        numero_formateado: extintor.numero_formateado,
        tipo: extintor.tipo,
        capacidad: extintor.capacidad,
        estado: extintor.estado,
        periodo: extintor.periodo,
        search: filters?.search ?? '',
        year: filters.year,
    }); 

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/extintores/${extintor.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar extintor" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-end mb-4">
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                            <span className="text-xs opacity-80 mr-1">Número de extintor</span>
                            <span className="font-bold tracking-wider">
                                #{data.numero_formateado}
                            </span>
                        </div>
                    </div>
                    <form onSubmit={handleUpdate} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                            <div className="grid w-full gap-1 relative">
                                <Label htmlFor="tipo" className="mb-2">
                                    Tipo
                                </Label>
                                <div className="relative">
                                    <select
                                        name="tipo"
                                        value={data.tipo}
                                        onChange={(e) => setData("tipo", e.target.value)}
                                        className={cn(
                                            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                            errors.tipo && "border-destructive"
                                        )}
                                    >
                                        <option value={0}>Seleccione</option>
                                        <option value='CO2'>CO2</option>
                                        <option value='PQS'>PQS</option>
                                        <option value='PURPURA K'>PURPURA K</option>
                                    </select>
                                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                </div>
                                <InputError message={errors.tipo} />
                            </div>
                            <div className="grid w-full gap-1 relative">
                                <Label htmlFor="tipo" className="mb-2">
                                    Capacidad
                                </Label>
                                <div className="relative">
                                    <select
                                        name="capacidad"
                                        value={data.capacidad}
                                        onChange={(e) => setData("capacidad", Number(e.target.value))}
                                        className={cn(
                                            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                            errors.capacidad && "border-destructive"
                                        )}
                                    >
                                        <option value={0}>Seleccione</option>
                                        <option value='5'>5 LBS</option>
                                        <option value='10'>10 LBS</option>
                                        <option value='15'>15 LBS</option>
                                        <option value='20'>20 LBS</option>
                                    </select>
                                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                </div>
                                <InputError message={errors.capacidad} />
                            </div>
                            <div className="grid w-full gap-1 relative">
                                <Label htmlFor="tipo" className="mb-2">
                                    Estado
                                </Label>
                                <div className="relative">
                                    <select
                                        name="estado"
                                        value={data.estado}
                                        onChange={(e) => setData("estado", e.target.value)}
                                        className={cn(
                                            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                            errors.estado && "border-destructive"
                                        )}
                                    >
                                        <option value={0}>Seleccione</option>
                                        <option value='BUENO'>BUENO</option>
                                        <option value='REGULAR'>REGULAR</option>
                                        <option value='MALO'>MALO</option>
                                    </select>
                                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                </div>
                                <InputError message={errors.estado} />
                            </div>
                        </div>
                        <div className="flex gap-2">                           
                            <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                                {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar extintor
                            </Button>                    
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href='/extintores' 
                                    data={{ search: data.search, year: data.year }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>
                        </div> 
                    </form>
                </div>
            </div>
        </AppLayout>
    )
}
