import { Building2Icon, Car, CirclePlay } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import UserAvatar from "@/components/user-avatar";

export default function InspectionsTable({ solicitudes, auth_personal_id }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-muted">                    
                        <th className="px-6 py-3 text-left">#</th>
                        <th className="px-6 py-3 text-left">Inspector</th>
                        <th className="px-6 py-3 text-left">Tipo permiso</th>
                        <th className="px-6 py-3 text-left">Cliente</th>
                        <th className="px-6 py-3 text-left">Actividad económica</th>                        
                        <th className="px-6 py-3 text-left">Estado</th>
                        <th className="px-6 py-3 text-left">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {solicitudes.map((item: any, index: number) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition">
                            <td className="py-2 px-4">{index + 1}</td>                            
                            <td className="py-2 px-4">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        name={item.personal.user.full_name_simplex}
                                        avatar={item.personal.user.avatar}
                                        isOnline={item.personal.user.is_online}
                                        size="md"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            {item.nombre_personal}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.personal?.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-4">{item.proceso_permiso?.tipo_permiso?.nombre}</td>
                            <td className="py-2 px-4">{item.proceso_permiso?.cliente?.nombre}</td>
                            <td className="py-2 px-4">
                                {item.proceso_permiso?.actividad_economica?.tipo_actividad === "E" ? (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">
                                            {item.proceso_permiso?.actividad_economica?.e_nombre_comercial}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Building2Icon className="w-5 h-5" />
                                            Establecimiento
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">
                                            {item.proceso_permiso?.actividad_economica?.v_placa}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Car className="w-5 h-5" />
                                            {item.proceso_permiso?.actividad_economica?.v_marca}{" "}
                                            {item.proceso_permiso?.actividad_economica?.v_tipo}{" "}
                                            {item.proceso_permiso?.actividad_economica?.v_clase}{" "}
                                            {item.proceso_permiso?.actividad_economica?.v_color}
                                        </span>
                                    </div>
                                )}
                            </td>
                            <td className="py-2 px-4">
                                <Badge
                                    className={`border-none focus-visible:outline-none
                                        ${item.estado === "REALIZADO"
                                            ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                            : "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                                        }
                                    `}
                                >
                                    {item.estado}
                                </Badge>
                            </td>
                            <td className="py-2 px-4">
                                {item.personal_id === auth_personal_id && (
                                    <a
                                        href={`/inspecciones/${item.id}/create`}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                        title="Ver / Iniciar inspección"
                                    >
                                        <CirclePlay className="h-5 w-5" />
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>            
        </div>
    );
}