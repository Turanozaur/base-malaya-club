"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, EventStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveEventFromVisibilityForm } from "@/lib/event-visibility";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
  return session.user;
}

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  description: z.string().max(5000).optional(),
  schedule: z.string().max(5000).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  objectId: z.string().optional(),
  requiresPayment: z.coerce.boolean().optional(),
  visiblePublic: z.coerce.boolean().optional(),
  visibleMembers: z.coerce.boolean().optional(),
  schedulePublic: z.coerce.boolean().optional(),
  summaryPublic: z.coerce.boolean().optional(),
});

export type EventFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const actor = await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const d = parsed.data;
  const startDate = new Date(d.startDate);
  const endDate = d.endDate ? new Date(d.endDate) : null;
  const visibility = resolveEventFromVisibilityForm(
    d.visiblePublic ?? false,
    d.visibleMembers ?? false,
    EventStatus.DRAFT,
    startDate,
    endDate,
  );

  try {
    await prisma.event.create({
      data: {
        title: d.title,
        slug: d.slug,
        description: d.description || null,
        schedule: d.schedule || null,
        startDate,
        endDate,
        capacity: d.capacity || null,
        objectId: d.objectId || null,
        requiresPayment: d.requiresPayment ?? false,
        visiblePublic: visibility.visiblePublic,
        visibleMembers: visibility.visibleMembers,
        status: visibility.status as EventStatus,
        schedulePublic: d.schedulePublic ?? false,
        summaryPublic: d.summaryPublic ?? false,
        createdById: actor.id,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2002")) return { error: "An event with this slug already exists" };
    return { error: "Failed to create event" };
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/gallery");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEventAction(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const d = parsed.data;
  const existing = await prisma.event.findUniqueOrThrow({ where: { id } });
  const startDate = new Date(d.startDate);
  const endDate = d.endDate ? new Date(d.endDate) : null;
  const visibility = resolveEventFromVisibilityForm(
    d.visiblePublic ?? false,
    d.visibleMembers ?? false,
    existing.status,
    startDate,
    endDate,
  );

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: d.title,
        slug: d.slug,
        description: d.description || null,
        schedule: d.schedule || null,
        startDate,
        endDate,
        capacity: d.capacity || null,
        objectId: d.objectId || null,
        requiresPayment: d.requiresPayment ?? false,
        visiblePublic: visibility.visiblePublic,
        visibleMembers: visibility.visibleMembers,
        status: visibility.status as EventStatus,
        schedulePublic: d.schedulePublic ?? false,
        summaryPublic: d.summaryPublic ?? false,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2002")) return { error: "An event with this slug already exists" };
    return { error: "Failed to update event" };
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${d.slug}`);
  revalidatePath("/gallery");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id }, select: { slug: true } });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/events");
  if (event) revalidatePath(`/events/${event.slug}`);
  revalidatePath("/gallery");
  revalidatePath("/admin/events");
}
