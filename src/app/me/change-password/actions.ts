"use server";

import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/password";

export type ChangePasswordState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: ChangePasswordState | undefined,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "You must be signed in." };
  }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  });

  if (!user?.hashedPassword) {
    return {
      message:
        "You have not set a password yet. Check your email for the setup link.",
    };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.hashedPassword,
  );
  if (!valid) {
    return { errors: { currentPassword: ["Current password is incorrect"] } };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword },
  });

  return { success: true };
}
