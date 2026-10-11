import { MinusIcon, PlusIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import InputError from "../input-error";

interface NumberInputProps {
    label?: string;
    name: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    error?: string;
    disabled?: boolean;
}

export default function NumberInput({
    label,
    name,
    value,
    onChange,
    min = 0,
    max,
    error,
    disabled
}: NumberInputProps) {

    const handleDecrease = () => {
        const newValue = value - 1;
        if (newValue >= min) onChange(newValue);
    };

    const handleIncrease = () => {
        const newValue = value + 1;
        if (max === undefined || newValue <= max) onChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (!isNaN(val)) {
            if ((max === undefined || val <= max) && val >= min) {
                onChange(val);
            }
        }
    };

    return (
        <div className="grid w-full gap-1">
            {label && (
                <Label htmlFor={name} className="mb-2">
                {label}
                </Label>
            )}
            <div className={`flex items-center h-9 w-full rounded-md border overflow-hidden bg-white dark:bg-background
                ${error ? "border-destructive" : "border-input"}`}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDecrease();
                    }}
                    disabled={disabled}
                    className="px-3 h-full flex items-center justify-center 
                        bg-muted/60 border-l border-input
                        hover:bg-muted active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                    <MinusIcon className="w-4 h-4" />
                </button>
                <input
                    type="number"
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full text-center outline-none bg-white dark:bg-background"
                />
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleIncrease();
                    }}
                    disabled={disabled}                    
                    className="px-3 h-full flex items-center justify-center 
                        bg-muted/60 border-l border-input
                        hover:bg-muted active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
            <InputError message={error} />
        </div>        
    );
}