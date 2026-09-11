import { countryByName } from "@/lib/countries";

function isoToFlagEmoji(iso: string): string {
  const code = iso.toUpperCase();
  if (code.length !== 2) return "";
  return [...code]
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join("");
}

/** Returns a flag emoji for a country name, or null if unknown. */
export function countryFlag(country: string | null | undefined): string | null {
  const entry = countryByName(country);
  if (!entry) return null;
  return isoToFlagEmoji(entry.code);
}

export function countryFlagFromCode(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  return isoToFlagEmoji(code);
}
