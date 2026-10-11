import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { BanIcon, Clock, DollarSign, DownloadIcon, InfoIcon, MoreHorizontalIcon, PlusIcon, Send, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/form/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { money } from "@/utils/format";
import EstadoFirmaBadge from '@/pages/recaudacionesCatastros/EstadoFirmaBadge';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Recaudaciones de catastros',
        href: '/recaudacionescatastros',
    },
];

interface Total {
    total: number;
    expedidos: number;
    anulados: number;
    monto_expedidos: number;
    monto_anulados: number;
    monto_total: number;
}

interface RecaudacionCatastro {
    id: number;
    numero_formateado: string;
    valor_total: string;
    estado: string;
    estado_firma: string;
    catastro: {
        clave_catastral: string;
        numero_predio: string;
        cliente: {
            documento: string;
            nombre: string;
            email: string;
        };
        parroquia: {
            nombre: string;
        };
    };
}

interface RecaudacionCatastroPagination {
    data: RecaudacionCatastro[];
    links: LinkProps[];
}

interface FilterProps {
    year: number;
    search: string;
    estado: string;
}

interface IndexProps {
    recaudacionesCatastros: RecaudacionCatastroPagination;
    totales: Total;
    filters: FilterProps;    
}

export default function Index({recaudacionesCatastros, totales, filters: initialFilters}: IndexProps) {
        
    const { flash, show } = useFlashAlert(); 

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on("start", () => {
            setLoading(true);
        });

        const removeFinish = router.on("finish", () => {
            setLoading(false);
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    useEffect(() => {
        const hayPendientes = recaudacionesCatastros.data.some(
            (i) => i.estado_firma === "PENDIENTE"
        );

        if (!hayPendientes) return;

        const interval = setInterval(() => {
            router.get('/recaudacionescatastros', {}, {
                only: ['recaudacionesCatastros'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 15000); 

        return () => clearInterval(interval);
    }, [recaudacionesCatastros.data]);

    const [recaudacionToCancel, setRecaudacionToCancel] = useState<number | null>(null);

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'recaudacionescatastros');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar",
        },
        {
            type: "year",
            key: "year",
            fromYear: startYear,
            toYear: endYear,
        },
        {
            type: "select",
            key: "estado",
            options: [
                { value: "ALL", label: "TODOS" },
                { value: "EXPEDIDO", label: "EXPEDIDOS" },
                { value: "ANULADO", label: "ANULADOS" }
            ]
        }
    ];

    const reenviarCorreo = (recaudacionesCatastros: RecaudacionCatastro) => {
        router.post(`/recaudacionescatastros/${recaudacionesCatastros.id}/reenviarCorreo`, {}, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recaudaciones de catastros" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/recaudacionescatastros/create"
                                data={{ search: filters.search, year: filters.year, estado: filters.estado  }}
                            >
                                <PlusIcon className="mr-1 h-4 w-4"/>
                                Nuevo
                            </Link>
                        </Button>
                    }
                >
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar> 
                {recaudacionesCatastros.data.length ? (
                    <>
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
                            <div className="rounded-xl border bg-muted/50 p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="text-xl font-bold">
                                        {money(totales.monto_total)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 shadow-sm border border-green-200">
                                <div>
                                    <p className="text-xs text-green-600">Expedidos</p>
                                    <p className="text-xl font-bold text-green-700">
                                        {money(totales.monto_expedidos)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <span className="text-sm text-green-600 font-medium">
                                    {totales.expedidos}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 shadow-sm border border-red-200">
                                <div>
                                    <p className="text-xs text-red-600">Anulados</p>
                                    <p className="text-xl font-bold text-red-700">
                                        {money(totales.monto_anulados)}
                                        <span className="text-xs text-muted-foreground ml-1">USD</span>
                                    </p>
                                </div>
                                <span className="text-sm text-red-600 font-medium">
                                    {totales.anulados}
                                </span>
                            </div>
                        </div>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Número</th>
                                            <th className="py-2 px-4 text-left border-b">Cliente</th>
                                            <th className="py-2 px-4 text-left border-b">Catastro</th>
                                            <th className="py-2 px-4 text-left border-b">Parroquia</th> 
                                            <th className="py-2 px-4 text-left border-b">Valor total</th>
                                            <th className="py-2 px-4 text-left border-b">Estado</th> 
                                            <th className="py-2 px-4 text-left border-b">Estado Firma</th>                                
                                            <th className="py-2 px-4 text-left border-b"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <TableSkeleton
                                                rows={8}
                                                columns={7}
                                            />
                                        ) : (
                                            recaudacionesCatastros.data.map((recaudacion) => (
                                                <tr
                                                    key={recaudacion.id}
                                                    className={`
                                                        transition-colors
                                                        ${recaudacion.estado === "ANULADO"
                                                            ? "bg-red-50 text-gray-400"
                                                            : "odd:bg-muted/50 hover:bg-gray-50"
                                                        }
                                                    `}
                                                >
                                                    <td className="py-2 px-4 border-b"><span className='font-medium'>{recaudacion.numero_formateado}</span></td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="relative pr-6">
                                                            <div>{recaudacion.catastro?.cliente?.documento}</div>
                                                            <div className='font-medium'>{recaudacion.catastro?.cliente?.nombre}</div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="absolute top-0 right-0 text-muted-foreground hover:text-primary">
                                                                            <InfoIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <div className="text-xs space-y-1">
                                                                            <div><strong>Email:</strong> {recaudacion.catastro?.cliente?.email}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className='font-medium'>{recaudacion.catastro?.clave_catastral}</div>
                                                        <div className='text-muted-foreground mt-0.5'>{recaudacion.catastro?.numero_predio}</div>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{recaudacion.catastro?.parroquia?.nombre}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className="font-semibold text-slate-700">
                                                            {money(recaudacion.valor_total)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            USD
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <Badge
                                                            className={`border-none focus-visible:outline-none
                                                                ${recaudacion.estado === "EXPEDIDO"
                                                                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                                                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                                                                }
                                                            `}
                                                        >
                                                            {recaudacion.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        {recaudacion.estado !== 'APROBADO' && recaudacion.estado !== 'ANULADO' && (
                                                            <EstadoFirmaBadge recaudacionCatastro={recaudacion} />
                                                        )}
                                                    </td>                      
                                                    <td className="text-center border-b">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-40" align="end">
                                                                <DropdownMenuGroup> 
                                                                    {recaudacion.estado !== 'ANULADO' && (
                                                                        <>                                                       
                                                                            <DropdownMenuItem
                                                                                variant="destructive"
                                                                                onClick={() => setRecaudacionToCancel(recaudacion.id)}
                                                                                disabled={recaudacion.estado === "ANULADO"}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <BanIcon className="h-4 w-4" />
                                                                                <span>Anular</span>
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    {['ERROR_FIRMA', 'PENDIENTE'].includes(recaudacion.estado_firma) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                router.post(`/recaudacionescatastros/${recaudacion.id}/firmar`);
                                                                            }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>
                                                                                {recaudacion.estado_firma === 'ERROR_FIRMA'
                                                                                    ? 'Reintentar firma'
                                                                                    : 'Firmar'}
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {recaudacion.estado !== 'ANULADO' &&
                                                                    ['SIN_FIRMA','FIRMADO'].includes(recaudacion.estado_firma) && (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <a
                                                                                    href={`/recaudacionescatastros/${recaudacion.id}/descargar`}
                                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                                >
                                                                                    <DownloadIcon className="h-4 w-4" />
                                                                                    <span>Descargar PDF</span>
                                                                                </a>
                                                                            </DropdownMenuItem>                                                                            
                                                                            <DropdownMenuItem
                                                                                onClick={() => reenviarCorreo(recaudacion)}
                                                                                className="flex items-center gap-2 cursor-pointer"
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                                Reenviar correo
                                                                            </DropdownMenuItem>                                                                            
                                                                        </>
                                                                    )}
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>                                 
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='my-2'>
                            <Pagination links={recaudacionesCatastros.links} />
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center my-6">
                        <Alert className="w-full sm:w-1/2 lg:w-1/2 bg-destructive/10 text-destructive border-none">
                            <TriangleAlertIcon className="h-4 w-4" />
                            <AlertTitle>No existen resultados</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Por favor intente de nuevo con otros criterios de búsqueda.
                            </AlertDescription>
                        </Alert>
                    </div>                 
                )}            
            </div>

            <ConfirmDialog
                open={recaudacionToCancel !== null}
                onOpenChange={() => setRecaudacionToCancel(null)}
                title="¿Está seguro?"
                description="La recaudación será anulada."
                confirmText="Anular"
                variant="cancel"
                onConfirm={() => {
                    if (recaudacionToCancel) {
                        router.patch(`/recaudacionescatastros/${recaudacionToCancel}/anular`, {
                            preserveScroll: true,
                        });
                    }
                    setRecaudacionToCancel(null);
                }}
            />
        </AppLayout>
    );
}
