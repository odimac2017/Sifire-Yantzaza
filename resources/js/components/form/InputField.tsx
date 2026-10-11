import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label?: string;
  name: string;
  value: string | number;
  placeholder?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function InputField({
  label,
  name,
  value,
  placeholder,
  error,
  onChange,
  type = "text",
}: InputFieldProps) {
  return (
    <div className="grid w-full gap-1">
      {label && (
        <Label htmlFor={name} className="mb-2">
          {label}
        </Label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          error && "border-destructive"
        )}
      />
      <InputError message={error} />
    </div>
  );
}
