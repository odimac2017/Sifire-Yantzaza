import { CheckCircle, Clock, Lock, AlertTriangle, PenOff, Ban } from "lucide-react";

const estados = {
    SIN_FIRMA: {
        label: "Sin firma",
        icon: PenOff,
        style: "bg-blue-100 text-blue-700"
    },
    EN_PROCESO: {
        label: "En proceso",
        icon: Clock,
        style: "bg-yellow-100 text-yellow-700"
    },
    PENDIENTE: {
        label: "Pendiente",
        icon: Clock,
        style: "bg-yellow-100 text-yellow-700"
    },
    ESPERANDO_FIRMA: {
        label: "Esperando firma",
        icon: Lock,
        style: "bg-amber-100 text-amber-700"
    },
    REQUIERE_PASSWORD: {
        label: "Requiere clave",
        icon: Lock,
        style: "bg-amber-100 text-amber-700"
    },
    FIRMADO: {
        label: "Firmado",
        icon: CheckCircle,
        style: "bg-green-100 text-green-700"
    },
    ERROR_FIRMA: {
        label: "Error",
        icon: AlertTriangle,
        style: "bg-red-100 text-red-700"
    },
    CERTIFICADO_VENCIDO: {
        label: "Cert. vencido",
        icon: AlertTriangle,
        style: "bg-purple-100 text-purple-700"
    },
    ANULADO: {
        label: "Anulado",
        icon: Ban,
        style: "bg-gray-200 text-gray-700"
    }
};

export default function EstadoFirmaBadge({ inspeccion }) {

    const estado = estados[inspeccion.estado_firma];

    if (!estado) return null;

    const Icon = estado.icon;

    return (
        <span
            title={inspeccion.error_firma}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${estado.style}`}
        >
            <Icon className="w-3 h-3" />
            {estado.label}
        </span>
    );
}