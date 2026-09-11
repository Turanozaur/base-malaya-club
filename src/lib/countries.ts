import countriesData from "@/lib/countries.json";

export type Country = {
  code: string;
  name: string;
};

export const COUNTRIES = countriesData as Country[];

export const COUNTRY_NAMES = new Set(COUNTRIES.map((c) => c.name));

const byName = new Map(COUNTRIES.map((c) => [c.name, c]));
const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryByName(name: string | null | undefined): Country | undefined {
  if (!name?.trim()) return undefined;
  return byName.get(name.trim());
}

export function countryByCode(code: string | null | undefined): Country | undefined {
  if (!code?.trim()) return undefined;
  return byCode.get(code.trim().toUpperCase());
}

export function isValidCountryName(name: string): boolean {
  return COUNTRY_NAMES.has(name);
}
