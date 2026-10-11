import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import Pagination from '@/components/pagination';
import { PencilIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FlashAlert from "@/components/FlashAlert";
import { useFlashAlert } from "@/hooks/useFlashAlert";
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categorías de emergencias',
        href: '/categoriasemergencias',
    },
];

interface CategoriaChildren {
    id: number;
    codigo: string;
    nombre: string;
    parent_id: number;    
}

interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    childrens: CategoriaChildren[];
}

interface CategoriaPagination {
    data: Categoria[];
    links: LinkProps[];
}

interface FilterProps {    
    search: string;
}

interface IndexProps {
    categorias: CategoriaPagination;    
    filters: FilterProps;
}

export default function Index({categorias, filters: initialFilters}: IndexProps) {

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
    
    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'categoriasemergencias');
   
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar categoría",
        },
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías de emergencias" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">                
                <FlashAlert flash={flash} show={show} />
                <FiltersBar
                    actions={
                        <Button asChild size="sm">
                            <Link
                                href="/categoriasemergecias/create"
                                data={{ search: filters.search }}
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
                {categorias.data.length ? (
                    <>
                        <div>
                            {categorias.data.map((categoria) => (
                                <div className="border rounded-xl shadow-sm overflow-hidden mb-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" key={categoria.id}>
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="py-2 px-4 text-left border-b w-[200px]">                                            
                                                        {categoria.codigo} - {categoria.nombre}
                                                    </th>
                                                    <th className="text-center border-b w-[10px]">
                                                        <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                                            <Link 
                                                                href={`/categoriasemergencias/${categoria.id}/edit`} 
                                                                data={{search: filters.search}}
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
                                                        columns={2}
                                                    />
                                                ) : (
                                                    categorias.data.map((children) => (
                                                        <tr className="odd:bg-muted/50 hover:bg-gray-50" key={children.id}>
                                                            <td className="py-2 px-4 border-b">
                                                                {children.codigo} - {children.nombre}
                                                            </td>
                                                            <td className="text-center border-b">
                                                                <Button asChild size="sm" className="bg-slate-500 hover:bg-slate-700">
                                                                    <Link 
                                                                        href={`/categoriasemergencias/edit/${children.id}`} 
                                                                        data={{search: filters.search}}
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
                            <Pagination links={categorias.links} />
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
