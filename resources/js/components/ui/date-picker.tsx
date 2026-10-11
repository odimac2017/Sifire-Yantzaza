"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value?: string;
  onChange: (date: string | null) => void;
}

export function DatePicker({ value, onChange }: Props) {

  // ✅ FIX timezone (NO más desfase de día)
  const date = value
    ? new Date(value + "T00:00:00")
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-start text-left font-normal bg-white dark:bg-background"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />

          {value
            ? dayjs(value).format("DD/MM/YYYY")
            : "Seleccionar fecha"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">

        <div className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                onChange(dayjs(d).format("YYYY-MM-DD"));
              }
            }}
            initialFocus
            // 🚫 opcional: bloquear futuro
            locale={es}
            disabled={(date) => date > new Date()}
          />
        </div>

        {/* 🔥 FOOTER */}
        <div className="flex justify-between items-center border-t px-3 py-2">

          {/* IZQUIERDA */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            Borrar
          </Button>

          {/* DERECHA */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange(dayjs().format("YYYY-MM-DD"))
            }
          >
            Hoy
          </Button>

        </div>

      </PopoverContent>
    </Popover>
  );
}