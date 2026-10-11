import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

export function useFlashAlert(duration = 3000) {
    const { flash } = usePage().props as any;
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShow(true);

            const timer = setTimeout(() => {
                setShow(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [flash, duration]);

    return {
        flash,
        show,
    };
}