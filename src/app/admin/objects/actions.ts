"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, ObjectType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
  return session.user;
}

const objectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  type: z.enum(["BUILDING", "ANTENNA", "SPAN", "EARTH"]),
  description: z.string().max(5000).optional(),
  heightMeters: z.coerce.number().int().positive().optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export type ObjectFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createObjectAction(
  _prev: ObjectFormState,
  formData: FormData,
): Promise<ObjectFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = objectSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, slug, type, description, heightMeters, city, latitude, longitude, isActive } =
    parsed.data;

  try {
    await prisma.baseObject.create({
      data: {
        name,
        slug,
        type: type as ObjectType,
        description: description || null,
        heightMeters: heightMeters || null,
        city: city || null,
        latitude: latitude || null,
        longitude: longitude || null,
        isActive: isActive ?? true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2002")) return { error: "An object with this slug already exists" };
    return { error: "Failed to create object" };
  }

  revalidatePath("/");
  revalidatePath("/objects");
  revalidatePath("/gallery");
  revalidatePath("/admin/objects");
  redirect("/admin/objects");
}

export async function updateObjectAction(
  id: string,
  _prev: ObjectFormState,
  formData: FormData,
): Promise<ObjectFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = objectSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, slug, type, description, heightMeters, city, latitude, longitude, isActive } =
    parsed.data;

  try {
    await prisma.baseObject.update({
      where: { id },
      data: {
        name,
        slug,
        type: type as ObjectType,
        description: description || null,
        heightMeters: heightMeters || null,
        city: city || null,
        latitude: latitude || null,
        longitude: longitude || null,
        isActive: isActive ?? true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2002")) return { error: "An object with this slug already exists" };
    return { error: "Failed to update object" };
  }

  revalidatePath("/");
  revalidatePath("/objects");
  revalidatePath(`/objects/${slug}`);
  revalidatePath("/gallery");
  revalidatePath("/admin/objects");
  redirect("/admin/objects");
}

export async function deleteObjectAction(id: string): Promise<void> {
  await requireAdmin();
  const object = await prisma.baseObject.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.baseObject.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/objects");
  if (object) revalidatePath(`/objects/${object.slug}`);
  revalidatePath("/gallery");
  revalidatePath("/admin/objects");
}
