"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sortUsersByName } from "@/lib/user-sort";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/");
  return session.user;
}

const schema = z.object({
  eventId: z.string().min(1),
  userIds: z.array(z.string()),
});

export async function saveEventPhotographersAction(
  eventId: string,
  userIds: string[],
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const parsed = schema.parse({ eventId, userIds });

    const event = await prisma.event.findUniqueOrThrow({
      where: { id: parsed.eventId },
      select: { slug: true },
    });

    // Only APPROVED users can be assigned.
    const validUsers = await prisma.user.findMany({
      where: { id: { in: parsed.userIds }, status: UserStatus.APPROVED },
      select: { id: true },
    });
    const validIds = new Set(validUsers.map((u) => u.id));

    await prisma.$transaction(async (tx) => {
      await tx.eventPhotographer.deleteMany({ where: { eventId: parsed.eventId } });
      if (validIds.size > 0) {
        await tx.eventPhotographer.createMany({
          data: [...validIds].map((userId) => ({ eventId: parsed.eventId, userId })),
        });
      }
    });

    revalidatePath(`/admin/events/${parsed.eventId}/edit`);
    revalidatePath(`/events/${event.slug}`);
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to save photographers" };
  }
}

export async function getApprovedUsersForPicker(): Promise<
  { id: string; name: string | null; email: string; country: string | null }[]
> {
  await requireAdmin();
  return sortUsersByName(
    await prisma.user.findMany({
      where: { status: UserStatus.APPROVED },
      select: { id: true, name: true, email: true, country: true },
    }),
  );
}
