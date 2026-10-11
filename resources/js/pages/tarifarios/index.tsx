import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { Input } from "@/components/ui/input";
import { Clock, PencilIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { useEffect, useState } from 'react';
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tarifarios',
        href: '/tarifarios',
    },
];

interface TarifarioPeriodo {
    id: number;
    valor: number;
    gl: number;
    cat: number;
    riesgo: number;
    valor_fijo: number;
}

interface TarifarioChildren {
    id: number;
    codigo: string;
    nombre: string;
    tarifario_id: number;
    tarifario_periodo: TarifarioPeriodo;
}

interface Tarifario {
    id: number;
    codigo: string;
    nombre: string;
    childrens: TarifarioChildren[];
}

interface TarifarioPagination {
    data: Tarifario[];
    links: LinkProps[];
}

interface FilterProps {
    year: number | null;
    search: string;
}

interface IndexProps {
    tarifarios: TarifarioPagination;    
    filters: FilterProps;
}

export default function Index({tarifarios, filters: initialFilters}: IndexProps) {

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

    const startLoading = (id: number) =>
        setLoadingIds((prev) => [...prev, id]);
    
    const stopLoading = (id: number) =>
        setLoadingIds((prev) => prev.filter((item) => item !== id));
    
    const isLoading = (id: number) => loadingIds.includes(id);

    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;

    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'tarifarios');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar tarifario",
        },
        {
            type: "year",
            key: "year",
            fromYear: startYear,
            toYear: endYear,
        }
    ];
    
    const handleBlur = async (
        id: number,
        field: string,
        value: number
    ) => {
        if (isLoading(id)) return; // evita doble request

        startLoading(id);

        try {
            await axios.put(`/tarifariosperiodos/${id}`, {
                field,
                value,
                year: filters.year,
            });
        } catch (error) {
            alert("Error al guardar, se revierte el cambio");
            router.reload({ only: ['tarifarios'] });
        } finally {
            stopLoading(id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tarifarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/tarifarios/create"
                                data={{ search: filters.search, year: filters.year  }}
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
                {tarifarios.data.length ? (
                    <>
                        <div>
                            {tarifarios.data.map((tarifario) => (
                                <div className="border rounded-xl shadow-sm overflow-hidden mb-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" key={tarifario.id}>
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="py-2 px-4 text-left border-b">                                            
                                                        {tarifario.codigo} - {tarifario.nombre}
                                                    </th>
                                                    <th className="py-2 px-4 text-left border-b">Fijo</th>
                                                    <th className="py-2 px-4 text-left border-b">Valor x m²</th>
                                                    <th className="py-2 px-4 text-left border-b">GL</th>
                                                    <th className="py-2 px-4 text-left border-b">CAT</th>
                                                    <th className="py-2 px-4 text-left border-b">Riesgo (%SBU)</th>
                                                    <th className="text-center border-b">
                                                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                                            <Link 
                                                                href={`/tarifarios/${tarifario.id}/edit`} 
                                                                data={{search: filters.search, year: filters.year}}
                                                            >
                                                                <PencilIcon className='text-white' />    
                                                            </Link>
                                                        </Button>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <TableSkeleton
                                                        rows={2}
                                                        columns={7}
                                                    />
                                                ) : (
                                                    tarifario.childrens.map((children) => (
                                                        <tr className="odd:bg-muted/50 hover:bg-gray-50" key={children.id}>
                                                            <td className="py-2 px-4 border-b">
                                                                {children.codigo} - {children.nombre}
                                                            </td>
                                                            <td className="border-b px-3 py-2">
                                                                {children.tarifario_periodo ? (
                                                                    <Checkbox
                                                                        checked={children.tarifario_periodo.valor_fijo === 1}
                                                                        disabled={isLoading(children.tarifario_periodo.id)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleBlur(
                                                                                children.tarifario_periodo.id,
                                                                                "valor_fijo",
                                                                                checked === true ? 1 : 0
                                                                            )
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Checkbox                                                        
                                                                        disabled={isLoading(children.id)}
                                                                        checked={false}
                                                                        onCheckedChange={(checked) =>
                                                                            handleBlur(
                                                                                children.id,
                                                                                "valor_fijo",
                                                                                checked === true ? 1 : 0
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="border-b px-3 py-2">
                                                                {children.tarifario_periodo ? (
                                                                    <Input
                                                                        key={`${children.tarifario_periodo.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.tarifario_periodo.id)}
                                                                        defaultValue={children.tarifario_periodo.valor}
                                                                        onBlur={(e) => handleBlur(children.tarifario_periodo.id, "valor", Number(e.target.value))}
                                                                    ></Input>
                                                                ) : (
                                                                    <Input
                                                                        key={`${children.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.id)}
                                                                        defaultValue="0.00"
                                                                        onBlur={(e) => handleBlur(children.id, "valor", Number(e.target.value))}
                                                                    ></Input>
                                                                )}
                                                            </td>
                                                            <td className="border-b px-3 py-2">
                                                                {children.tarifario_periodo ? (
                                                                    <Input
                                                                        key={`${children.tarifario_periodo.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.tarifario_periodo.id)}
                                                                        defaultValue={children.tarifario_periodo.gl}
                                                                        onBlur={(e) => handleBlur(children.tarifario_periodo.id, "gl", Number(e.target.value))}
                                                                    ></Input>
                                                                ) : (
                                                                    <Input
                                                                        key={`${children.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.id)}
                                                                        defaultValue="0.00"
                                                                        onBlur={(e) => handleBlur(children.id, "gl", Number(e.target.value))}
                                                                    ></Input>
                                                                )}
                                                            </td>
                                                            <td className="border-b px-3 py-2">
                                                                {children.tarifario_periodo ? (
                                                                    <Input
                                                                        key={`${children.tarifario_periodo.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.tarifario_periodo.id)}
                                                                        defaultValue={children.tarifario_periodo.cat}
                                                                        onBlur={(e) => handleBlur(children.tarifario_periodo.id, "cat", Number(e.target.value))}
                                                                    ></Input>
                                                                ) : (
                                                                    <Input
                                                                        key={`${children.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.id)}
                                                                        defaultValue="0.00"
                                                                        onBlur={(e) => handleBlur(children.id, "cat", Number(e.target.value))}
                                                                    ></Input>
                                                                )}
                                                            </td>
                                                            <td className="border-b px-3 py-2">
                                                                {children.tarifario_periodo ? (
                                                                    <Input
                                                                        key={`${children.tarifario_periodo.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.tarifario_periodo.id)}
                                                                        defaultValue={children.tarifario_periodo.riesgo}
                                                                        onBlur={(e) => handleBlur(children.tarifario_periodo.id, "riesgo", Number(e.target.value))}
                                                                    ></Input>
                                                                ) : (
                                                                    <Input
                                                                        key={`${children.id}-${filters.year}`}
                                                                        className='text-right'
                                                                        disabled={isLoading(children.id)}
                                                                        defaultValue="0.00"
                                                                        onBlur={(e) => handleBlur(children.id, "riesgo", Number(e.target.value))}
                                                                    ></Input>
                                                                )}
                                                            </td>
                                                            <td className="text-center border-b">
                                                                <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                                                    <Link 
                                                                        href={`/tarifarios/edit/${children.id}`} 
                                                                        data={{search: filters.search, year: filters.year}}
                                                                    >
                                                                        <PencilIcon className='text-white' />    
                                                                    </Link>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div> 
                            ))}
                        </div>
                        <div className='my-2'>
                            <Pagination links={tarifarios.links} />
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
        </AppLayout>
    );
}
