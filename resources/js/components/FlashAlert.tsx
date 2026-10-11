import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCheckIcon, TriangleAlertIcon } from "lucide-react";

interface FlashAlertProps {
    flash: any;
    show: boolean;
}

export default function FlashAlert({ flash, show }: FlashAlertProps) {
    if (!show || (!flash?.success && !flash?.error)) return null;

    const isSuccess = !!flash?.success;

    return (
        <Alert
            className={`border-none ${
                isSuccess
                    ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                    : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
            }`}
        >
            {isSuccess ? <CheckCheckIcon /> : <TriangleAlertIcon />}
            <AlertTitle>{isSuccess ? "Éxito" : "Error"}</AlertTitle>
            <AlertDescription
                className={
                    !isSuccess
                        ? "text-destructive"
                        : "text-green-600/80 dark:text-green-400/80"
                }
            >
                {flash.success ?? flash.error}
            </AlertDescription>
        </Alert>
    );
}