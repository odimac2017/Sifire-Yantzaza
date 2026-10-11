import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";

export default function useFilters<T extends Record<string, any>>(
    initialFilters: T,
    baseUrl: string,
    debounceTime: number = 400 // ⏱️ configurable
) {
    const [filters, setFilters] = useState<T>(initialFilters);

    const previousFilters = useRef(initialFilters);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilter = (key: keyof T, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // 🔥 SERIALIZADOR PRO
    const serializeFilters = (filters: any) => {
        const result: any = {};

        for (const key in filters) {
            const value = filters[key];

            // 🎯 DATE RANGE
            if (value && typeof value === "object" && ("from" in value || "to" in value)) {
                const from = value.from
                    ? dayjs(value.from).format("YYYY-MM-DD")
                    : null;

                const to = value.to
                    ? dayjs(value.to).format("YYYY-MM-DD")
                    : null;

                if (from || to) {
                    result[key] = { from, to };
                }

                continue;
            }

            // ❌ Ignorar vacíos
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                continue;
            }

            result[key] = value;
        }

        return result;
    };

    useEffect(() => {

        if (JSON.stringify(previousFilters.current) === JSON.stringify(filters)) {
            return;
        }

        previousFilters.current = filters;

        // ⏱️ DEBOUNCE
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {

            const cleanFilters = serializeFilters(filters);

            router.get(`/${baseUrl}`, cleanFilters, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });

        }, debounceTime);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

    }, [filters]);

    return {
        filters,
        updateFilter,
    };
}