import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Bolt, Settings, LifeBuoy, Users, CircleDollarSign, Package, ScrollText, BarChart3, Signature } from 'lucide-react';
import AppLogo from './app-logo';

export interface MainNavItem {
    title: string;
    href: string;
    icon?: any;
    roles?: number[];
    subItems?: MainNavItem[];
}

const filterByRoles = (items: MainNavItem[], userRoles: number[]): MainNavItem[] => {
    return items
        .map(item => {
            const subItems = item.subItems
                ? filterByRoles(item.subItems, userRoles)
                : [];

            const hasAccess =
                !item.roles || item.roles.some(role => userRoles.includes(role));

            if (hasAccess || subItems.length > 0) {
                return {
                    ...item,
                    ...(subItems.length > 0 ? { subItems } : {})
                };
            }

            return null;
        })
        .filter((item): item is MainNavItem => item !== null);
};

const mainNavItems: MainNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Prevención',
        href: '#',
        icon: Package,
        roles: [1, 3, 4],
        subItems: [
            {
                title: 'Solicitudes inspección',
                href: '/solicitudesinspecciones',
                roles: [1, 3],
            },
            {
                title: 'Informes inspección',
                href: '/inspecciones',
                roles: [1, 4],
            },
            {
                title: 'Novedades',
                href: '/inspecciones/novedades',
                roles: [1, 3],
            },
            {
                title: 'Notificaciones',
                href: '/notificaciones',
                roles: [1, 3, 4],
            }
        ]
    },
    {
        title: 'Recaudaciones',
        href: '#',
        icon: CircleDollarSign,
        roles: [1, 3, 5],
        subItems: [
            {
                title: 'Permisos',
                href: '/permisosfuncionamientos',
            },
            {
                title: 'Catastros',
                href: '/recaudacionescatastros',
            }
        ]
    },
    {
        title: 'Talento Humano',
        href: '#',
        icon: Users,
        roles: [1, 7],
        subItems: [
            {
                title: 'Puestos',
                href: '/puestos',
            },
            {
                title: 'Personal',
                href: '/personales',
            }
        ]
    },
    {
        title: 'Emergencias',
        href: '#',
        icon: LifeBuoy,
        roles: [1, 6, 8],
        subItems: [
            {
                title: 'Categorias',
                href: '/categoriasemergencias',
                roles: [1, 8],
            },
            {
                title: 'Partes emergencias',
                href: '/partesemergencias',
                roles: [1, 6, 8],
            }
        ]
    },
    {
        title: 'Firma documentos',
        href: '#',
        icon: Signature,
        subItems: [
            {
                title: 'Inspecciones',
                href: '/firmas/inspecciones',
            },
            {
                title: 'Permisos',
                href: '/firmas/permisosfuncionamientos',
            }
        ]
    },
    {
        title: 'Reportes recaudación',
        href: '#',
        icon: ScrollText,
        roles: [1, 2, 3, 5],
        subItems: [
            {
                title: 'Permisos',
                href: '/reportespermisosfuncionamientos',
            },
            {
                title: 'Clientes sin permisos',
                href: '/reportesclientessinpermisos',
            },
            {
                title: 'Catastros',
                href: '/reportescatastros',
            },
            {
                title: 'Notas de crédito',
                href: '/reportesnotascreditos',
            },
            {
                title: 'Avanzados',
                href: '/reportesavanzados',
            }
        ]
    },
    {
        title: 'Reportes',
        href: '#',
        icon: ScrollText,
        roles: [1, 2, 3, 5, 8],
        subItems: [
            {
                title: 'Prevención',
                href: '/reportesprevenciones',
                roles: [1, 2, 3, 5],
            },
            {
                title: 'Emergencias',
                href: '/reportesemergencias',
                roles: [1, 2, 8],
            }
        ]
    },
    {
        title: 'Estadísticas',
        href: '#',
        icon: BarChart3,
        roles: [1, 2, 3, 5, 8],
        subItems: [
            {
                title: 'Prevención',
                href: '/estadisticasprevenciones',
                roles: [1, 2, 3, 5],
            },
            {
                title: 'Emergencias',
                href: '/estadisticasemergencias',
                roles: [1, 2, 8],
            }
        ]
    },
    {
        title: 'Opciones generales',
        href: '#',
        icon: Bolt,
        roles: [1, 3, 4],
        subItems: [
            {
                title: 'Clientes',
                href: '/clientes',
                roles: [1, 3],
            },
            {
                title: 'Tarifario',
                href: '/tarifarios',
                roles: [1, 3],
            },
            {
                title: 'Extintores',
                href: '/extintores',
                roles: [1, 3, 4],
            }
        ]
    },
    {
        title: 'Administración',
        href: '#',
        icon: Settings,
        roles: [1],
        subItems: [
            {
                title: 'Usuarios',
                href: '/users',
            },
            {
                title: 'Plantillas',
                href: '/plantillas',
            },
            {
                title: 'Institución',
                href: '/institucion/1/edit',
            },
            {
                title: 'Configuración',
                href: '/configuracion/1/edit',
            },
        ]
    }, 
];

export function AppSidebar() {
    const { auth } = usePage().props as {
        auth?: {
            roles?: number[];
        };
    };

    const roles: number[] = auth?.roles ?? [];

    const filteredNav = filterByRoles(mainNavItems, roles);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNav} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
