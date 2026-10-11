import { useState, useMemo, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react";

interface Option {
  id: number;
  nombre: string;
}

interface OptionGroup {
  label: string;
  options: Option[];
  icon?: React.ReactNode;
}

interface Props {
  label?: string;
  name: string;
  value: number | number[] | null;
  options?: (Option | OptionGroup)[];
  error?: string;
  placeholder?: string;
  uppercase?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (value: number | number[] | null) => void;
}

export default function SearchableSelectField({
  label,
  name,
  value,
  options,
  error,
  placeholder = "Seleccione",
  uppercase = false,
  multiple = false,
  disabled = false,
  onChange,
}: Props) {

  const safeOptions = options ?? [];

  const isGroup = (item: any): item is OptionGroup =>
    Array.isArray(item?.options);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedIds: number[] = useMemo(() => {
    if (multiple) {
      if (Array.isArray(value)) return value;
      if (typeof value === "number") return [value];
      return [];
    }

    if (typeof value === "number") return [value];
    return [];
  }, [value, multiple]);

  const flatOptions = useMemo(() => {
    return safeOptions.flatMap((item) =>
      isGroup(item) ? item.options : [item]
    );
  }, [safeOptions]);

  const selectedOptions = useMemo(() => {
    return flatOptions.filter((o) => selectedIds.includes(o.id));
  }, [selectedIds, flatOptions]);

  const filtered = useMemo(() => {
    return safeOptions
      .map((item) => {
        if (isGroup(item)) {
          const filteredOptions = item.options.filter((option) =>
            option.nombre?.toLowerCase().includes(search.toLowerCase())
          );

          if (filteredOptions.length) {
            return { ...item, options: filteredOptions };
          }

          return null;
        }

        if (item.nombre?.toLowerCase().includes(search.toLowerCase())) {
          return item;
        }

        return null;
      })
      .filter((item): item is Option | OptionGroup => item !== null);
  }, [search, safeOptions]);

  const toggleSelect = (id: number) => {

    if (!multiple) {
      onChange(id);
      setOpen(false);
      setSearch("");
      return;
    }

    const current: number[] = Array.isArray(value) ? value : [];

    let updated: number[];

    if (current.includes(id)) {
      updated = current.filter((v) => v !== id);
    } else {
      updated = [...current, id];
    }

    onChange(updated);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const removeBadge = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!multiple) {
      onChange(null);
      return;
    }

    onChange(selectedIds.filter((v) => v !== id));
  };

  const handleToggle = () => {
    if (disabled) return;

    if (!open && triggerRef.current) {

      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;

      setOpenUpwards(spaceBelow < dropdownHeight);

      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });

      setSearch("");
    }

    setOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  useEffect(() => {

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleEsc);

    return () =>
      document.removeEventListener("keydown", handleEsc);

  }, []);

  return (
    <div className="grid w-full gap-1 relative" ref={containerRef}>

      {label && <Label className="mb-2">{label}</Label>}

      <div className="relative">

        <div
          ref={triggerRef}
          onClick={() => {
            if (disabled) return;
            handleToggle();
          }}
          className={cn(
            "border-input flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1 text-sm shadow-xs cursor-pointer",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >

          {selectedOptions.length === 0 && (
            <span className="text-muted-foreground px-1">
              {placeholder}
            </span>
          )}

          {!multiple && selectedOptions.length > 0 && (
            <span className="px-1">
              {uppercase
                ? selectedOptions[0].nombre.toUpperCase()
                : selectedOptions[0].nombre}
            </span>
          )}

          {multiple &&
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs"
              >
                {uppercase
                  ? option.nombre.toUpperCase()
                  : option.nombre}

                <XIcon
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => removeBadge(option.id, e)}
                />
              </span>
            ))}

          <div className="ml-auto flex items-center gap-1">

            {selectedOptions.length > 0 && (
              <XIcon
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={clearSelection}
              />
            )}

            <ChevronDownIcon className="h-4 w-4 opacity-50" />

          </div>

        </div>

        {open && (
          <div
            style={{
              position: "fixed",
              top: openUpwards
                ? dropdownPosition.top - 260
                : dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999,
            }}
            className="rounded-md border bg-popover shadow-md"
          >

            <div className="p-2">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="h-8"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">

              {filtered.length > 0 ? (
                filtered.map((item, index) => {

                  if (isGroup(item)) {

                    return (
                      <div key={index}>

                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          {item.icon}
                          {item.label}
                        </div>

                        {item.options.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => toggleSelect(option.id)}
                            className={cn(
                              "px-9 py-2 text-sm hover:bg-muted cursor-pointer flex justify-between",
                              selectedIds.includes(option.id) &&
                                "bg-muted font-medium"
                            )}
                          >
                            {uppercase
                              ? option.nombre.toUpperCase()
                              : option.nombre}

                            {selectedIds.includes(option.id) && (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </div>
                        ))}

                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={cn(
                        "px-3 py-2 text-sm hover:bg-muted cursor-pointer flex justify-between",
                        selectedIds.includes(item.id) &&
                          "bg-muted font-medium"
                      )}
                    >
                      {uppercase
                        ? item.nombre.toUpperCase()
                        : item.nombre}

                      {selectedIds.includes(item.id) && (
                        <CheckIcon className="h-4 w-4" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Sin resultados
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      <InputError message={error} />

    </div>
  );
}