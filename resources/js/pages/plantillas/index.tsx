import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LinkProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/components/pagination';
import { MoreHorizontalIcon, Signature, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FiltersBar from "@/components/filters/FiltersBar";
import AutoFilters from "@/components/filters/AutoFilters";
import useFilters from "@/hooks/useFilters";
import { FilterConfig } from "@/types/filters";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plantillas',
        href: '/plantillas',
    },
];

interface Plantilla {
    id: number;
    nombre: string;
    predeterminado: boolean;
    vista_blade: string;
    orientacion_papel: string;
    tamano_papel: string;
    ancho: number;
    alto: number;
}

interface PlantillaPagination {
    data: Plantilla[];
    links: LinkProps[];
}

interface FilterProps {
    search: string;
}

interface IndexProps {
    plantillas: PlantillaPagination;
    filters: FilterProps;    
}

export default function Index({plantillas, filters: initialFilters}: IndexProps) {

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
    
    const { filters, updateFilter } = useFilters<FilterProps>(initialFilters, 'plantillas');
    
    const filterConfig: FilterConfig<FilterProps>[] = [
        {
            type: "search",
            key: "search",
            placeholder: "Buscar plantila",
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plantillas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <FiltersBar>
                    <AutoFilters
                        filters={filters}
                        updateFilter={updateFilter}
                        config={filterConfig}
                    />
                </FiltersBar>    
                {plantillas.data.length ? (
                    <>
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="py-2 px-4 text-left border-b">Nombre</th>
                                            <th className="py-2 px-4 text-left border-b">Vista</th>
                                            <th className="py-2 px-4 text-left border-b">Orientación</th> 
                                            <th className="py-2 px-4 text-left border-b">Tamaño de papel</th>     
                                            <th className="py-2 px-4 text-left border-b">Ancho</th>  
                                            <th className="py-2 px-4 text-left border-b">Alto</th>
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
                                            plantillas.data.map((plantilla) => (
                                                <tr className="odd:bg-muted/50 hover:bg-gray-50" key={plantilla.id}>
                                                    <td className="py-2 px-4 border-b">{plantilla.nombre}</td>
                                                    <td className="py-2 px-4 border-b">{plantilla.vista_blade}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        {plantilla.orientacion_papel === 'LANDSCAPE' ? 'HORIZONTAL' : 'VERTICAL'}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{plantilla.tamano_papel}</td>
                                                    <td className="py-2 px-4 border-b">{plantilla.ancho}</td>
                                                    <td className="py-2 px-4 border-b">{plantilla.alto}</td> 
                                                    <td className="py-2 px-4 border-b">
                                                        <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-40" align="end">
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/plantillas/${plantilla.id}/edit`}
                                                                            data={{ search: filters.search }}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Signature className="h-4 w-4" />
                                                                            <span>Firmantes</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
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
                            <Pagination links={plantillas.links} />
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
