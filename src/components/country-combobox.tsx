"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { COUNTRIES } from "@/lib/countries";
import { countryFlagFromCode } from "@/lib/country-flag";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type CountryComboboxProps = {
  name: string;
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  onValueChange?: () => void;
};

export function CountryCombobox({
  name,
  defaultValue = "",
  id = "country",
  "aria-invalid": ariaInvalid,
  onValueChange,
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultValue);
  const [query, setQuery] = React.useState(defaultValue);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  React.useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [selected]);

  function pick(country: (typeof COUNTRIES)[number]) {
    setSelected(country.name);
    setQuery(country.name);
    setOpen(false);
    onValueChange?.();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
    if (selected && e.target.value !== selected) {
      setSelected("");
      onValueChange?.();
    }
  }

  function onInputFocus() {
    setOpen(true);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery(selected);
    }
    if (e.key === "Enter" && open && filtered[0]) {
      e.preventDefault();
      pick(filtered[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected} />
      <div className="relative">
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search country…"
          value={query}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onKeyDown={onKeyDown}
          aria-invalid={ariaInvalid}
          className="pr-9"
        />
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {open && filtered.length > 0 ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-sm shadow-md"
        >
          {filtered.map((country) => {
            const flag = countryFlagFromCode(country.code);
            return (
              <li
                key={country.code}
                role="option"
                aria-selected={selected === country.name}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent",
                    selected === country.name && "bg-accent",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(country)}
                >
                  {flag ? (
                    <span aria-hidden className="text-base leading-none">
                      {flag}
                    </span>
                  ) : null}
                  <span>{country.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open && query && filtered.length === 0 ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
          No matching country — pick from the list.
        </div>
      ) : null}
    </div>
  );
}
