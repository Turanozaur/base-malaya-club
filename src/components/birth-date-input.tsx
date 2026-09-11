"use client";

import * as React from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseIsoDate(value?: string): {
  year: string;
  month: string;
  day: string;
} {
  if (!value?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { year: "", month: "", day: "" };
  }
  const [year, month, day] = value.split("-");
  return { year, month, day };
}

type BirthDateInputProps = {
  name?: string;
  defaultValue?: string;
  idPrefix?: string;
  onValueChange?: () => void;
};

export function BirthDateInput({
  name = "birthDate",
  defaultValue = "",
  idPrefix = "birthDate",
  onValueChange,
}: BirthDateInputProps) {
  const initial = parseIsoDate(defaultValue);
  const currentYear = new Date().getFullYear();

  const [year, setYear] = React.useState(initial.year);
  const [month, setMonth] = React.useState(initial.month);
  const [day, setDay] = React.useState(initial.day);

  const isoValue =
    year && month && day
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "";

  const maxDay =
    year && month ? daysInMonth(Number(year), Number(month)) : 31;

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) list.push(y);
    return list;
  }, [currentYear]);

  React.useEffect(() => {
    onValueChange?.();
  }, [isoValue, onValueChange]);

  const selectCls =
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={isoValue} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor={`${idPrefix}-day`} className="sr-only">
            Day
          </label>
          <select
            id={`${idPrefix}-day`}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={selectCls}
            aria-label="Day of birth"
          >
            <option value="">Day</option>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={String(d)}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-month`} className="sr-only">
            Month
          </label>
          <select
            id={`${idPrefix}-month`}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={selectCls}
            aria-label="Month of birth"
          >
            <option value="">Month</option>
            {MONTHS.map((label, i) => (
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
            aria-label="Year of birth"
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
    </div>
  );
}
