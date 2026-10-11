import { useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, AlertTriangle } from "lucide-react";

export default function ModalFirmarPermiso({
    open,
    onClose,
    inspeccionId,
    onSuccess
}) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!password) {
            setError("Ingrese la contraseña");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await axios.post(
                `/firmas/inspecciones/${inspeccionId}/firmar`,
                { password }
            );

            setPassword("");
            onClose();
            onSuccess?.(res.data);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Error al firmar el documento"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                setPassword("");
                setError("");
                onClose();
            }}
            title={
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <LockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Firma segura</span>
                </div>
            }
            description="Ingrese la contraseña de su certificado digital"
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
                                Firmando...
                            </>
                        ) : (
                            <>
                                <LockIcon className="w-4 h-4" />
                                Firmar
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

            {/* INPUT */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Contraseña del certificado
                </label>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    >
                        {showPassword ? (
                            <EyeOffIcon className="w-4 h-4" />
                        ) : (
                            <EyeIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* ayuda */}
                <p className="text-xs text-gray-500">
                    Esta contraseña corresponde a su certificado digital (.p12)
                </p>
            </div>
        </Modal>
    );
}