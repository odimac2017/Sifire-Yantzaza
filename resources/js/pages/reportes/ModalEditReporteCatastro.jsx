import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertTriangle } from "lucide-react";
import TextAreaField from "@/components/form/TextAreaField";

export default function ModalEditReporteCatastro({
    open,
    onClose,
    reporteId,
    onSuccess
}) {
    const [observaciones, setObservaciones] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 🔄 cargar datos actuales (opcional pero recomendado)
    useEffect(() => {
        if (open && reporteId) {
            axios.get(`/reportescatastros/${reporteId}`)
                .then(res => {
                    setObservaciones(res.data.observaciones || "");
                })
                .catch(() => {
                    setObservaciones("");
                });
        }
    }, [open, reporteId]);

    const handleSubmit = async () => {
        if (!reporteId) return;

        setLoading(true);
        setError("");

        try {
            const res = await axios.put(
                `/reportescatastros/${reporteId}`,
                { observaciones }
            );
            
            onClose();
            onSuccess?.(res.data);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Error al guardar las observaciones"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                setObservaciones("");
                setError("");
                onClose();
            }}
            size="lg"
            title={
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Editar observaciones</span>
                </div>
            }
            description="Agregue o modifique las observaciones del reporte"
            footer={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        Cancelar
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                Guardar
                            </>
                        )}
                    </Button>
                </>
            }
        >
            {/* ERROR */}
            {error && (
                <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* TEXTAREA */}
            <TextAreaField
                label="Observaciones"
                value={observaciones}
                onChange={setObservaciones}
                placeholder="Escriba aquí las observaciones del reporte..."
                rows={4}
            />
        </Modal>
    );
}