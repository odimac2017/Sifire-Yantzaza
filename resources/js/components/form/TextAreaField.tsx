import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TextAreaFieldProps {
  label?: string;
  name: string;
  value: string | null; // <-- permitir null desde backend
  error?: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (value: string) => void;
}

export default function TextAreaField({
  label,
  name,
  value,
  error,
  placeholder = "",
  maxLength,
  onChange,
}: TextAreaFieldProps) {
  const safeValue = value ?? ""; // 🔹 proteger null
  const [chars, setChars] = useState(safeValue.length);
  
  useEffect(() => {
    setChars((value ?? "").length); // 🔹 proteger null
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!maxLength || val.length <= maxLength) {
      onChange(val);
      setChars(val.length);
    }
  };

  return (
    <div className="grid w-full gap-1 relative">
      {label && (
        <Label htmlFor={name} className="mb-2">
          {label}
        </Label>
      )}

      <div className="relative">
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={safeValue} // 🔹 usar safeValue
          onChange={handleChange}
          className={cn(
            "border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y",
            error && "border-destructive",
            maxLength ? "pr-10" : ""
          )}
        />

        {maxLength && (
          <div className="absolute bottom-2 right-5 text-xs text-muted-foreground pointer-events-none">
            {maxLength - chars} caracteres restantes
          </div>
        )}
      </div>

      <InputError message={error} />
    </div>
  );
}