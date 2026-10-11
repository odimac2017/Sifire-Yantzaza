import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckIcon, DollarSign, Home, IdCard, Mail, MapPin, Phone, SaveIcon, SearchIcon, TriangleAlertIcon, Undo2Icon, User2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { money } from "@/utils/format";
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import YearPicker from '@/components/ui/yearPicker';
import { Switch } from "@/components/ui/switch";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear recaudaciones de catastros',
        href: '/recaudacionescatastros',
    },
];

interface Parroquia {
    id: number;
    nombre: string;
}

interface ComprobanteInfo {
    numero_formateado: string;
    fecha: string;
}

interface Catastro {
    id: number;
    clave_catastral: string;
    numero_predio: string;
    parroquia?: Parroquia;
    direccion: string;
    valor_propiedad: number;
    valor_calculado: number;    
    valor_total_recaudado: number;
    comprobante_info?: ComprobanteInfo | null;
}

interface Cliente {
    id: number,
    documento: string,
    nombre: string,
    parroquia?: Parroquia;
    direccion: string,
    telefonos: string,
    email: string,
    catastros_recaudados?: Catastro[],
    catastros_no_recaudados?: Catastro[],
    totales?: {
        recaudado: number
        por_recaudar: number
        total_general: number
    }
}

interface Props {    
    cliente?: Cliente | null;
    filters: {
        year: number;
        search: string;
    };
}

export default function Create({cliente, filters = { year: new Date().getFullYear(), search: '' }}: Props) {

    const catastrosRecaudados = cliente?.catastros_recaudados ?? [];
    const catastrosNoRecaudados = cliente?.catastros_no_recaudados ?? [];
    const totales = cliente?.totales;

    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const [filtersState, setFiltersState] = useState({
        search: filters.search || '',
        year: filters.year ?? currentYear,
    });

    const [loadingSearch, setLoadingSearch] = useState(false);

    const applyFilters = (newFilters?: Partial<typeof filtersState>) => {
        const updated = { ...filtersState, ...newFilters };
    
        setFiltersState(updated);
    
        setLoadingSearch(true);
    
        router.get('/recaudacionescatastros/create', updated, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoadingSearch(false),
        });
    };

    const {
        data: formData,
        setData: setFormData,
        post,
        processing: processingStore
    } = useForm({
        cliente_id: cliente?.id ?? null,
        year: filtersState.year,
        catastros: [] as number[],
    });

    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    const toggleSeleccion = (catastroId: number) => {
        setSeleccionados((prev) =>
            prev.includes(catastroId)
                ? prev.filter((id) => id !== catastroId)
                : [...prev, catastroId]
        );
    };

    const toggleTodos = () => {
        if (seleccionados.length === catastrosNoRecaudados.length) {
            setSeleccionados([]);
        } else {
            setSeleccionados(catastrosNoRecaudados.map(c => c.id));
        }
    };

    const totalPorRecaudar = catastrosNoRecaudados
        .filter((c) => seleccionados.includes(c.id))
        .reduce((acc, c) => acc + Number(c.valor_calculado), 0);

    useEffect(() => {
        setFormData('catastros', seleccionados);
    }, [seleccionados, setFormData]);

    useEffect(() => {
        setFormData('year', filtersState.year);
    }, [filtersState.year]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/recaudacionescatastros', {
            ...formData,
            year: filtersState.year,
        }, {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (cliente) {
            setFormData('cliente_id', cliente.id);
            setSeleccionados(
                cliente.catastros_no_recaudados?.map(c => c.id) ?? []
            );
        }
    }, [cliente]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear recaudaciones de catastros" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <YearPicker
                            value={filtersState.year}
                            fromYear={startYear}
                            toYear={endYear}
                            onChange={(year) => applyFilters({ year })}
                        />                      
                    </div>
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        type="text"
                                        className="pl-10"
                                        placeholder="Ingrese el documento del cliente"
                                        value={filtersState.search}
                                        onChange={(e) =>
                                            setFiltersState(prev => ({ ...prev, search: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                applyFilters();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <Button
                                disabled={processingStore}
                                type="button"
                                onClick={() => applyFilters()}
                            >
                                {!processingStore && <SearchIcon />}
                                {processingStore && <Spinner />}
                                Buscar
                            </Button>
                        </div>
                    </div>
                </div>
                {loadingSearch ? (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Spinner className="h-4 w-4" />
                            <span>Buscando cliente...</span>
                        </div>
                    </div>
                ) : cliente ? (
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className="border rounded-md bg-background shadow-sm p-4 text-[13px]">
                            <div className="flex justify-between items-start border-b pb-2 mb-3">
                                <div className="flex items-start gap-3 w-full">
                                    <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                        <User2Icon className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <div className="w-full">
                                        <h1 className="text-lg font-semibold leading-tight">{cliente.nombre}</h1>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                            <IdCard className="h-3.5 w-3.5" />
                                            <span>Documento:</span>
                                            <span className="font-medium text-foreground">{cliente.documento}</span>
                                        </div>
                                    </div>
                                </div>                                                
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                <Home className="h-3.5 w-3.5" />
                                <span>Dirección:</span>
                                <span className="font-medium text-foreground">{cliente.direccion}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground text-sm mt-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>Parroquia:</span>
                                    <span className="font-medium text-foreground">{cliente.parroquia?.nombre}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>Teléfonos:</span>
                                    <span className="font-medium text-foreground">{cliente.telefonos}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>Email:</span>
                                    <span className="font-medium text-foreground">{cliente.email}</span>
                                </div>
                            </div>
                        </div>
                        {catastrosRecaudados.length > 0 && (
                            <>
                                <h2 className="flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                    <span className="text-lg font-semibold text-green-700">
                                        Catastros Recaudados
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ({catastrosRecaudados.length})
                                    </span>
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border overflow-hidden rounded-md text-sm">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="py-2 px-4 text-left border-b">#</th>
                                                <th className="py-2 px-4 text-left border-b">Catastro</th>
                                                <th className="py-2 px-4 text-left border-b">Parroquia / Dirección</th>
                                                <th className="py-2 px-4 text-left border-b">Valor total</th>
                                                <th className="py-2 px-4 text-left border-b">Valor pagado</th>
                                                <th className="py-2 px-4 text-left border-b">Comprobante</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catastrosRecaudados.map((catastro, index) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={catastro.id}>
                                                    <td className="py-2 px-4 border-b">{index + 1}</td>
                                                    <td className="bg-muted/75 hover:bg-transparent py-2 px-4 border-b">
                                                        <div className='font-medium'>{catastro.clave_catastral}</div>
                                                        <div className='text-muted-foreground mt-0.5'>{catastro.numero_predio}</div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">
                                                                {catastro.parroquia?.nombre}
                                                            </span>
                                                            <span className="text-gray-900">
                                                                {catastro.direccion}
                                                            </span>
                                                        </div>
                                                    </td>                                        
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(catastro.valor_propiedad)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(catastro.valor_total_recaudado)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {catastro.comprobante_info && (
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-0.5 rounded-full bg-emerald-100 p-1">
                                                                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-semibold text-gray-900">
                                                                        {catastro.comprobante_info.numero_formateado}
                                                                    </span>
                                                                    <div className="flex items-center text-xs text-gray-500">
                                                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                                                        {catastro.comprobante_info.fecha}
                                                                    </div>
                                                                </div>
                                                            </div>                                                            
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )} 
                        {catastrosNoRecaudados.length > 0 && (
                            <>
                                <h2 className="flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                                    <span className="text-lg font-semibold text-red-700">
                                        Catastros por recaudar
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ({catastrosNoRecaudados.length})
                                    </span>
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border overflow-hidden rounded-md text-sm">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="py-2 px-4 text-left border-b">#</th>
                                                <th className="py-2 px-4 text-left border-b">Catastro</th>
                                                <th className="py-2 px-4 text-left border-b">Parroquia / Dirección</th>
                                                <th className="py-2 px-4 text-left border-b">Valor total</th>
                                                <th className="py-2 px-4 text-left border-b">Valor a pagar</th>
                                                <th className="py-2 px-4 text-center border-b">
                                                    <Switch
                                                        checked={
                                                            seleccionados.length === catastrosNoRecaudados.length &&
                                                            catastrosNoRecaudados.length > 0
                                                        }
                                                        onCheckedChange={toggleTodos}
                                                    />
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catastrosNoRecaudados.map((catastro, index) => {
                                                const isSelected = seleccionados.includes(catastro.id);
                                                return (
                                                    <tr
                                                        key={catastro.id}
                                                        className={`
                                                        transition
                                                        ${isSelected ? "bg-red-50" : "odd:bg-muted/50 hover:bg-gray-50"}
                                                        `}
                                                    >
                                                        <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="font-medium">{catastro.clave_catastral}</div>
                                                            <div className="text-muted-foreground mt-0.5">{catastro.numero_predio}</div>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">{catastro.parroquia?.nombre}</span>
                                                                <span className="text-gray-900">{catastro.direccion}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <span className="font-semibold text-slate-700">{money(catastro.valor_propiedad)}</span>
                                                            <span className="text-xs text-muted-foreground ml-1">USD</span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <span className="font-semibold text-slate-700">{money(catastro.valor_calculado)}</span>
                                                            <span className="text-xs text-muted-foreground ml-1">USD</span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b text-center">
                                                            <Switch
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSeleccion(catastro.id)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>  
                            </>
                        )}
                        {totales && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="rounded-xl border bg-muted/50 p-4 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="text-xl font-bold">
                                            {money(totales.total_general)}
                                            <span className="text-xs text-muted-foreground ml-1">USD</span>
                                        </p>
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 shadow-sm border border-green-200">
                                    <div>
                                        <p className="text-xs text-green-600">Recaudado</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {money(totales.recaudado)}
                                            <span className="text-xs text-muted-foreground ml-1">USD</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 shadow-sm border border-red-200">
                                    <div>
                                        <p className="text-xs text-red-600">Por recaudar</p>
                                        <p className="text-xl font-bold text-red-700">
                                            {money(totalPorRecaudar)}
                                            <span className="text-xs text-muted-foreground ml-1">USD</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {catastrosRecaudados.length === 0 && catastrosNoRecaudados.length === 0 && (
                            <div className="flex justify-center">
                                <Alert className="w-full sm:w-1/2 bg-destructive/10 text-destructive border-none">
                                    <TriangleAlertIcon className="h-4 w-4" />
                                    <AlertTitle>
                                        Este cliente no cuenta con catastros registrados
                                    </AlertTitle>
                                </Alert>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button disabled={processingStore || seleccionados.length === 0} type='submit' size="sm" className='cursor-pointer'>
                                {!processingStore && <SaveIcon />} {processingStore && <Spinner />} Generar comprobantes
                            </Button>                    
                            <Button
                                size="sm"
                                className="bg-slate-500 hover:bg-slate-700 cursor-pointer"
                                onClick={() => window.history.back()}
                            >
                                <Undo2Icon /> Regresar
                            </Button>
                        </div> 
                    </form> 
                ) : filters.search ? (
                    <div className="flex justify-center my-6">
                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>No existen resultados</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                No se encontró ningún cliente con ese documento. Por favor intente de nuevo.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-3 border rounded-md bg-muted/30 shadow-sm p-4 text-sm text-muted-foreground w-full sm:w-1/2 lg:w-1/2">
                            <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                <SearchIcon className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Busque un cliente</p>
                                <p className="text-muted-foreground">Ingrese el documento del cliente para iniciar la búsqueda.</p>
                            </div>
                        </div>
                    </div>             
                )}
            </div>
        </AppLayout>
    )
}
