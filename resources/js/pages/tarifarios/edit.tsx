import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { RefreshCcwIcon, Undo2Icon } from 'lucide-react';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import InputField from '@/components/form/InputField';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar tarifario',
        href: 'tarifarios/edit',
    },
];

interface Principal {
    id: number;    
    codigo: string,
    nombre: string,
}

interface Tarifario {
    id: number,
    parent_id: number | null,
    codigo: string,
    nombre: string,
}

interface Props {
    principales: Principal[];
    tarifario: Tarifario;
    filters: {
        search: string;
        year: number;
    };
}

export default function Edit({principales, tarifario, filters}: Props) {
    const {data, setData, put, processing, errors} = useForm({
        parent_id: tarifario.parent_id,
        codigo: tarifario.codigo,
        nombre: tarifario.nombre,
        search: filters?.search ?? '',
        year: filters.year,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/tarifarios/${tarifario.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar tarifario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleUpdate} className='space-y-4'>
                    <div className='grid w-full gap-3 items-start'>   
                        <SearchableSelectField
                            label="Tarifario principal"
                            name="parent_id"
                            value={data.parent_id}
                            options={principales}
                            error={errors.parent_id}
                            onChange={(value) => setData("parent_id", value)}
                        />
                    </div>
                    <div className='grid w-full gap-3 items-start'>
                        <InputField
                            label="Código del tarifario"
                            name="codigo"
                            value={data.codigo}
                            onChange={e => setData('codigo', e.target.value)}
                            error={errors.codigo}
                            placeholder="Código del tarifario"
                        />
                    </div>
                    <div className='grid w-full gap-3 items-start'>
                        <InputField
                            label="Nombre del tarifario"
                            name="nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            error={errors.nombre}
                            placeholder="Nombre del tarifario"
                        />
                    </div>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar tarifario
                        </Button>                    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href='/tarifarios' 
                                data={{ search: data.search, year: data.year }}
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