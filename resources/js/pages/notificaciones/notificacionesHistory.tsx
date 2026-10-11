import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { money } from "@/utils/format";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Notificacion {
    id: number;
    nombre_personal: string;
    numero_formateado: string;
    numero_notificacion: number;
    fecha_entrega: string;
    fecha_plazo: string;
    estado: string;
}

interface Props {
    notificaciones: Notificacion[];
}

export default function InspeccionesTable({ notificaciones }: Props) {

    if (!notificaciones.length) {
        return (
            <div className="flex justify-center">
                <Alert className="w-full sm:w-1/2 bg-destructive/10 text-destructive border-none">
                    <TriangleAlertIcon className="h-4 w-4" />
                    <AlertTitle>
                        La actividad económica no tiene notificaciones recibidas
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
                            <th className="w-20 py-2 px-4 text-left border-b">Notificación</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Fechas</th>
                            <th className="w-20 py-2 px-4 text-left border-b">Estado</th>
                            <th className="w-60 py-2 px-4 text-left border-b">Inspector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notificaciones.map((notificacion) => (
                            <tr className="odd:bg-muted/50 hover:bg-gray-50" key={notificacion.id}>
                                <td className="py-2 px-4 border-b"><span className='font-medium'>{notificacion.numero_formateado}</span></td>
                                <td className="py-2 px-4 border-b">
                                    <Badge
                                        className={
                                            notificacion.numero_notificacion === 1
                                                ? "bg-blue-600/10 text-blue-600"
                                                : notificacion.numero_notificacion === 2
                                                ? "bg-orange-600/10 text-orange-600"
                                                : "bg-red-600/10 text-red-600"
                                        }
                                    >
                                        {notificacion.numero_notificacion === 1
                                            ? "PRIMERA"
                                            : notificacion.numero_notificacion === 2
                                            ? "SEGUNDA"
                                            : notificacion.numero_notificacion === 3
                                            ? "TERCERA"
                                            : `${notificacion.numero_notificacion}°`}
                                    </Badge>                             
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex flex-col text-sm">
                                        <span className="text-muted-foreground text-xs">ENTREGA</span>
                                        <span className="font-medium">
                                            {dayjs.utc(notificacion.fecha_entrega).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                        </span>
                                        <span className="text-muted-foreground text-xs mt-1">PLAZO</span>
                                        <span className="font-semibold text-red-600">
                                            {dayjs.utc(notificacion.fecha_plazo).tz('America/Guayaquil').format('YYYY-MM-DD')}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <Badge
                                        className={
                                            notificacion.estado === "ENTREGADO"
                                                ? "bg-green-600/10 text-green-600"
                                                : "bg-red-600/10 text-red-600"
                                        }
                                    >
                                        {notificacion.estado}
                                    </Badge>
                                </td>
                                <td className="py-2 px-4 border-b">{notificacion.nombre_personal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}