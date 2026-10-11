import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FileFieldProps {
  label?: string;
  name: string;
  accept?: string;
  error?: string;
  showError?: boolean;
  onChange: (file: File | null) => void;
}

const FileField = forwardRef<HTMLInputElement, FileFieldProps>(
  ({ label, name, accept, error, showError = true, onChange }, ref) => {
    return (
      <div className="grid w-full gap-1">
        {label && (
          <Label htmlFor={name} className="mb-2">
            {label}
          </Label>
        )}

        <input
          ref={ref} // <-- ahora se usa el ref pasado desde el padre
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className={cn(
            "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            error && "border-destructive focus-visible:ring-destructive/50"
          )}
        />

        {showError && <InputError message={error} />}
      </div>
    );
  }
);

FileField.displayName = "FileField";

export default FileField;