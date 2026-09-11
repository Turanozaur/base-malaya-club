"use server";

import { revalidatePath } from "next/cache";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profilePrivacySchema } from "@/lib/validations/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export type ProfilePrivacyState = {
  success?: boolean;
  error?: string;
};

export async function updateProfilePrivacyAction(
  _prev: ProfilePrivacyState | undefined,
  formData: FormData,
): Promise<ProfilePrivacyState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const parsed = profilePrivacySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { showBirthDatePublicly: parsed.data.showBirthDatePublicly },
  });

  revalidatePath("/me");
  revalidatePath("/members");
  return { success: true };
}
