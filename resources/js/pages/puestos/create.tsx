import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { SaveIcon, Undo2Icon } from 'lucide-react';
import InputField from '@/components/form/InputField';
import TextAreaField from '@/components/form/TextAreaField';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear puesto',
        href: 'puestos/create',
    },
];

export default function Create() {   

    const backUrl = sessionStorage.getItem('puestos.index') || '/puestos';

    const {data, setData, post, processing, errors} = useForm({
        nombre: '',
        lugar_trabajo: '',
        observaciones: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/puestos');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear puesto" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid w-full gap-3 items-start'>
                        <InputField
                            label="Nombre"
                            name="nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            error={errors.nombre}
                            placeholder="Nombre"
                        />
                    </div>                    
                    <div className='grid w-full gap-3 items-start'>
                        <InputField
                            label="Lugar de trabajo"
                            name="lugar_trabajo"
                            value={data.lugar_trabajo}
                            onChange={e => setData('lugar_trabajo', e.target.value)}
                            error={errors.lugar_trabajo}
                            placeholder="Lugar de trabajo"
                        />
                    </div>
                    <div className='grid w-full gap-3 items-start'>
                        <TextAreaField
                            label="Observaciones"
                            name="observaciones"
                            value={data.observaciones}
                            maxLength={1000}
                            placeholder="Observaciones"
                            error={errors.observaciones}
                            onChange={value => setData('observaciones', value)}
                        />
                    </div>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear puesto
                        </Button>
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link href={backUrl}>
                                <Undo2Icon /> Regresar
                            </Link>
                        </Button>
                    </div> 
                </form>
            </div>
        </AppLayout>
    )
}