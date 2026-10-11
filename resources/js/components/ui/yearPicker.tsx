import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearPickerProps {
  value?: number | null;
  fromYear?: number;
  toYear?: number;
  onChange: (year: number) => void;
}

export default function YearPicker({
  value,
  fromYear = 2015,
  toYear = new Date().getFullYear() + 2,
  onChange,
}: YearPickerProps) {

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = toYear; y >= fromYear; y--) list.push(y);
    return list;
  }, [fromYear, toYear]);

  return (
    <Select
      value={value ? String(value) : ""}
      onValueChange={(val) => onChange(Number(val))}
    >

      <SelectTrigger className="h-9 w-[120px] bg-background hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Año" />
      </SelectTrigger>

      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>

    </Select>
  );
}
