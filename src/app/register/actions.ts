"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getStorageProvider, isPendingAvatarKeyForEmail } from "@/lib/storage";
import { registerSchema } from "@/lib/validations/auth";

export type RegisterState = {
  errors?: Record<string, string[]>;
  message?: string;
  // Submitted values echoed back so the form survives a validation error.
  values?: Record<string, string>;
};

export async function registerAction(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw };
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      errors: { email: ["This email is already registered."] },
      values: raw,
    };
  }

  try {
    let image: string | undefined;
    if (
      data.avatarStorageKey &&
      isPendingAvatarKeyForEmail(data.avatarStorageKey, data.email)
    ) {
      image = getStorageProvider().getPublicUrl(data.avatarStorageKey);
    }

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image,
        country: data.country,
        gender: data.gender,
        participatedBasejumpInMalaysia: data.participatedBasejumpInMalaysia,
        birthDate: data.birthDate,
        showBirthDatePublicly: data.showBirthDatePublicly,
        personalDataConsentAt: new Date(),
        baseJumpCount: data.baseJumpCount,
        skydiveJumpCount: data.skydiveJumpCount,
        baseSince: data.baseSince,
        skydiveSince: data.skydiveSince,
        instagram: data.instagram,
        facebook: data.facebook,
        whatsapp: data.whatsapp,
        telegram: data.telegram,
        voucherNote: data.voucher,
        bio: data.bio,
        // role and status come from schema defaults: MEMBER + PENDING.
      },
    });
  } catch (err: unknown) {
    // P2002: unique constraint — email registered between our check and insert.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return {
        errors: { email: ["This email is already registered."] },
        values: raw,
      };
    }
    throw err;
  }

  redirect("/register/submitted");
}
