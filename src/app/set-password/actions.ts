"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn } from "@/auth";
import { completePasswordSetup } from "@/lib/password-setup";
import { setPasswordSchema } from "@/lib/validations/password";

export type SetPasswordState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function setPasswordAction(
  _prevState: SetPasswordState | undefined,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { token, password } = parsed.data;

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await completePasswordSetup(token, hashedPassword);

  if (!result) {
    return {
      message:
        "This link is invalid or has expired. Contact the club if you need a new one.",
    };
  }

  try {
    await signIn("credentials", {
      email: result.email,
      password,
      redirectTo: "/me",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Password saved, but sign-in failed. Try logging in." };
    }
    throw error;
  }

  return {};
}
