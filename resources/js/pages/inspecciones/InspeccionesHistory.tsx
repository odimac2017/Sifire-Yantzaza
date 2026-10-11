import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { money } from "@/utils/format";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Inspeccion {
    id: number;
    numero_formateado: string;
    nombre_personal: string;
    fecha_inspeccion: string;
    valor_total: number;
    estado: string;
    proceso_permiso: {
        tipo_permiso: {
            tipo_inspeccion: {
                nombre: string;
            }
        }
    }
}

interface Props {
    inspecciones: Inspeccion[];
}

export default function InspeccionesTable({ inspecciones }: Props) {

    if (!inspecciones.length) {
        return (
            <div className="flex justify-center">
                <Alert className="w-full sm:w-1/2 bg-destructive/10 text-destructive border-none">
                    <TriangleAlertIcon className="h-4 w-4" />
                    <AlertTitle>
                        La actividad económica no tiene inspecciones realizadas
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
                            <th className="w-60 py-2 px-4 text-left border-b">Tipo inspección</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Fecha</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Valor</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Estado</th>
                            <th className="w-60 py-2 px-4 text-left border-b">Inspector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspecciones.map((inspeccion) => (
                            <tr className="odd:bg-muted/50 hover:bg-gray-50" key={inspeccion.id}>
                                <td className="py-2 px-4 border-b"><span className='font-medium'>{inspeccion.numero_formateado}</span></td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm text-gray-800 leading-tight">
                                            {inspeccion.proceso_permiso?.tipo_permiso.tipo_inspeccion.nombre}
                                        </span>

                                        <span className="w-fit text-[10px] tracking-wide uppercase font-bold bg-slate-900 text-white px-2 py-1 rounded-md">
                                            {dayjs(inspeccion.fecha_inspeccion).year()}
                                        </span>
                                    </div>                                    
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {dayjs.utc(inspeccion.fecha_inspeccion).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <span className="font-semibold text-slate-700">
                                        {money(inspeccion.valor_total)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        USD
                                    </span>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <Badge
                                        className={
                                            inspeccion.estado === "APROBADO"
                                                ? "bg-green-600/10 text-green-600"
                                                : "bg-red-600/10 text-red-600"
                                        }
                                    >
                                        {inspeccion.estado}
                                    </Badge>
                                </td>
                                <td className="py-2 px-4 border-b">{inspeccion.nombre_personal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}