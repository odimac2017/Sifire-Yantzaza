import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import InputError from '@/components/input-error';
import { SaveIcon, Undo2Icon, XIcon, CheckIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import InputField from '@/components/form/InputField';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear usuario',
        href: 'users',
    },
];

interface Rol {
    id: number;
    nombre: string;
}

interface Props {
    roles: Rol[];
    filters: {
        search: string;
    };
}

export default function Create({roles, filters}: Props) {    
    const { data, setData, post, processing, errors } = useForm<{
        first_name: string;
        second_name: string;
        first_surname: string;
        second_surname: string;
        email: string;
        password: string;
        password_confirmation: string;
        roles: number[];
        avatar: File | null;
        search: string;
    }>({
        first_name: '',
        second_name: '',
        first_surname: '',
        second_surname: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
        avatar: null as File | null,
        search: filters?.search ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/users');
    };

    const selectedRoles = roles.filter(rol =>
        data.roles.includes(rol.id)
    );
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Primer nombre"
                                name="first_name"
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                error={errors.first_name}
                                placeholder="Primer nombre"
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <InputField
                                label="Segundo nombre"
                                name="second_name"
                                value={data.second_name}
                                onChange={e => setData('second_name', e.target.value)}
                                error={errors.second_name}
                                placeholder="Segundo nombre"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Primer apellido"
                                name="first_surname"
                                value={data.first_surname}
                                onChange={e => setData('first_surname', e.target.value)}
                                error={errors.first_surname}
                                placeholder="Primer apellido"
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <InputField
                                label="Segundo apellido"
                                name="second_surname"
                                value={data.second_surname}
                                onChange={e => setData('second_surname', e.target.value)}
                                error={errors.second_surname}
                                placeholder="Segundo apellido"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Email"
                                name="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="Email"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <InputField
                                label="Contraseña"
                                name="password"
                                type='password'
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="Contraseña"
                            />
                        </div>
                        <div className="grid w-full gap-3 items-start">
                            <InputField
                                label="Confirmar contraseña"
                                name="password_confirmation"
                                type='password'
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                placeholder="Confirmar contraseña"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-start'>
                        <div className="grid w-full gap-3">
                            <Label htmlFor="avatar">Avatar</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => setData('avatar', e.target.files?.[0] ?? null)}
                            />
                            <InputError
                                message={errors.avatar}
                            />
                        </div>
                    </div>
                    <div className='grid w-full gap-3 items-start'> 
                        <Label htmlFor="roles">Roles</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start gap-1 flex-wrap min-h-10"
                                    >
                                        {selectedRoles.length > 0 ? (
                                            selectedRoles.map((rol) => (
                                                <Badge
                                                    key={rol.id}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {rol.nombre}
                                                    <XIcon
                                                        className="h-3 w-3 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setData(
                                                                'roles',
                                                                data.roles.filter(r => r !== rol.id)
                                                            );
                                                        }}
                                                    />
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Seleccionar roles
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                {data.roles.length > 0 && (
                                    <div className="border-b p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-red-500"
                                            onClick={() => setData('roles', [])}
                                        >
                                            Limpiar todo
                                        </Button>
                                    </div>
                                )}
                                <Command>
                                    <CommandEmpty>No hay roles</CommandEmpty>
                                    <CommandGroup>
                                        {roles.map((rol) => {
                                            const selected = data.roles.includes(rol.id);
                                            return (
                                                <CommandItem
                                                    key={rol.id}
                                                    onSelect={() => {
                                                        setData(
                                                            'roles',
                                                            selected
                                                                ? data.roles.filter(r => r !== rol.id)
                                                                : [...data.roles, rol.id]
                                                        );
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={`mr-2 h-4 w-4 ${
                                                            selected ? 'opacity-100' : 'opacity-0'
                                                        }`}
                                                    />
                                                    {rol.nombre}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <InputError message={errors.roles} />
                    </div>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <SaveIcon />} {processing && <Spinner />} Crear usuario
                        </Button>                    
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href="/users" 
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
