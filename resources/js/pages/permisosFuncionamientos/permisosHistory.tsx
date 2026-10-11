import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { money } from "@/utils/format";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface PermisoFuncionamiento {
    id: number;
    numero_formateado: string;
    fecha_expedicion: string;
    fecha_caducidad: string;
    valor_total: number;
    estado: string;
    proceso_permiso: {
        tipo_permiso: {            
            nombre: string;           
        }
    }
}

interface Props {
    permisosFuncionamientos: PermisoFuncionamiento[];
}

export default function PermisosTable({ permisosFuncionamientos }: Props) {

    if (!permisosFuncionamientos.length) {
        return (
            <div className="flex justify-center">
                <Alert className="w-full sm:w-1/2 bg-destructive/10 text-destructive border-none">
                    <TriangleAlertIcon className="h-4 w-4" />
                    <AlertTitle>
                        La actividad económica no tiene permisos de funcionamiento
                    </AlertTitle>
                </Alert>
            </div>
        );
    }

    return (
        <div className="border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted">
                            <th className="w-20 py-2 px-4 text-left border-b">Número</th>
                            <th className="w-60 py-2 px-4 text-left border-b">Tipo permiso</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Fechas</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Valor</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permisosFuncionamientos.map((permiso) => (
                            <tr className="odd:bg-muted/50 hover:bg-gray-50" key={permiso.id}>
                                <td className="py-2 px-4 border-b"><span className='font-medium'>{permiso.numero_formateado}</span></td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm text-gray-800 leading-tight">
                                            {permiso.proceso_permiso?.tipo_permiso?.nombre}
                                        </span>

                                        <span className="w-fit text-[10px] tracking-wide uppercase font-bold bg-slate-900 text-white px-2 py-1 rounded-md">
                                            {dayjs(permiso.fecha_expedicion).year()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex flex-col text-sm">
                                        <span className="text-muted-foreground text-xs">EMISIÓN</span>
                                        <span className="font-medium">
                                            {dayjs.utc(permiso.fecha_expedicion).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                        </span>
                                        <span className="text-muted-foreground text-xs mt-1">CADUCIDAD</span>
                                        <span className="font-semibold text-red-600">
                                            {dayjs.utc(permiso.fecha_caducidad).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <span className="font-semibold text-slate-700">
                                        {money(permiso.valor_total)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        USD
                                    </span>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <Badge
                                        className={
                                            permiso.estado === "EXPEDIDO"
                                                ? "bg-green-600/10 text-green-600"
                                                : "bg-red-600/10 text-red-600"
                                        }
                                    >
                                        {permiso.estado}
                                    </Badge>
                                </td>                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}