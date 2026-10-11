import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

interface Option {
  id: number;
  nombre: string;
}

interface SelectFieldProps {
  label?: string;
  name: string;
  value: number | null;
  options: Option[];
  error?: string;
  placeholder?: string;
  uppercase?: boolean;
  onChange: (value: number | null) => void;
}

export default function SelectField({
  label,
  name,
  value,
  options,
  error,
  placeholder = "Seleccione",
  uppercase = false,
  onChange,
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val ? Number(val) : null);
  };

  return (
    <div className="grid w-full gap-1 relative">
      {label && (
        <Label htmlFor={name} className="mb-2">
          {label}
        </Label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          className={cn(
            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            error && "border-destructive"
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {uppercase ? option.nombre.toUpperCase() : option.nombre}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
      </div>

      <InputError message={error} />
    </div>
  );
}
