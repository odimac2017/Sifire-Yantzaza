import { Input } from "@/components/ui/input";
import { FilterConfig } from "@/types/filters";
import { SearchIcon } from "lucide-react";
import YearPicker from "@/components/ui/yearPicker";
import { DatePicker } from "@/components/ui/date-picker";
import DateRangePicker from "@/components/ui/date-range-picker";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

interface Props<T> {
  filters: T;
  updateFilter: (key: keyof T, value: any) => void;
  config: FilterConfig<T>[];
}

export default function AutoFilters<T>({
  filters,
  updateFilter,
  config,
}: Props<T>) {

  return (
    <div className="flex flex-wrap items-center gap-3">

      {config.map((filter, index) => {

        if (filter.type === "search") {
          return (
            <div key={index} className="relative w-[260px]">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                className="pl-9 bg-white dark:bg-background"
                placeholder={filter.placeholder}
                value={(filters as any)[filter.key] ?? ""}
                onChange={(e) =>
                  updateFilter(filter.key, e.target.value)
                }
              />
            </div>
          );
        }

        if (filter.type === "select") {
          return (
            <Select
              key={index}
              value={(filters as any)[filter.key] ?? ""}
              onValueChange={(value) =>
                updateFilter(filter.key, value)
              }
            >
              <SelectTrigger className="w-[220px] bg-white dark:bg-background">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>

              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        if (filter.type === "date") {
          return (
            <DatePicker
              key={index}
              value={(filters as any)[filter.key]}
              onChange={(value) =>
                updateFilter(filter.key, value)
              }
            />
          );
        }

        if (filter.type === "year") {
          return (
            <YearPicker
              key={index}
              value={(filters as any)[filter.key]}
              fromYear={filter.fromYear}
              toYear={filter.toYear}
              onChange={(year) => updateFilter(filter.key, year)}
            />
          );
        }

        if (filter.type === "switch") {
          return (
            <div key={index} className="flex items-center gap-2">
              <Switch
                checked={(filters as any)[filter.key] ?? false}
                onCheckedChange={(value) =>
                  updateFilter(filter.key, value)
                }
              />
              <span className="text-sm">{filter.label}</span>
            </div>
          );
        }

        if (filter.type === "dateRange") {
          return (
            <DateRangePicker
              key={index}
              value={(filters as any)[filter.key]}
              presets={filter.presets}
              onChange={(value) => {
                updateFilter(filter.key, value);
              }}
            />
          );
        }

        return null;
      })}

    </div>
  );
}
