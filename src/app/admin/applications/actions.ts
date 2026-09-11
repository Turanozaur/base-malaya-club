"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, UserStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendRejectionEmail } from "@/lib/email";
import { issuePasswordSetupInvite } from "@/lib/password-setup";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return session.user;
}

async function writeAuditLog(
  actorId: string,
  action: string,
  targetId: string,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: { actorId, action, targetType: "User", targetId, metadata },
  });
}

// ─── Approve ────────────────────────────────────────────────────────────────

export async function approveUserAction(
  userId: string,
  showInMembersDirectory = true,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: actor.id,
        rejectionReason: null,
        showInMembersDirectory,
      },
    });

    await writeAuditLog(actor.id, "user.approve", userId);

    if (!user.hashedPassword) {
      await issuePasswordSetupInvite(user).catch((err) => {
        console.error("[email] Password setup email failed:", err);
      });
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    revalidatePath("/members");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to approve user" };
  }
}

// ─── Reject ──────────────────────────────────────────────────────────────────

const rejectSchema = z.object({
  userId: z.string(),
  reason: z.string().max(500).optional(),
});

export async function rejectUserAction(
  userId: string,
  reason?: string,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();
    const parsed = rejectSchema.parse({ userId, reason });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: parsed.userId } });

    await prisma.user.update({
      where: { id: parsed.userId },
      data: {
        status: UserStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedById: actor.id,
        rejectionReason: parsed.reason ?? null,
      },
    });

    await writeAuditLog(actor.id, "user.reject", parsed.userId, {
      reason: parsed.reason,
    });

    await sendRejectionEmail(
      user.email,
      user.name ?? user.email,
      parsed.reason,
    ).catch((err) => {
      console.error("[email] Rejection email failed:", err);
    });

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    revalidatePath("/members");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to reject user" };
  }
}
