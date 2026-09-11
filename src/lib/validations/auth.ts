import { z } from "zod";

import { Gender } from "@/generated/prisma/client";
import { isValidCountryName } from "@/lib/countries";
import { isoMonthYearToDate } from "@/lib/experience";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(2000).optional(),
);

const optionalCount = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(0).max(100000).optional(),
);

const birthDateSchema = z
  .string()
  .min(1, "Date of birth is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select your full date of birth")
  .transform((s) => new Date(s))
  .refine((d) => !Number.isNaN(d.getTime()), "Invalid date")
  .refine((d) => d <= new Date(), "Date cannot be in the future");

const optionalStorageKey = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const checkboxBoolean = z.preprocess(
  (v) => v === "true" || v === true,
  z.boolean(),
);

const optionalMonthYear = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Please select both month and year, or leave both empty")
    .transform(isoMonthYearToDate)
    .refine((d) => d <= new Date(), "Cannot be in the future")
    .optional(),
);

const requiredBooleanChoice = z
  .enum(["true", "false"], { message: "Please select an option" })
  .transform((v) => v === "true");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters required").max(120),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .refine(isValidCountryName, "Please select a country from the list"),
  gender: z.nativeEnum(Gender, { message: "Please select your gender" }),
  participatedBasejumpInMalaysia: requiredBooleanChoice,
  birthDate: birthDateSchema,
  avatarStorageKey: optionalStorageKey,
  showBirthDatePublicly: checkboxBoolean.optional().default(false),
  personalDataConsent: z.preprocess(
    (v) => v === "true" || v === true,
    z.literal(true, {
      message: "You must agree to personal data processing",
    }),
  ),
  baseJumpCount: optionalCount,
  skydiveJumpCount: optionalCount,
  baseSince: optionalMonthYear,
  skydiveSince: optionalMonthYear,
  instagram: optionalText,
  facebook: optionalText,
  whatsapp: optionalText,
  telegram: optionalText,
  voucher: z.string().trim().min(2, "Please name your voucher").max(200),
  bio: optionalText,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profilePrivacySchema = z.object({
  showBirthDatePublicly: checkboxBoolean.optional().default(false),
});
