import { useMemo } from "react";
import dayjs from "dayjs";

export function useDuracion(
    fechaInicio?: string | null,
    fechaFin?: string | null
): string {

    return useMemo(() => {
        if (!fechaInicio || !fechaFin) return "";

        const inicio = dayjs(fechaInicio);
        const fin = dayjs(fechaFin);

        if (!inicio.isValid() || !fin.isValid()) return "";
        if (fin.isBefore(inicio)) return "";

        const minutosTotales = fin.diff(inicio, "minute");

        const dias = Math.floor(minutosTotales / 1440);
        const horas = Math.floor((minutosTotales % 1440) / 60);
        const minutos = minutosTotales % 60;

        const partes: string[] = [];

        if (dias > 0) partes.push(`${dias} día${dias > 1 ? "s" : ""}`);
        if (horas > 0) partes.push(`${horas} hora${horas > 1 ? "s" : ""}`);
        if (minutos > 0) partes.push(`${minutos} minuto${minutos > 1 ? "s" : ""}`);

        return partes.join(" ");
    }, [fechaInicio, fechaFin]);
}