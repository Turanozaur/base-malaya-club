import { isValidCountryName } from "@/lib/countries";

const GENDERS = new Set(["MALE", "FEMALE"]);

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}

function isValidOptionalMonthYear(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!/^\d{4}-\d{2}$/.test(trimmed)) return false;
  const [y, m] = trimmed.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date <= new Date();
}

/** Client-side check aligned with registerSchema required fields. */
export function isRegisterFormReady(formData: FormData): boolean {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;

  const name = raw.name?.trim() ?? "";
  if (name.length < 2 || name.length > 120) return false;

  const email = raw.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) return false;

  const country = raw.country?.trim() ?? "";
  if (!country || !isValidCountryName(country)) return false;

  if (!GENDERS.has(raw.gender ?? "")) return false;

  if (
    raw.participatedBasejumpInMalaysia !== "true" &&
    raw.participatedBasejumpInMalaysia !== "false"
  ) {
    return false;
  }

  const birthDate = raw.birthDate?.trim() ?? "";
  if (!isValidBirthDate(birthDate)) return false;

  if (raw.personalDataConsent !== "true") return false;

  const voucher = raw.voucher?.trim() ?? "";
  if (voucher.length < 2 || voucher.length > 200) return false;

  if (!isValidOptionalMonthYear(raw.baseSince ?? "")) return false;
  if (!isValidOptionalMonthYear(raw.skydiveSince ?? "")) return false;

  return true;
}
