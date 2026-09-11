"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { UserStatus, RegistrationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isEventVisibleToMember } from "@/lib/event-visibility";
import {
  sendEventRegistrationEmail,
  sendNewRegistrationNotification,
} from "@/lib/email";

async function requireApproved() {
  const session = await auth();
  if (!session?.user || session.user.status !== UserStatus.APPROVED) {
    return { error: "You must be an approved member to register for events" } as const;
  }
  return { user: session.user };
}

const registerSchema = z.object({
  eventId: z.string().min(1),
  eventPhotoKey: z.string().optional(),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerForEventAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const auth = await requireApproved();
  if ("error" in auth) return auth;
  const { user } = auth;

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid form data" };

  const { eventId, eventPhotoKey } = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      createdBy: { select: { email: true, name: true } },
      _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } },
    },
  });

  if (!event) return { error: "Event not found" };
  if (!isEventVisibleToMember(event)) return { error: "Event not found" };
  if (event.status !== "PUBLISHED") return { error: "This event is not open for registration" };

  // Check capacity
  const activeCount = event._count.registrations;
  const isWaitlisted = event.capacity != null && activeCount >= event.capacity;

  // Check if user has an avatar when no event photo provided
  const userRecord = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { image: true, name: true, email: true, baseJumpCount: true },
  });

  if (!userRecord.baseJumpCount || userRecord.baseJumpCount === 0) {
    return { error: "Only BASE jumpers with at least one jump can register for events" };
  }

  if (!eventPhotoKey && !userRecord.image) {
    return { error: "A photo is required for the wall of fame since you have no avatar" };
  }

  try {
    await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: user.id,
        status: isWaitlisted ? RegistrationStatus.WAITLISTED : RegistrationStatus.REGISTERED,
        eventPhotoKey: eventPhotoKey || null,
      },
    });
  } catch {
    return { error: "You are already registered for this event" };
  }

  // Emails — non-fatal
  const totalRegistered = activeCount + (isWaitlisted ? 0 : 1);

  await sendEventRegistrationEmail(
    userRecord.email,
    userRecord.name ?? userRecord.email,
    event.title,
    event.startDate,
    event.slug,
  ).catch((err) => console.error("[email] Registration email failed:", err));

  if (!isWaitlisted && event.createdBy.email) {
    await sendNewRegistrationNotification(
      event.createdBy.email,
      event.createdBy.name ?? event.createdBy.email,
      userRecord.name ?? userRecord.email,
      event.title,
      event.slug,
      totalRegistered,
    ).catch((err) => console.error("[email] Organizer notification failed:", err));
  }

  revalidatePath(`/events/${event.slug}`);
  return { success: true };
}

export async function cancelRegistrationAction(
  registrationId: string,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const reg = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { event: { select: { slug: true } } },
  });

  if (!reg) return { error: "Registration not found" };

  // Only the registrant or an admin can cancel.
  if (reg.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
  });

  // Promote the first waitlisted participant if capacity allows.
  if (reg.status === RegistrationStatus.REGISTERED) {
    const next = await prisma.eventRegistration.findFirst({
      where: { eventId: reg.eventId, status: RegistrationStatus.WAITLISTED },
      orderBy: { registeredAt: "asc" },
    });
    if (next) {
      await prisma.eventRegistration.update({
        where: { id: next.id },
        data: { status: RegistrationStatus.REGISTERED },
      });
    }
  }

  revalidatePath(`/events/${reg.event.slug}`);
  return {};
}
