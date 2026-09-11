"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Role, RegistrationStatus, PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
  return session.user;
}

export async function setPaymentStatusAction(
  registrationId: string,
  paid: boolean,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { paymentStatus: paid ? PaymentStatus.PAID : PaymentStatus.PENDING },
    });
    revalidatePath(`/admin/events`);
    return {};
  } catch {
    return { error: "Failed to update payment status" };
  }
}

export async function adminCancelRegistrationAction(
  registrationId: string,
  eventSlug: string,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();

    const reg = await prisma.eventRegistration.findUniqueOrThrow({
      where: { id: registrationId },
    });

    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
    });

    // Promote next waitlisted
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

    revalidatePath(`/admin/events/${reg.eventId}/registrations`);
    revalidatePath(`/events/${eventSlug}`);
    return {};
  } catch {
    return { error: "Failed to cancel registration" };
  }
}

export async function markAttendedAction(
  registrationId: string,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.ATTENDED },
    });
    revalidatePath(`/admin/events`);
    return {};
  } catch {
    return { error: "Failed to mark as attended" };
  }
}

/**
 * Takes a profile snapshot of all active registrations and enables the wall of fame.
 * This is the single action behind the "Publish Wall of Fame" toggle.
 */
export async function publishWallOfFameAction(
  eventId: string,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();

    const storage = getStorageProvider();

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId,
        status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED] },
      },
      include: {
        user: {
          select: {
            name: true,
            country: true,
            image: true,
            baseJumpCount: true,
            skydiveJumpCount: true,
            baseSince: true,
            skydiveSince: true,
            instagram: true,
          },
        },
      },
    });

    // Snapshot each participant's current profile.
    await Promise.all(
      registrations.map((reg) => {
        const photoUrl = reg.eventPhotoKey
          ? storage.getPublicUrl(reg.eventPhotoKey)
          : reg.user.image ?? null;

        if (!photoUrl) return; // no photo — skip this participant on the wall

        return prisma.eventRegistration.update({
          where: { id: reg.id },
          data: {
            profileSnapshot: {
              name: reg.user.name,
              country: reg.user.country,
              baseJumpCount: reg.user.baseJumpCount,
              skydiveJumpCount: reg.user.skydiveJumpCount,
              baseSince: reg.user.baseSince,
              skydiveSince: reg.user.skydiveSince,
              instagram: reg.user.instagram,
              photoUrl,
            },
          },
        });
      }),
    );

    await prisma.event.update({
      where: { id: eventId },
      data: { wallOfFamePublic: true },
    });

    revalidatePath(`/admin/events/${eventId}/registrations`);
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to publish wall of fame" };
  }
}

export async function unpublishWallOfFameAction(eventId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    await prisma.event.update({
      where: { id: eventId },
      data: { wallOfFamePublic: false },
    });
    revalidatePath(`/admin/events/${eventId}/registrations`);
    return {};
  } catch {
    return { error: "Failed to unpublish wall of fame" };
  }
}
