import { X } from "lucide-react";

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",      // 👈 tamaño por defecto
    width = null      // 👈 ancho personalizado opcional
}) {
    if (!open) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-3xl",
        full: "max-w-5xl"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

            <div
                className={`
                    bg-white rounded-2xl shadow-2xl w-full
                    ${width ? width : sizes[size]}
                    max-h-[90vh] flex flex-col
                    animate-in fade-in zoom-in-95 relative
                `}
            >

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* HEADER */}
                {(title || description) && (
                    <div className="p-6 pb-2">
                        {title && (
                            <h2 className="text-lg font-semibold">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* BODY (SCROLL) */}
                <div className="px-6 py-4 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* FOOTER */}
                {footer && (
                    <div className="p-6 pt-2 flex justify-end gap-2 border-t">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}