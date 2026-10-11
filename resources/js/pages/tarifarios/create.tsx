import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { SaveIcon, Undo2Icon } from 'lucide-react';
import SearchableSelectField from '@/components/form/SearchableSelectField';
import InputField from '@/components/form/InputField';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear tarifario',
        href: 'tarifarios/create',
    },
];

interface Principal {
    id: number;    
    codigo: string,
    nombre: string,
}

interface Props {
    principales: Principal[]; 
    filters: {
        search: string;
        year: number;
    };
}

export default function Create({principales, filters}: Props) {    
    
    const {data, setData, post, processing, errors} = useForm({
        parent_id: null as number | null,
        codigo: '',
        nombre: '',
        search: filters?.search ?? '',
        year: filters.year,   
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/tarifarios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear tarifario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className='space-y-4'>
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
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear tarifario
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