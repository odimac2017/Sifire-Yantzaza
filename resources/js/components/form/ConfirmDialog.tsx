import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
} from "@/components/ui/alert-dialog";

import {
    Trash2Icon,
    RotateCcwIcon,
    BanIcon,
    XIcon,
    LockIcon,
} from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "delete" | "cancel" | "active" | "close";
    onConfirm: () => void;
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = "¿Está seguro?",
    description = "Esta acción no se puede deshacer.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "delete",
    onConfirm,
}: ConfirmDialogProps) {

    const config = {
        delete: {
            icon: Trash2Icon,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            button: "!bg-red-600 hover:!bg-red-700"
        },
        cancel: {
            icon: BanIcon,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            button: "!bg-amber-600 hover:!bg-amber-700"
        },
        active: {
            icon: RotateCcwIcon,
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            button: "!bg-emerald-600 hover:!bg-emerald-700"
        },
        close: {
            icon: LockIcon,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            button: "!bg-red-600 hover:!bg-red-700"
        },
    };

    const { icon: Icon, iconBg, iconColor, button } = config[variant];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95">

                {/* HEADER */}
                <div className="flex gap-4 items-start">

                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {description}
                        </p>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 mt-6">

                    <AlertDialogCancel className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition cursor-pointer">
                        <XIcon className="h-4 w-4" />
                        {cancelText}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm transition cursor-pointer ${button}`}
                    >
                        <Icon className="h-4 w-4" />
                        {confirmText}
                    </AlertDialogAction>

                </div>

            </AlertDialogContent>
        </AlertDialog>
    );
}