"use client";

import * as React from "react";

import {
  MONTH_NAMES,
  monthYearToIso,
  parseMonthYearValue,
} from "@/lib/experience";

type MonthYearInputProps = {
  name: string;
  defaultValue?: string;
  idPrefix: string;
  hint?: string;
};

export function MonthYearInput({
  name,
  defaultValue = "",
  idPrefix,
  hint,
}: MonthYearInputProps) {
  const initial = parseMonthYearValue(defaultValue);
  const currentYear = new Date().getFullYear();

  const [year, setYear] = React.useState(initial.year);
  const [month, setMonth] = React.useState(initial.month);

  const isoValue = monthYearToIso(year, month);
  const isPartial = Boolean((year && !month) || (month && !year));

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1950; y--) list.push(y);
    return list;
  }, [currentYear]);

  const selectCls =
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={isoValue} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${idPrefix}-month`} className="sr-only">
            Month
          </label>
          <select
            id={`${idPrefix}-month`}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={selectCls}
            aria-label="Month"
          >
            <option value="">Month</option>
            {MONTH_NAMES.map((label, i) => (
              <option key={label} value={String(i + 1).padStart(2, "0")}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-year`} className="sr-only">
            Year
          </label>
          <select
            id={`${idPrefix}-year`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectCls}
            aria-label="Year"
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isPartial ? (
        <p className="text-xs text-destructive" role="alert">
          Select both month and year, or clear both.
        </p>
      ) : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
