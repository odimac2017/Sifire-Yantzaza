import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { BuildingIcon, Calendar1Icon, Car, CarIcon, CheckCheckIcon, ChevronDownIcon, FileText, Home, IdCard, Layers, Mail, MapPin, Phone, PlusIcon, RefreshCcwIcon, RefreshCwIcon, SaveIcon, Trash2, TriangleAlertIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState} from 'react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import InputField from '@/components/form/InputField';
import { Label } from '@/components/ui/label';
import NumberInput from '@/components/form/NumberInput';
import { money } from "@/utils/format";
import TextAreaField from '@/components/form/TextAreaField';
import axios from 'axios';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

dayjs.extend(utc);
dayjs.extend(timezone);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar informe de inspección',
        href: '/inspecciones/edit',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface TarifarioPeriodo {
    id: number;
    valor: number;
    riesgo: number;
    valor_fijo: number;
}

interface Tarifario {
    id: number;
    nombre: string;
    parent_id?: number;
    parent?: Tarifario;
    tarifario_periodo?: TarifarioPeriodo;
}

interface Cliente {
    id: number,
    documento: string,
    nombre: string,
    parroquia?: Parroquia;
    direccion: string,
    telefonos: string,
    email: string,
    porcentaje_descuento: number,
}

interface ActividadEconomica {
    id: number;
    tipo_actividad: string;
    e_nombre_comercial: string;
    e_actividad_principal: string;
    parroquia?: Parroquia;
    e_direccion: string;
    v_placa: string;
    v_marca: string;
    v_tipo: string;
    v_clase: string;
    v_color: string;
}

interface Extintor { 
    id?: number; 
    numero: string;
    tipo: string;
    capacidad: number;
    estado: string;
}

interface ProcesoPermiso {
    id: number;
    cliente_id: number;
    actividad_economica_id: number;
    cliente: Cliente;
    actividad_economica: ActividadEconomica;
    actualizacion_planos: number;
    tarifario?: Tarifario;
    extintores?: Extintor[];
    solicitud_inspeccion: {
        tipo_solicitud: string;
    }
}

interface Inspeccion {
    id: number;
    numero_formateado: string;
    fecha_inspeccion: string;
    tipo_funcion: string;
    tipo_cons_hormigon: boolean;
    tipo_cons_metalica: boolean;
    tipo_cons_madera: boolean;
    tipo_cons_otros: boolean;
    tipo_comb_surtidores: number;
    tipo_comb_diesel: boolean;
    tipo_comb_cap_diesel: number;
    tipo_comb_gasolina: boolean;
    tipo_comb_cap_gasolina: number;
    tipo_comb_transporte: boolean;
    tipo_comb_vehiculo: boolean;
    tipo_comb_almacenamiento: boolean;
    tipo_comb_venta: boolean;
    tipo_comb_placas: string;
    tipo_comb_extintor: string;
    tipo_comb_origen: string;
    tipo_comb_destino: string;
    tipo_comb_norma_inen: string;
    tipo_comb_observaciones: string;
    inst_elec_buenas: boolean;
    inst_elec_malas: boolean;
    inst_elec_internas: boolean;
    inst_elec_externas: boolean;
    inst_elec_generador: boolean;
    inst_elec_transformador: boolean;
    vent_natural: boolean;
    vent_mecanica: boolean;
    vent_adecuada: boolean;
    vent_escasa: boolean;
    area1: number;
    area2: number;
    area3: number;
    area4: number;
    area_total: number;
    aforo_personas: number;
    sist_ince_detectores_humo: boolean;
    sist_ince_lamparas_emergencia: boolean;
    sist_ince_gabinetes: boolean;
    sist_ince_sprinklers: boolean;
    sist_ince_alarma_incendio: boolean;
    sist_ince_bombas_hidraulicas: boolean;
    sist_ince_bombas_impulsion: boolean;
    sist_ince_escaleras_emergencia: boolean;
    sist_ince_puerta_escape: boolean;
    sist_ince_puertas_contra_fuego: boolean;
    sist_ince_senalizacion_emergencia: boolean;
    sist_ince_tanques_reserva_agua: boolean;
    sist_ince_espumogeno: boolean;
    capacitacion_extintores: boolean;
    porcentaje_descuento: number;
    valor_inspeccion: number;
    valor_descuento: number;
    valor_nota_credito: number;
    porcentaje_multa: number;
    valor_multa: number;
    subtotal: number;
    valor_total: number;
    observaciones: string;
    recomendaciones: string;
    estado: string;
    exento_pago: boolean;
}

interface Props {
    procesoPermiso: ProcesoPermiso;
    inspeccion: Inspeccion;
    subtotalInspecciones: number;
    sbu: number;
    inspeccionPlanos: number;
    saldoNotaCredito: number;
    porcentajeReinspeccion: number;
    porcentajeMulta: number;
    filters: {
        year: number | null;
        search: string;
        estado: string;
    };
}

export default function Edit({procesoPermiso, inspeccion, subtotalInspecciones, sbu, inspeccionPlanos, saldoNotaCredito, porcentajeReinspeccion, porcentajeMulta, filters}: Props) {

    const cliente = procesoPermiso.cliente;
    const actividadEconomica = procesoPermiso.actividad_economica;

    const ES_ESTABLECIMIENTO = procesoPermiso.actividad_economica.tipo_actividad === "E";
    
    const esReinspeccion = procesoPermiso.solicitud_inspeccion.tipo_solicitud === 'RE';

    const {data, setData, put, processing, errors} = useForm({
        id: inspeccion.id,
        proceso_permiso_id: procesoPermiso.id,
        cliente_id: procesoPermiso.cliente_id,
        actividad_economica_id: procesoPermiso.actividad_economica_id,
        numero_formateado: inspeccion.numero_formateado,
        fecha_inspeccion: inspeccion.fecha_inspeccion,
        tipo_funcion: inspeccion.tipo_funcion,
        tipo_cons_hormigon: inspeccion.tipo_cons_hormigon,
        tipo_cons_metalica: inspeccion.tipo_cons_metalica,
        tipo_cons_madera: inspeccion.tipo_cons_madera,
        tipo_cons_otros: inspeccion.tipo_cons_otros,
        tipo_comb_surtidores: inspeccion.tipo_comb_surtidores,
        tipo_comb_diesel: inspeccion.tipo_comb_diesel,
        tipo_comb_cap_diesel: inspeccion.tipo_comb_cap_diesel,
        tipo_comb_gasolina: inspeccion.tipo_comb_gasolina,
        tipo_comb_cap_gasolina: inspeccion.tipo_comb_cap_gasolina,
        tipo_comb_transporte: inspeccion.tipo_comb_transporte,
        tipo_comb_vehiculo: inspeccion.tipo_comb_vehiculo,
        tipo_comb_almacenamiento: inspeccion.tipo_comb_almacenamiento,
        tipo_comb_venta: inspeccion.tipo_comb_venta,
        tipo_comb_placas: inspeccion.tipo_comb_placas,
        tipo_comb_extintor: inspeccion.tipo_comb_extintor,
        tipo_comb_origen: inspeccion.tipo_comb_origen,
        tipo_comb_destino: inspeccion.tipo_comb_destino,
        tipo_comb_norma_inen: inspeccion.tipo_comb_norma_inen,
        tipo_comb_observaciones: inspeccion.tipo_comb_observaciones,
        inst_elec_buenas: inspeccion.inst_elec_buenas,
        inst_elec_malas: inspeccion.inst_elec_malas,
        inst_elec_internas: inspeccion.inst_elec_internas,
        inst_elec_externas: inspeccion.inst_elec_externas,
        inst_elec_generador: inspeccion.inst_elec_generador,
        inst_elec_transformador: inspeccion.inst_elec_transformador,
        vent_natural: inspeccion.vent_natural,
        vent_mecanica: inspeccion.vent_mecanica,
        vent_adecuada: inspeccion.vent_adecuada,
        vent_escasa: inspeccion.vent_escasa,
        area1: inspeccion.area1,
        area2: inspeccion.area2,
        area3: inspeccion.area3,
        area4: inspeccion.area4,
        area_total: inspeccion.area_total,
        aforo_personas: inspeccion.aforo_personas,
        sist_ince_detectores_humo: inspeccion.sist_ince_detectores_humo,
        sist_ince_lamparas_emergencia: inspeccion.sist_ince_lamparas_emergencia,
        sist_ince_gabinetes: inspeccion.sist_ince_gabinetes,
        sist_ince_sprinklers: inspeccion.sist_ince_sprinklers,
        sist_ince_alarma_incendio: inspeccion.sist_ince_alarma_incendio,
        sist_ince_bombas_hidraulicas: inspeccion.sist_ince_bombas_hidraulicas,
        sist_ince_bombas_impulsion: inspeccion.sist_ince_bombas_impulsion,
        sist_ince_escaleras_emergencia: inspeccion.sist_ince_escaleras_emergencia,
        sist_ince_puerta_escape: inspeccion.sist_ince_puerta_escape,
        sist_ince_puertas_contra_fuego: inspeccion.sist_ince_puertas_contra_fuego,
        sist_ince_senalizacion_emergencia: inspeccion.sist_ince_senalizacion_emergencia,
        sist_ince_tanques_reserva_agua: inspeccion.sist_ince_tanques_reserva_agua,
        sist_ince_espumogeno: inspeccion.sist_ince_espumogeno,
        capacitacion_extintores: inspeccion.capacitacion_extintores,
        porcentaje_descuento: procesoPermiso.cliente.porcentaje_descuento ?? 0,
        valor_inspeccion: inspeccion.valor_inspeccion,
        valor_descuento: inspeccion.valor_descuento,
        valor_nota_credito: inspeccion.valor_nota_credito,
        porcentaje_multa: porcentajeMulta,
        valor_multa: inspeccion.valor_multa,
        subtotal: inspeccion.subtotal,
        valor_total: inspeccion.valor_total,
        actualizacion_planos: procesoPermiso.actualizacion_planos,
        observaciones: inspeccion.observaciones,
        recomendaciones: inspeccion.recomendaciones,
        estado_informe: inspeccion.estado,
        exento_pago: inspeccion.exento_pago,
        extintores: procesoPermiso?.extintores ?? [],
        search: filters?.search ?? '',
        year: filters.year ?? new Date().getFullYear(),
        estado: filters?.estado ?? '',
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/inspecciones/${inspeccion.id}`);
    }

    const [areaInput, setAreaInput] = useState({
        area1: inspeccion.area1
            ? String(inspeccion.area1)
            : "",
        area2: inspeccion.area2
            ? String(inspeccion.area2)
            : "",
        area3: inspeccion.area3
            ? String(inspeccion.area3)
            : "",
        area4: inspeccion.area4
            ? String(inspeccion.area4)
            : "",
    });

    useEffect(() => {
        const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

        const total = round2(
            (data.area1 || 0) +
            (data.area2 || 0) +
            (data.area3 || 0) +
            (data.area4 || 0)
        );

        setData('area_total', total);

        const valor = procesoPermiso?.tarifario?.tarifario_periodo?.valor || 0;
        const riesgo = procesoPermiso?.tarifario?.tarifario_periodo?.riesgo || 0;
        const valorFijo = procesoPermiso?.tarifario?.tarifario_periodo?.valor_fijo || 0;
        const descuento = procesoPermiso?.cliente?.porcentaje_descuento || 0;

        let valor_inspeccion = 0;
        let valor_descuento = 0;
        let valor_nota_credito = 0;
        let valor_multa = 0;
        let subtotal = 0;
        let valor_total = 0;

        if (total > 0) {
            valor_inspeccion =
                procesoPermiso.actualizacion_planos === 0
                    ? (
                        valorFijo === 0
                            ? round2((total * valor) + (sbu * riesgo))
                            : round2(valor)
                    )
                    : round2(inspeccionPlanos * 0.10);

            if (!esReinspeccion) {

                valor_descuento = round2(
                    (valor_inspeccion * descuento) / 100
                );

                const baseNotaCredito =
                    descuento > 0
                        ? valor_descuento
                        : valor_inspeccion;

                valor_nota_credito = round2(
                    baseNotaCredito < saldoNotaCredito
                        ? baseNotaCredito
                        : saldoNotaCredito
                );

                valor_multa = round2(
                    (porcentajeMulta * sbu) / 100
                );

                subtotal = round2(
                    valor_inspeccion -
                    valor_descuento -
                    valor_nota_credito +
                    valor_multa
                );

            } else {

                valor_inspeccion = round2(
                    (valor_inspeccion * porcentajeReinspeccion) / 100
                );

                subtotal = round2(valor_inspeccion);
            }

            valor_total = round2(
                subtotalInspecciones + subtotal
            );
        }

        // 🔹 Si es exento
        if (data.exento_pago === true) {
            setData('porcentaje_descuento', 100);
            setData('valor_descuento', round2(valor_inspeccion));
            setData('valor_nota_credito', 0);
            setData('valor_multa', 0);
            setData('subtotal', 0);
            setData('valor_total', 0);

            return;
        }

        setData('porcentaje_descuento', descuento);
        setData('valor_inspeccion', round2(valor_inspeccion));
        setData('valor_descuento', round2(valor_descuento));
        setData('valor_nota_credito', round2(valor_nota_credito));
        setData('valor_multa', round2(valor_multa));
        setData('subtotal', round2(subtotal));
        setData('valor_total', round2(valor_total));
    }, [data.area1, data.area2, data.area3, data.area4, procesoPermiso, sbu, data.exento_pago, data.id ]);

    const [extintorForm, setExtintorForm] = useState({
        cantidad: 1,
        numero: '',
        tipo: '',
        capacidad: 0,
        estado: ''
    });

    const [loadingNumero, setLoadingNumero] = useState(false);

    const [formErrors, setFormErrors] = useState({
        tipo: '',
        capacidad: '',
        estado: ''
    });

    const agregarExtintor = async () => {
        try {
            let newErrors = {
                tipo: '',
                capacidad: '',
                estado: ''
            };

            if (!extintorForm.tipo) {
                newErrors.tipo = "Seleccione el tipo";
            }

            if (!extintorForm.capacidad) {
                newErrors.capacidad = "Seleccione la capacidad";
            }

            if (!extintorForm.estado) {
                newErrors.estado = "Seleccione el estado";
            }

            if (newErrors.tipo || newErrors.capacidad || newErrors.estado) {
                setFormErrors(newErrors);
                return;
            }

            setLoadingNumero(true);

            const res = await axios.get('/extintores/generar');

            let numeroBase = parseInt(res.data.numero);

            const ultimoNumero = data.extintores.length
                ? Math.max(...data.extintores.map(e => Number(e.numero)))
                : 0;

            const nuevosExtintores = [];

            for (let i = 1; i <= extintorForm.cantidad; i++) {
                const numeroFinal = ultimoNumero + i;

                const numeroFormateado = numeroFinal
                    .toString()
                    .padStart(7, '0');

                nuevosExtintores.push({
                    numero: numeroFormateado,
                    tipo: extintorForm.tipo,
                    capacidad: extintorForm.capacidad,
                    estado: extintorForm.estado
                });
            }
            
            // 🔥 agregar todos de una sola vez
            setData('extintores', [
                ...data.extintores,
                ...nuevosExtintores
            ]);

            // limpiar
            setExtintorForm({
                cantidad: 1,
                numero: '',
                tipo: '',
                capacidad: 0,
                estado: '',            
            });

            setFormErrors({
                tipo: '',
                capacidad: '',
                estado: ''
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNumero(false);
        }
    };

    const eliminarExtintor = (index: number) => {
        const nuevos = data.extintores.filter((_: Extintor, i: number) => i !== index);
        setData('extintores', nuevos);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar informe de inspección" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <User2Icon className="w-8 h-8 text-gray-700" />
                            </div>
                            <div className="w-full">
                                <h1 className="text-lg font-semibold leading-tight">{cliente.nombre}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                    <IdCard className="w-4 h-4" />
                                    <span>Documento:</span>
                                    <span className="font-medium text-foreground">{cliente.documento}</span>
                                </div>
                            </div>
                        </div>    
                        <div className="md:col-span-2 flex gap-2 justify-end">                            
                            <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                <Link 
                                    href={`/inspecciones`}
                                    data={{ search: data.search, year: data.year, estado: data.estado }}
                                >
                                    <Undo2Icon /> Regresar
                                </Link>
                            </Button>                             
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Home className="w-4 h-4" />
                        <span>Dirección:</span>
                        <span className="font-medium text-foreground">{cliente.direccion}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{cliente.parroquia?.nombre}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4" />
                            <span>Teléfonos:</span>
                            <span className="font-medium text-foreground">{cliente.telefonos}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4" />
                            <span>Email:</span>
                            <span className="font-medium text-foreground">{cliente.email}</span>
                        </div>
                    </div>
                </div>
                <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="flex justify-between items-start border-b pb-2 mb-3">
                        <div>
                            {ES_ESTABLECIMIENTO ? (
                                <>  
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                            <BuildingIcon className="w-8 h-8 text-gray-700" />
                                        </div>
                                        <div className="w-full">
                                            <h1 className="text-lg font-semibold leading-tight">{actividadEconomica.e_nombre_comercial}</h1>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                {actividadEconomica.e_actividad_principal}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>  
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                            <CarIcon className="w-8 h-8 text-gray-700" />
                                        </div>
                                        <div className="w-full">
                                            <h1 className="text-lg font-semibold leading-tight">{actividadEconomica.v_placa}</h1>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                {actividadEconomica.v_marca} {actividadEconomica.v_tipo} {actividadEconomica.v_clase} {actividadEconomica.v_color}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                        <div className="flex items-start gap-2 md:col-span-2">
                            <Home className="w-4 h-4" />
                            <span>Dirección:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.e_direccion}</span>
                        </div>                    
                        <div className="flex items-start gap-2 md:col-span-1">
                            <MapPin className="w-4 h-4" />
                            <span>Parroquia:</span>
                            <span className="font-medium text-foreground">{actividadEconomica.parroquia?.nombre}</span>
                        </div>
                    </div>
                </div>
                <div className="relative border rounded-md bg-background shadow-sm p-4 text-[13px]">
                    <div className="absolute top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
                        <span className="text-xs opacity-80 mr-1">Informe de inspección</span>
                        <span className="font-bold tracking-wider">#{data.numero_formateado}</span>
                    </div>
                    <div className="flex items-start gap-3 pb-2">
                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                            <Calendar1Icon className="w-8 h-8 text-gray-700" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold leading-tight">Fecha de inspección</h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date(data.fecha_inspeccion).toLocaleString('es-EC', {
                                    dateStyle: 'long',
                                    timeStyle: 'short'
                                }).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Tipo de función
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={data.tipo_funcion}
                                onValueChange={(value) => setData("tipo_funcion", value)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <label
                                    htmlFor="propietario"
                                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200
                                        ${data.tipo_funcion === "P"
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <RadioGroupItem value="P" id="propietario" />
                                    {ES_ESTABLECIMIENTO ? (
                                        <Home className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <Car className="w-5 h-5 text-blue-500" />
                                    )} 
                                    <div className="flex flex-col">
                                        <span className="font-medium">Propietario</span>
                                        <span className="text-xs text-muted-foreground">
                                            Dueño de la actividad económica
                                        </span>
                                    </div>
                                </label>
                                <label
                                    htmlFor="arrendatario"
                                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200
                                        ${data.tipo_funcion === "A"
                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                            : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <RadioGroupItem value="A" id="arrendatario" />
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Arrendatario</span>
                                        <span className="text-xs text-muted-foreground">
                                            Ocupa mediante contrato
                                        </span>
                                    </div>
                                </label>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Tipo de construcción
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_cons_hormigon"
                                    checked={data.tipo_cons_hormigon}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_cons_hormigon', checked)
                                    }
                                />
                                <Label htmlFor="tipo_cons_hormigon">Hormigón</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_cons_metalica"
                                    checked={data.tipo_cons_metalica}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_cons_metalica', checked)
                                    }
                                />
                                <Label htmlFor="tipo_cons_metalica">Metálica</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_cons_madera"
                                    checked={data.tipo_cons_madera}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_cons_madera', checked)
                                    }
                                />
                                <Label htmlFor="tipo_cons_madera">Madera</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_cons_otros"
                                    checked={data.tipo_cons_otros}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_cons_otros', checked)
                                    }
                                />
                                <Label htmlFor="tipo_cons_otros">Otros</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Tipo de combustible
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <NumberInput
                                    label="Surtidores"
                                    name="tipo_comb_surtidores"
                                    value={data.tipo_comb_surtidores}
                                    onChange={(value) => setData('tipo_comb_surtidores', value)}
                                    min={0}
                                    error={errors.tipo_comb_surtidores}
                                />
                            </div>
                            <div
                                onClick={() => {
                                    const newValue = !data.tipo_comb_diesel;
                                    setData('tipo_comb_diesel', newValue);

                                    if (!newValue) {
                                        setData('tipo_comb_cap_diesel', 0);
                                    }
                                }}
                                className={`w-full border rounded-xl p-4 space-y-3 cursor-pointer transition-all duration-200
                                    ${data.tipo_comb_diesel 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                        : "hover:bg-muted"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="tipo_comb_diesel"
                                            checked={data.tipo_comb_diesel}
                                            onClick={(e) => e.stopPropagation()} // 👈 evita doble toggle
                                            onCheckedChange={(checked) => {
                                                setData('tipo_comb_diesel', checked);

                                                if (!checked) {
                                                    setData('tipo_comb_cap_diesel', 0);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="tipo_comb_diesel" className="font-medium">
                                            Diesel
                                        </Label>
                                    </div>                                
                                </div>
                                <NumberInput
                                    label="Capacidad (Gls)"
                                    name="tipo_comb_cap_diesel"
                                    value={data.tipo_comb_cap_diesel}
                                    onChange={(value) => setData('tipo_comb_cap_diesel', value)}
                                    min={0}
                                    error={errors.tipo_comb_cap_diesel}
                                    disabled={!data.tipo_comb_diesel}
                                />
                            </div>
                            <div
                                onClick={() => {
                                    const newValue = !data.tipo_comb_gasolina;
                                    setData('tipo_comb_gasolina', newValue);

                                    if (!newValue) {
                                        setData('tipo_comb_cap_gasolina', 0);
                                    }
                                }}
                                className={`w-full border rounded-xl p-4 space-y-3 cursor-pointer transition-all duration-200
                                    ${data.tipo_comb_gasolina
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                        : "hover:bg-muted"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="tipo_comb_gasolina"
                                            checked={data.tipo_comb_gasolina}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={(checked) => {
                                                setData('tipo_comb_gasolina', checked);

                                                if (!checked) {
                                                    setData('tipo_comb_cap_gasolina', 0);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="tipo_comb_gasolina" className="font-medium">
                                            Gasolina
                                        </Label>
                                    </div>
                                </div>
                                <NumberInput
                                    label="Capacidad (Gls)"
                                    name="tipo_comb_cap_gasolina"
                                    value={data.tipo_comb_cap_gasolina}
                                    onChange={(value) => setData('tipo_comb_cap_gasolina', value)}
                                    min={0}
                                    error={errors.tipo_comb_cap_gasolina}
                                    disabled={!data.tipo_comb_gasolina}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_comb_transporte"
                                    checked={data.tipo_comb_transporte}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_comb_transporte', checked)
                                    }
                                />
                                <Label htmlFor="tipo_comb_transporte">Transporte</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_comb_vehiculo"
                                    checked={data.tipo_comb_vehiculo}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_comb_vehiculo', checked)
                                    }
                                />
                                <Label htmlFor="tipo_comb_vehiculo">Vehículo</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_comb_almacenamiento"
                                    checked={data.tipo_comb_almacenamiento}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_comb_almacenamiento', checked)
                                    }
                                />
                                <Label htmlFor="tipo_comb_almacenamiento">Almacenamiento</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="tipo_comb_venta"
                                    checked={data.tipo_comb_venta}
                                    onCheckedChange={(checked) =>
                                        setData('tipo_comb_venta', checked)
                                    }
                                />
                                <Label htmlFor="tipo_comb_venta">Venta</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Placas"
                                    name="tipo_comb_placas"
                                    value={data.tipo_comb_placas ?? ''}
                                    onChange={e => setData('tipo_comb_placas', e.target.value)}
                                    error={errors.tipo_comb_placas}
                                    placeholder="Placas"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Tipo extintor"
                                    name="tipo_comb_extintor"
                                    value={data.tipo_comb_extintor ?? ''}
                                    onChange={e => setData('tipo_comb_extintor', e.target.value)}
                                    error={errors.tipo_comb_extintor}
                                    placeholder="Tipo extintor"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Origen"
                                    name="tipo_comb_origen"
                                    value={data.tipo_comb_origen ?? ''}
                                    onChange={e => setData('tipo_comb_origen', e.target.value)}
                                    error={errors.tipo_comb_origen}
                                    placeholder="Origen"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Destino"
                                    name="tipo_comb_destino"
                                    value={data.tipo_comb_destino ?? ''}
                                    onChange={e => setData('tipo_comb_destino', e.target.value)}
                                    error={errors.tipo_comb_destino}
                                    placeholder="Destino"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Cumple Norma INEN"
                                    name="tipo_comb_norma_inen"
                                    value={data.tipo_comb_norma_inen ?? ''}
                                    onChange={e => setData('tipo_comb_norma_inen', e.target.value)}
                                    error={errors.tipo_comb_norma_inen}
                                    placeholder="Cumple Norma INEN"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Observaciones"
                                    name="tipo_comb_observaciones"
                                    value={data.tipo_comb_observaciones ?? ''}
                                    onChange={e => setData('tipo_comb_observaciones', e.target.value)}
                                    error={errors.tipo_comb_observaciones}
                                    placeholder="Observaciones"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Instalaciones eléctricas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_buenas"
                                    checked={data.inst_elec_buenas}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_buenas', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_buenas">Buenas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_malas"
                                    checked={data.inst_elec_malas}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_malas', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_malas">Malas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_internas"
                                    checked={data.inst_elec_internas}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_internas', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_internas">Internas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_externas"
                                    checked={data.inst_elec_externas}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_externas', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_externas">Externas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_generador"
                                    checked={data.inst_elec_generador}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_generador', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_generador">Generador</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="inst_elec_transformador"
                                    checked={data.inst_elec_transformador}
                                    onCheckedChange={(checked) =>
                                        setData('inst_elec_transformador', checked)
                                    }
                                />
                                <Label htmlFor="inst_elec_transformador">Transformador</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Ventilación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="vent_natural"
                                    checked={data.vent_natural}
                                    onCheckedChange={(checked) =>
                                        setData('vent_natural', checked)
                                    }
                                />
                                <Label htmlFor="vent_natural">Natural</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="vent_mecanica"
                                    checked={data.vent_mecanica}
                                    onCheckedChange={(checked) =>
                                        setData('vent_mecanica', checked)
                                    }
                                />
                                <Label htmlFor="vent_mecanica">Mecánica</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="vent_adecuada"
                                    checked={data.vent_adecuada}
                                    onCheckedChange={(checked) =>
                                        setData('vent_adecuada', checked)
                                    }
                                />
                                <Label htmlFor="vent_adecuada">Adecuada</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="vent_escasa"
                                    checked={data.vent_escasa}
                                    onCheckedChange={(checked) =>
                                        setData('vent_escasa', checked)
                                    }
                                />
                                <Label htmlFor="vent_escasa">Escasa</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Áreas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Área 1"
                                    name="area1"
                                    value={areaInput.area1}
                                    onChange={(e) => {
                                        const raw = e.target.value;

                                        if (!/^[0-9.,]*$/.test(raw)) return;

                                        setAreaInput((prev) => ({
                                            ...prev,
                                            area1: raw,
                                        }));

                                        const numeric = parseFloat(raw.replace(",", "."));

                                        if (!isNaN(numeric)) {
                                            setData("area1", numeric);
                                        }
                                    }}                                    
                                    error={errors.area1}
                                    placeholder="Área 1"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Área 2"
                                    name="area2"
                                    value={areaInput.area2}
                                    onChange={(e) => {
                                        const raw = e.target.value;

                                        if (!/^[0-9.,]*$/.test(raw)) return;

                                        setAreaInput((prev) => ({
                                            ...prev,
                                            area2: raw,
                                        }));

                                        const numeric = parseFloat(raw.replace(",", "."));

                                        if (!isNaN(numeric)) {
                                            setData("area2", numeric);
                                        }
                                    }}                                   
                                    error={errors.area2}
                                    placeholder="Área 2"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Área 3"
                                    name="area3"
                                    value={areaInput.area3}
                                    onChange={(e) => {
                                        const raw = e.target.value;

                                        if (!/^[0-9.,]*$/.test(raw)) return;

                                        setAreaInput((prev) => ({
                                            ...prev,
                                            area3: raw,
                                        }));

                                        const numeric = parseFloat(raw.replace(",", "."));

                                        if (!isNaN(numeric)) {
                                            setData("area3", numeric);
                                        }
                                    }}
                                    error={errors.area3}
                                    placeholder="Área 3"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Área 4"
                                    name="area4"
                                    value={areaInput.area4}
                                    onChange={(e) => {
                                        const raw = e.target.value;

                                        if (!/^[0-9.,]*$/.test(raw)) return;

                                        setAreaInput((prev) => ({
                                            ...prev,
                                            area4: raw,
                                        }));

                                        const numeric = parseFloat(raw.replace(",", "."));

                                        if (!isNaN(numeric)) {
                                            setData("area4", numeric);
                                        }
                                    }}
                                    error={errors.area4}
                                    placeholder="Área 4"
                                />
                            </div>
                            <div className="border-t pt-3 w-full grid grid-cols-2 items-center text-base font-semibold col-span-2">
                                <span className="text-gray-900 dark:text-gray-100">
                                    Área total
                                </span>
                                <span className={`font-semibold tabular-nums text-right ${
                                    errors.area_total ? "text-red-500" : "text-indigo-600"
                                }`}>
                                    {data.area_total.toFixed(2)} m²
                                </span>
                                {errors.area_total && (
                                    <p className="col-span-2 text-sm text-red-500 mt-2 font-normal">
                                        {errors.area_total}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Aforo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <NumberInput
                                    label="Número máximo autorizado"
                                    name="aforo_personas"
                                    value={data.aforo_personas}
                                    onChange={(value) => setData('aforo_personas', value)}
                                    min={0}
                                    error={errors.aforo_personas}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Sistema de defensa contra incendios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_detectores_humo"
                                    checked={data.sist_ince_detectores_humo}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_detectores_humo', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_detectores_humo">Detectores de humo</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_lamparas_emergencia"
                                    checked={data.sist_ince_lamparas_emergencia}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_lamparas_emergencia', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_lamparas_emergencia">Lámparas de emergencia</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_gabinetes"
                                    checked={data.sist_ince_gabinetes}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_gabinetes', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_gabinetes">Gabinetes</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_sprinklers"
                                    checked={data.sist_ince_sprinklers}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_sprinklers', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_sprinklers">Sprinklers</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_alarma_incendio"
                                    checked={data.sist_ince_alarma_incendio}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_alarma_incendio', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_alarma_incendio">Alarma de incendio</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_bombas_hidraulicas"
                                    checked={data.sist_ince_bombas_hidraulicas}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_bombas_hidraulicas', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_bombas_hidraulicas">Bombas hidráulicas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_bombas_impulsion"
                                    checked={data.sist_ince_bombas_impulsion}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_bombas_impulsion', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_bombas_impulsion">Bombas de impulsión o siamesas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_escaleras_emergencia"
                                    checked={data.sist_ince_escaleras_emergencia}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_escaleras_emergencia', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_escaleras_emergencia">Escaleras de emergencia</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_puerta_escape"
                                    checked={data.sist_ince_puerta_escape}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_puerta_escape', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_puerta_escape">Puerta de escape</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_puertas_contra_fuego"
                                    checked={data.sist_ince_puertas_contra_fuego}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_puertas_contra_fuego', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_puertas_contra_fuego">Puertas contra fuego</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_senalizacion_emergencia"
                                    checked={data.sist_ince_senalizacion_emergencia}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_senalizacion_emergencia', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_senalizacion_emergencia">Señalización de emergencia</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_tanques_reserva_agua"
                                    checked={data.sist_ince_tanques_reserva_agua}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_tanques_reserva_agua', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_tanques_reserva_agua">Tanques de reserva de agua</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="sist_ince_espumogeno"
                                    checked={data.sist_ince_espumogeno}
                                    onCheckedChange={(checked) =>
                                        setData('sist_ince_espumogeno', checked)
                                    }
                                />
                                <Label htmlFor="sist_ince_espumogeno">Espumógeno</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold">
                                Extintores
                            </CardTitle>
                            <div className="flex items-center gap-3 bg-muted/50 rounded-lg">
                                <Switch
                                    id="capacitacion_extintores"
                                    checked={data.capacitacion_extintores}
                                    onCheckedChange={(checked) =>
                                        setData('capacitacion_extintores', checked)
                                    }
                                />
                                <Label htmlFor="capacitacion_extintores">Capacitación</Label>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <NumberInput                                    
                                    name="cantidad"
                                    value={extintorForm.cantidad}
                                    onChange={(value) =>
                                        setExtintorForm({
                                            ...extintorForm,
                                            cantidad: value
                                        })
                                    }
                                    min={1}                                    
                                />
                                <div className="grid w-full gap-1 relative">
                                    <div className="relative">
                                        <select
                                            name="tipo"
                                            value={extintorForm.tipo}
                                            onChange={(e) =>
                                                setExtintorForm({
                                                    ...extintorForm,
                                                    tipo: e.target.value
                                                })
                                            }
                                            className={cn(
                                                "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                                formErrors.tipo && "border-destructive"
                                            )}
                                        >
                                            <option value={0}>Seleccione</option>
                                            <option value='CO2'>CO2</option>
                                            <option value='PQS'>PQS</option>
                                            <option value='PURPURA K'>PURPURA K</option>
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                    </div>
                                    <InputError message={formErrors.tipo} />
                                </div>
                                <div className="grid w-full gap-1 relative">
                                    <div className="relative">
                                        <select
                                            name="capacidad"
                                            value={extintorForm.capacidad}
                                            onChange={(e) =>
                                                setExtintorForm({
                                                    ...extintorForm,
                                                    capacidad: Number(e.target.value)
                                                })
                                            }
                                            className={cn(
                                                "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                                formErrors.capacidad && "border-destructive"
                                            )}
                                        >
                                            <option value={0}>Seleccione</option>
                                            <option value='5'>5 LBS</option>
                                            <option value='10'>10 LBS</option>
                                            <option value='15'>15 LBS</option>
                                            <option value='20'>20 LBS</option>
                                            <option value='20'>60 LBS</option>
                                            <option value='20'>80 LBS</option>
                                            <option value='20'>100 LBS</option>
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                    </div>
                                    <InputError message={formErrors.capacidad} />
                                </div>
                                <div className="grid w-full gap-1 relative">
                                    <div className="relative">
                                        <select
                                            name="estado"
                                            value={extintorForm.estado}
                                            onChange={(e) =>
                                                setExtintorForm({
                                                    ...extintorForm,
                                                    estado: e.target.value
                                                })
                                            }
                                            className={cn(
                                                "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                                formErrors.estado && "border-destructive"
                                            )}
                                        >
                                            <option value={0}>Seleccione</option>
                                            <option value='BUENO'>BUENO</option>
                                            <option value='REGULAR'>REGULAR</option>
                                            <option value='MALO'>MALO</option>
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                    </div>
                                    <InputError message={formErrors.estado} />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarExtintor}
                                    disabled={loadingNumero}
                                    className="self-start w-full flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <>
                                    {loadingNumero ? (
                                        <Spinner className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <PlusIcon className="w-4 h-4" />
                                    )}
                                    <span>
                                        Agregar extintor
                                    </span>
                                </>
                                </button>
                            </div>                            
                            {data.extintores.length ? (
                                <div className="border rounded-xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="py-2 px-4 text-left border-b">Número</th>
                                                    <th className="py-2 px-4 text-left border-b">Tipo</th>
                                                    <th className="py-2 px-4 text-left border-b">Capacidad</th>
                                                    <th className="py-2 px-4 text-left border-b">Estado</th>
                                                    <th className="py-2 px-4 text-left border-b"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.extintores.map((ext: Extintor, index: number) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="py-2 px-4 text-left border-b">{String(ext.numero).padStart(7, '0')}</td>
                                                        <td className="py-2 px-4 text-left border-b">{ext.tipo}</td>
                                                        <td className="py-2 px-4 text-left border-b">{ext.capacidad} LBS</td>
                                                        <td className="py-2 px-4 text-left border-b">{ext.estado}</td>
                                                        <td className="py-2 px-4 text-left border-b">
                                                            <button
                                                                type="button"
                                                                onClick={() => eliminarExtintor(index)}
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
                                <div className="flex justify-center my-2">
                                    <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                                        <TriangleAlertIcon className="h-4 w-4" />
                                        <AlertTitle>Este informe no cuenta con extintores registrados</AlertTitle>
                                        <AlertDescription className="text-destructive/80">
                                            Por favor agregue un nuevo extintor.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}  
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold leading-none">
                                Cálculo para obtener el valor del permiso de funcionamiento
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="exento">Exento de pago</Label>                                
                                <Switch
                                    id="exento_pago"
                                    checked={data.exento_pago}
                                    onCheckedChange={(checked) =>
                                        setData('exento_pago', checked)
                                    }
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Valor de la inspección técnica
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                                        {money(data.valor_inspeccion)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Valor de descuento ({data.porcentaje_descuento}%)
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                                        -{money(data.valor_descuento)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Valor por notas de crédito
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">
                                        -{money(data.valor_nota_credito)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1 dark:text-gray-400">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Valor por multa ({data.porcentaje_multa}% de un SBU)
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                                        +{money(data.valor_multa)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Subtotal
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                        {money(data.subtotal)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-base font-semibold">
                                <span>
                                    {data.actualizacion_planos === 1
                                        ? 'Valor a pagar por el cliente (10% del valor de la primera inspección de visto bueno de planos)'
                                        : 'Valor a pagar por el cliente'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-slate-700">
                                        {money(data.valor_total)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        USD
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardContent className="space-y-3">
                            <div className="col-span-2">
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
                            <div className="col-span-2">
                                <TextAreaField
                                    label="Recomendaciones"
                                    name="recomendaciones"
                                    value={data.recomendaciones}
                                    maxLength={1000}
                                    placeholder="Recomendaciones"
                                    error={errors.recomendaciones}
                                    onChange={value => setData('recomendaciones', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold leading-none">
                                Criterio técnico del inspector
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <RadioGroup
                                value={data.estado_informe}
                                onValueChange={(value) => setData("estado_informe", value)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <label
                                    htmlFor="aprobado"
                                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200
                                        ${data.estado_informe === "APROBADO"
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <RadioGroupItem value="APROBADO" id="aprobado" />
                                    <CheckCheckIcon className="w-5 h-5 text-green-500" /> 
                                    <div className="flex flex-col">
                                        <span className="font-medium">Aprobado</span>
                                        <span className="text-xs text-muted-foreground">
                                            Informe favorable
                                        </span>
                                    </div>
                                </label>
                                <label
                                    htmlFor="reinspeccion"
                                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200
                                        ${data.estado_informe === "REINSPECCION"
                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                            : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <RadioGroupItem value="REINSPECCION" id="reinspeccion" />
                                    <RefreshCwIcon className="w-5 h-5 text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Para reinspección</span>
                                        <span className="text-xs text-muted-foreground">
                                            Informe con novedades encontradas durante la inspección
                                        </span>
                                    </div>
                                </label>
                            </RadioGroup>
                            {errors.estado_informe && (
                                <p className="text-sm text-red-500 mt-2">
                                    {errors.estado_informe}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <div className="flex gap-2">                           
                        <Button disabled={processing} type='submit' size="sm" className='cursor-pointer'>
                            {!processing && <RefreshCcwIcon />} {processing && <Spinner />} Actualizar informe
                        </Button>  
                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                            <Link 
                                href={`/inspecciones`}
                                data={{ search: data.search, year: data.year, estado: data.estado }}
                            >
                                <Undo2Icon /> Regresar
                            </Link>
                        </Button>
                    </div> 
                </form>             
            </div>
        </AppLayout>
    );    
}