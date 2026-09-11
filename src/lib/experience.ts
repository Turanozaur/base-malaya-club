export const MONTH_NAMES = [
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

/** Full calendar years elapsed since a month (inclusive of start month). */
export function fullYearsSince(
  start: Date,
  reference: Date = new Date(),
): number {
  let years = reference.getFullYear() - start.getFullYear();
  const monthDiff = reference.getMonth() - start.getMonth();
  if (monthDiff < 0) years--;
  return Math.max(0, years);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Parse YYYY-MM or YYYY-MM-DD into month/year parts. */
export function parseMonthYearValue(value?: string): {
  year: string;
  month: string;
} {
  const match = value?.match(/^(\d{4})-(\d{2})/);
  if (!match) return { year: "", month: "" };
  return { year: match[1], month: match[2] };
}

export function monthYearToIso(year: string, month: string): string {
  if (!year || !month) return "";
  return `${year}-${month.padStart(2, "0")}`;
}

export function isoMonthYearToDate(iso: string): Date {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

/** First day of month for seed data and migrations. */
export function sinceMonthYear(year: number, month = 1): Date {
  return new Date(year, month - 1, 1);
}
