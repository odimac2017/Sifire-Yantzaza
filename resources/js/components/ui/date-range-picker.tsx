"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface Props {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  presets?: boolean;
}

export default function DateRangePicker({
  value,
  onChange,
  presets = true,
}: Props) {

  // 🔥 FIX DEFINITIVO: usar medio día
  const fixDate = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, // 👈 clave para evitar desfase
      0,
      0
    );

  const today = fixDate(new Date());

  // 🚀 PRESETS
  const presetsList = [
    {
      label: "Hoy",
      getValue: () => ({
        from: today,
        to: today,
      }),
    },
    {
      label: "Últimos 7 días",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
        to: today,
      }),
    },
    {
      label: "Últimos 30 días",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)),
        to: today,
      }),
    },
    {
      label: "Este mes",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: today,
      }),
    },
    {
    label: "Mes anterior",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: fixDate(new Date(today.getFullYear(), today.getMonth(), 0)),
      }),
    },
    /*
    {
      label: "Últimos 6 meses",
      getValue: () => {
        const past = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          1
        );
        return {
          from: fixDate(past),
          to: today,
        };
      },
    },*/
    {
      label: "Este año",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear(), 0, 1)),
        to: today,
      }),
    },
    {
      label: "Año anterior",
      getValue: () => ({
        from: fixDate(new Date(today.getFullYear() - 1, 0, 1)),
        to: fixDate(new Date(today.getFullYear() - 1, 11, 31)),
      }),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />

          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd/MM/yyyy", { locale: es })} -{" "}
                {format(value.to, "dd/MM/yyyy", { locale: es })}
              </>
            ) : (
              format(value.from, "dd/MM/yyyy", { locale: es })
            )
          ) : (
            <span>Seleccionar rango</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">

          {/* 🎯 PRESETS */}
          {presets && (
            <div className="flex flex-col gap-1 p-3 border-r">
              {presetsList.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="justify-start text-sm"
                  onClick={() => {
                    const range = preset.getValue();

                    onChange({
                      from: range.from,
                      to: range.to,
                    });
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          {/* 📅 CALENDARIO */}
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            numberOfMonths={2}
            locale={es}
            onSelect={(range) => {
              if (!range) return;

              onChange({
                from: range.from ? fixDate(range.from) : undefined,
                to: range.to ? fixDate(range.to) : undefined,
              });
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}