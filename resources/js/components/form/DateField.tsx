import * as React from "react";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  withTime?: boolean;
  minDate?: string;
  maxDate?: string;
}

export default function DateField({
  label,
  value,
  onChange,
  error,
  disablePast = false,
  disableFuture = false,
  withTime = false,
  minDate,
  maxDate,
}: DateFieldProps) {

  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>();

  const today = new Date();

  // sincroniza mes con valor
  React.useEffect(() => {
    if (value) {
      setMonth(dayjs(value).toDate());
    }
  }, [value]);

  // sincroniza al abrir
  React.useEffect(() => {
    if (open && value) {
      setMonth(dayjs(value).toDate());
    }
  }, [open]);

  const handleToday = () => {
    const now = dayjs();

    const formatted = withTime
      ? now.format("YYYY-MM-DDTHH:mm")
      : now.format("YYYY-MM-DD");

    onChange(formatted);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };

  const datePart = value ? dayjs(value).format("YYYY-MM-DD") : "";
  const timePart = value && withTime ? dayjs(value).format("HH:mm") : "00:00";

  const updateDateTime = (date?: string, time?: string) => {

    const finalDate = date ?? datePart;
    const finalTime = time ?? timePart;

    if (!finalDate) {
      onChange("");
      return;
    }

    const finalValue = withTime
      ? `${finalDate}T${finalTime}`
      : finalDate;

    if (minDate && dayjs(minDate).isValid()) {
      if (dayjs(finalValue).isBefore(dayjs(minDate))) {
        return;
      }
    }

    if (maxDate && dayjs(maxDate).isValid()) {
      if (dayjs(finalValue).isAfter(dayjs(maxDate))) {
        return;
      }
    }

    onChange(finalValue);
  };

  return (
    <div className="grid w-full gap-1">

      {label && (
        <Label className="mb-2">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>

        <PopoverTrigger asChild>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
          >

            <CalendarIcon className="mr-2 h-4 w-4" />

            {value
              ? dayjs(value).format(
                  withTime
                    ? "DD/MM/YYYY HH:mm"
                    : "DD/MM/YYYY"
                )
              : "Seleccionar fecha"}

          </Button>

        </PopoverTrigger>

        <PopoverContent className="w-auto p-2 space-y-2">

          <Calendar
            mode="single"
            captionLayout="dropdown"
            fromYear={1950}
            toYear={dayjs().year()}
            selected={value ? dayjs(value).toDate() : undefined}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {

              if (!date) return;

              const formatted = dayjs(date).format("YYYY-MM-DD");

              updateDateTime(formatted);

              if (!withTime) {
                setOpen(false);
              }

            }}
            disabled={(date) => {

              if (disableFuture && date > today) {
                return true;
              }

              if (disablePast && dayjs(date).isBefore(dayjs(), "day")) {
                return true;
              }

              if (minDate && dayjs(minDate).isValid()) {
                if (dayjs(date).isBefore(dayjs(minDate), "day")) {
                  return true;
                }
              }

              if (maxDate && dayjs(maxDate).isValid()) {
                if (dayjs(date).isAfter(dayjs(maxDate), "day")) {
                  return true;
                }
              }

              return false;
            }}
            initialFocus
          />

          {withTime && (

            <div className="flex items-center justify-center gap-2 pt-3 border-t">

              <Label className="text-xs whitespace-nowrap">
                Hora
              </Label>

              <input
                type="time"
                value={timePart}
                onChange={(e) =>
                  updateDateTime(undefined, e.target.value)
                }
                className="border rounded-md px-3 py-1 text-sm text-center w-28"
              />

            </div>

          )}

          <div className="flex items-center justify-between pt-2 border-t">

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!value}
            >

              <XIcon className="h-4 w-4 mr-1" />
              Borrar

            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleToday}
            >
              Hoy
            </Button>

          </div>

        </PopoverContent>

      </Popover>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}