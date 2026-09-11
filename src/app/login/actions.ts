"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/me",
    });
  } catch (error) {
    // signIn throws a redirect on success — rethrow it so Next.js handles it.
    if (error instanceof AuthError) {
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
        select: { status: true, hashedPassword: true },
      });

      if (user?.status === UserStatus.APPROVED && !user.hashedPassword) {
        return {
          message:
            "Your application is approved, but you have not set a password yet. Check your email for the setup link.",
        };
      }

      return {
        message:
          "Incorrect email or password, or your application has not been approved yet.",
      };
    }
    throw error;
  }

  return {};
}
