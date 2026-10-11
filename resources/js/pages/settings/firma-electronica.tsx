import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';
import { useRef, useState } from 'react';
import { CheckCheckIcon, SaveIcon, Trash2, TriangleAlert, XCircleIcon } from 'lucide-react';
import DateField from '@/components/form/DateField';
import InputField from '@/components/form/InputField';
import FileField from '@/components/form/FileField';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import { Switch } from '@/components/ui/switch';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
    hasFirma: boolean;
    firma?: {
        nombre_titular: string;
        cedula_titular: string;
        entidad_emisora: string;
        fecha_expiracion: string;
        solicitar_password: boolean;
    } | null;
};

export default function FirmaElectronica({ hasFirma, firma }: Props) {
    
    const { flash, show } = useFlashAlert(); 

    const [solicitarPassword, setSolicitarPassword] = useState(
        firma?.solicitar_password ?? false
    );

    const [firmaToDelete, setFirmaToDelete] = useState<number | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        firma: null as File | null,
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
      
        post('/settings/firma-electronica', {
            forceFormData: true,
            onSuccess: () => {
                reset();
        
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const toggleSolicitarPassword = (value: boolean) => {
        setSolicitarPassword(value);

        router.patch('/settings/firma-electronica', {
            solicitar_password: value
        }, {
            preserveScroll: true
        });
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);    

    // Calcula los días restantes para la expiración
    const diasRestantes = (fecha: string) => {
        const diff = new Date(fecha).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Firma electrónica', href: '/firma.edit' }]}>
            <Head title="Firma electrónica" />
            <SettingsLayout>
                <div className="space-y-6 w-full">
                    <FlashAlert flash={flash} show={show} />
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border rounded-lg shadow-md bg-background/50 space-y-4 w-full">
                            <HeadingSmall title="Subir firma electrónica" />
                            <form onSubmit={submit} className="space-y-4">
                                <FileField
                                    label="Archivo de firma (.p12)"
                                    name="firma"
                                    accept=".p12"
                                    error={errors.firma}
                                    onChange={(file) => setData('firma', file)}
                                    ref={fileInputRef}
                                />
                                <InputField
                                    label="Contraseña de la firma"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />                               
                                <Button disabled={processing} className="w-full cursor-pointer">
                                    {!processing && <SaveIcon />} {processing && <Spinner />} Guardar firma
                                </Button>
                            </form>
                        </div>
                        {hasFirma && firma && (
                            <div className="p-6 border rounded-lg shadow-md bg-muted/10 w-full space-y-4">
                                <HeadingSmall title="Información del certificado" />
                                <div className="grid gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Titular</p>
                                        <p className="font-medium">{firma.nombre_titular}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Cédula</p>
                                        <p className="font-medium">{firma.cedula_titular}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Entidad emisora</p>
                                        <p className="font-medium">{firma.entidad_emisora}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Fecha de expiración</p>
                                        <p className="font-medium">
                                            {dayjs.utc(firma.fecha_expiracion).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">
                                            Solicitar contraseña al firmar
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Si está activo se pedirá la contraseña de la firma al momento de firmar documentos.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={solicitarPassword}
                                        onCheckedChange={toggleSolicitarPassword}
                                    />
                                </div>
                                <div className="pt-2">
                                    {diasRestantes(firma.fecha_expiracion) > 30 && (
                                        <p className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCheckIcon className="w-5 h-5" /> Certificado válido (
                                            {diasRestantes(firma.fecha_expiracion)} días restantes)
                                        </p>
                                    )}
                                    {diasRestantes(firma.fecha_expiracion) <= 30 &&
                                        diasRestantes(firma.fecha_expiracion) > 0 && (
                                        <p className="text-yellow-600 font-medium flex items-center gap-1">
                                             <TriangleAlert className="w-5 h-5" /> Expira en {diasRestantes(firma.fecha_expiracion)} días
                                        </p>
                                    )}
                                    {diasRestantes(firma.fecha_expiracion) <= 0 && (
                                        <p className="text-red-600 font-medium flex items-center gap-1">
                                            <XCircleIcon className="w-5 h-5" /> Certificado expirado
                                        </p>
                                    )}
                                </div>
                                <div className="pt-4">
                                    <Button variant="destructive" onClick={() => setFirmaToDelete(1)}  className="w-full cursor-pointer">
                                        <Trash2/> Eliminar firma
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>

            <ConfirmDialog
                open={firmaToDelete !== null}
                onOpenChange={() => setFirmaToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El archivo de la firma será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="delete"
                onConfirm={() => {
                    if (firmaToDelete) {
                        router.delete('/settings/firma-electronica')
                    }
                    setFirmaToDelete(null);
                }}
            />
        </AppLayout>
    );
}