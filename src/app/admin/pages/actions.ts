"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
}

const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required"),
});

export type PageFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  success?: boolean;
};

export async function updatePageAction(
  slug: string,
  _prev: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.page.upsert({
    where: { slug },
    update: { title: parsed.data.title, body: parsed.data.body },
    create: { slug, title: parsed.data.title, body: parsed.data.body },
  });

  revalidatePath("/");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  return { success: true };
}
