import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, FileText, Plus, Trash2, Trash2Icon, TriangleAlertIcon, Undo2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import SearchableSelectField from '@/components/form/SearchableSelectField';
import InputField from '@/components/form/InputField';
import { Spinner } from '@/components/ui/spinner';
import NumberInput from '@/components/form/NumberInput';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Firmantes de la plantilla',
        href: 'plantillas/edit',
    },
];

interface Puesto {
    id: number;
    nombre: string;
}

interface PuestoPredeterminado {
    id: number;
    puesto: Puesto;
}

interface Personal {
    id: number;
    nombre: string;
    puesto_predeterminado?: PuestoPredeterminado;
}

interface Firmante {
    id: number;
    nombre: string;
}

interface PersonalPlantilla {
    id: number;
    personal_id: number;
    plantilla_id: number;
    puesto: string;
    firma_electronica: boolean;
    posicion_firmante: string;
    posicion_x_firma: number;
    posicion_y_firma: number;
    firmante: Firmante;
}

interface Plantilla {
    id: number;
    nombre: string;
    vista_blade: string;
    tamano_papel: string;
    orientacion_papel: string;
    personal_plantilla: PersonalPlantilla[];
}

interface Props {
    personales: Personal[];
    plantilla: Plantilla;
    filters: {
        search: string;
    };
}

export default function Edit({personales, plantilla, filters}: Props) {

    const { flash, show } = useFlashAlert(); 

    const [firmanteToDelete, setFirmanteToDelete] = useState<number | null>(null);    

    const {data, setData, put, processing, errors, reset} = useForm({
        plantilla_id: plantilla.id,
        personal_id: 0,
        puesto: '',
        firma_electronica: false,
        posicion_firmante: '',
        posicion_x_firma: 1,
        posicion_y_firma: 1,
        search: filters?.search ?? '',
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/plantillas/${plantilla.id}/firmantes`, {
            preserveScroll: true,

            onSuccess: () => {
                reset();
            }
        });
    }

    const verificarFirma = (checked: boolean) => {

        if (!checked) {
            setData('firma_electronica', false);
            return;
        }

        if (!data.personal_id) {
            return;
        }

        router.get(`/personales/${data.personal_id}/verificar-firma`, {}, {
            preserveScroll: true,
            preserveState: true,

            onSuccess: (page) => {
                const flash = (page.props as any).flash;

                if (!flash?.error) {
                    setData('firma_electronica', true);
                } else {
                    setData('firma_electronica', false);
                }
            },

            onError: () => {
                setData('firma_electronica', false);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Firmantes de la plantilla" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">                    
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <FileText className="w-8 h-8 text-gray-700" />
                            </div>
                            <div className="w-full">
                                <h1 className="text-lg font-semibold leading-tight">{plantilla.nombre}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                    <span>{plantilla.vista_blade}, {plantilla.tamano_papel}, {plantilla.orientacion_papel === 'LANDSCAPE' ? 'HORIZONTAL' : 'VERTICAL'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex gap-2 justify-end">
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href="/plantillas" 
                                    data={{ search: filters.search }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <form onSubmit={handleUpdate} className='space-y-4'>
                        <Card className="border shadow-sm">
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <SearchableSelectField
                                        label="Personal"
                                        name="personal_id"
                                        value={data.personal_id}
                                        options={personales ?? []}
                                        error={errors.personal_id}
                                        uppercase
                                        onChange={(value) => {
                                            const personalId = Number(value);

                                            setData("personal_id", personalId);

                                            const personalSeleccionado = personales.find(p => p.id === personalId);

                                            if (personalSeleccionado?.puesto_predeterminado?.puesto) {
                                                setData("puesto", personalSeleccionado.puesto_predeterminado.puesto.nombre);
                                            }
                                        }}
                                    />
                                    <InputField
                                        label="Puesto"
                                        name="puesto"
                                        value={data.puesto ?? ''}
                                        onChange={e => setData('puesto', e.target.value)}
                                        error={errors.puesto}
                                        placeholder="puesto"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-3 items-end">
                                    <div className="flex items-center gap-2 h-10">
                                        <Switch
                                            id="firma_electronica"
                                            checked={data.firma_electronica}
                                            disabled={!data.personal_id}
                                            onCheckedChange={verificarFirma}
                                        />
                                        <Label htmlFor="firma_electronica">
                                            Firma electrónicamente
                                        </Label>
                                    </div>
                                    <div className="grid w-full gap-1 relative">
                                        <Label htmlFor="posicion_firmante" className="mb-2">Posición del firmante</Label>
                                        <div className="relative">
                                            
                                            <select
                                                name="posicion_firmante"
                                                value={data.posicion_firmante}
                                                onChange={e => setData('posicion_firmante', e.target.value)}
                                                className={cn(
                                                    "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                                    errors.posicion_firmante && "border-destructive"
                                                )}
                                            >
                                                <option value={0}>Seleccione</option>
                                                <option value='L'>IZQUIERDA</option>
                                                <option value='C'>CENTRO</option>
                                                <option value='R'>DERECHA</option>
                                            </select>
                                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                        </div>
                                        <InputError message={errors.posicion_firmante} />
                                    </div>
                                    <NumberInput
                                        label="Posición X (Firma electrónica)"
                                        name="posicion_x_firma"
                                        value={data.posicion_x_firma}
                                        disabled={!data.personal_id}
                                        onChange={(value) => setData('posicion_x_firma', value)}
                                        min={1}
                                        error={errors.posicion_x_firma}
                                    />
                                    <NumberInput
                                        label="Posición Y (Firma electrónica)"
                                        name="posicion_y_firma"
                                        value={data.posicion_y_firma}
                                        disabled={!data.personal_id}
                                        onChange={(value) => setData('posicion_y_firma', value)}
                                        min={1}
                                        error={errors.posicion_y_firma}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center gap-4">
                                <p className="text-xs text-muted-foreground max-w-2xl">
                                    Se recomienda que todos los firmantes de la plantilla utilicen el mismo tipo de firma (electrónica o manual) para garantizar la consistencia y legalidad del documento.
                                </p>
                                <Button
                                    disabled={processing || (plantilla.personal_plantilla?.length ?? 0) >= 3}
                                    type="submit"
                                    size="sm"
                                    className="cursor-pointer"
                                >
                                    {!processing && <Plus />} {processing && <Spinner />} Agregar firmante
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                    {plantilla.personal_plantilla?.length ? (
                        <div className="border rounded-xl shadow-sm overflow-hidden mt-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">#</th>
                                            <th className="py-2 px-4 text-left border-b">Nombre</th>
                                            <th className="py-2 px-4 text-left border-b">Puesto</th>
                                            <th className="py-2 px-4 text-left border-b">Firma electrónica</th>
                                            <th className="py-2 px-4 text-left border-b">Posición firmante</th>
                                            <th className="py-2 px-4 text-left border-b">Posición X firma</th>
                                            <th className="py-2 px-4 text-left border-b">Posición Y firma</th>
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plantilla.personal_plantilla.map((plantilla, index) => (
                                            <tr className="odd:bg-muted/50 hover:bg-gray-50" key={plantilla.id}>
                                                <td className="py-2 px-4 border-b">{index + 1}</td>
                                                <td className="py-2 px-4 border-b">{plantilla.firmante?.nombre?.toUpperCase()}</td>
                                                <td className="py-2 px-4 border-b">{plantilla.puesto}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <Badge variant={plantilla.firma_electronica ? "default" : "secondary"}>
                                                        {plantilla.firma_electronica ? "SI" : "NO"}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {plantilla.posicion_firmante === 'L'
                                                        ? 'IZQUIERDA'
                                                        : plantilla.posicion_firmante === 'C'
                                                        ? 'CENTRO'
                                                        : 'DERECHA'}
                                                </td>
                                                <td className="py-2 px-4 border-b">{plantilla.posicion_x_firma}</td>
                                                <td className="py-2 px-4 border-b">{plantilla.posicion_y_firma}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFirmanteToDelete(plantilla.id)}
                                                        className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center my-6">
                            <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                <TriangleAlertIcon className="h-4 w-4" />
                                <AlertTitle>Esta plantilla no cuenta con firmantes</AlertTitle>
                                <AlertDescription className="text-destructive/80">
                                    Por favor agregue un nuevo firmande.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )} 
                </div>
            </div>

            <ConfirmDialog
                open={firmanteToDelete !== null}
                onOpenChange={() => setFirmanteToDelete(null)}
                title="¿Está seguro?"
                description="Esta acción no se puede deshacer. El firmante será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (firmanteToDelete) {
                        router.delete(`/personalesplantillas/${firmanteToDelete}`, {
                            preserveScroll: true,
                        });
                    }
                    setFirmanteToDelete(null);
                }}
            />
        </AppLayout>
    )
}