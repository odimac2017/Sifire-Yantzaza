import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { SaveIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de Perfil',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>

        <Head title="Configuración de perfil" />

        <SettingsLayout>
            <div className="space-y-6">
                <HeadingSmall
                    title="Información del perfil"
                    description="Actualiza tu nombre y dirección de correo electrónico"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">Primer nombre</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        defaultValue={auth.user.first_name}
                                        placeholder="Primer nombre"
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="second_name">Segundo nombre</Label>
                                    <Input
                                        id="second_name"
                                        name="second_name"
                                        defaultValue={auth.user.second_name ?? ''}
                                        placeholder="Segundo nombre"
                                    />
                                    <InputError message={errors.second_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="first_surname">Primer apellido</Label>
                                    <Input
                                        id="first_surname"
                                        name="first_surname"
                                        defaultValue={auth.user.first_surname}
                                        placeholder="Primer apellido"
                                        required
                                    />
                                    <InputError message={errors.first_surname} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="second_surname">Segundo apellido</Label>
                                    <Input
                                        id="second_surname"
                                        name="second_surname"
                                        defaultValue={auth.user.second_surname ?? ''}
                                        placeholder="Segundo apellido"
                                    />
                                    <InputError message={errors.second_surname} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Correo electrónico"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Tu dirección de correo electrónico no está verificada.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Haz clic aquí para reenviar el correo de verificación.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                Se ha enviado un nuevo enlace de verificación a tu correo electrónico.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className='cursor-pointer'
                                >
                                    {!processing && <SaveIcon />} {processing && <Spinner />} 
                                    Guardar
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        Guardado
                                    </p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* <DeleteUser /> */}
        </SettingsLayout>
        </AppLayout>
    );
}
