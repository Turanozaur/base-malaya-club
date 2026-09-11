"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role, UserStatus, Permission, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
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

export async function setUserStatusAction(
  userId: string,
  status: string,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      return { error: "Invalid status" };
    }

    const validStatus = status as UserStatus;

    // Prevent admin from suspending themselves.
    if (userId === actor.id && validStatus === UserStatus.SUSPENDED) {
      return { error: "You cannot suspend your own account" };
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, hashedPassword: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: validStatus,
        reviewedAt: new Date(),
        reviewedById: actor.id,
      },
    });

    await writeAuditLog(actor.id, `user.status.${status.toLowerCase()}`, userId);

    if (validStatus === UserStatus.APPROVED && !user.hashedPassword) {
      await issuePasswordSetupInvite(user).catch((err) => {
        console.error("[email] Password setup email failed:", err);
      });
    }
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to update user status" };
  }
}

export async function grantPermissionAction(
  userId: string,
  permission: string,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    if (!Object.values(Permission).includes(permission as Permission)) {
      return { error: "Invalid permission" };
    }

    const validPermission = permission as Permission;

    await prisma.userPermission.upsert({
      where: { userId_permission: { userId, permission: validPermission } },
      update: {},
      create: { userId, permission: validPermission, grantedById: actor.id },
    });

    await writeAuditLog(actor.id, "user.permission.grant", userId, { permission });
    revalidatePath(`/admin/users/${userId}`);
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to grant permission" };
  }
}

export async function revokePermissionAction(
  userId: string,
  permission: string,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    if (!Object.values(Permission).includes(permission as Permission)) {
      return { error: "Invalid permission" };
    }

    const validPermission = permission as Permission;

    await prisma.userPermission.deleteMany({ where: { userId, permission: validPermission } });

    await writeAuditLog(actor.id, "user.permission.revoke", userId, { permission });
    revalidatePath(`/admin/users/${userId}`);
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to revoke permission" };
  }
}

export async function setShowInMembersDirectoryAction(
  userId: string,
  show: boolean,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { showInMembersDirectory: show },
    });

    await writeAuditLog(actor.id, "user.members_directory", userId, { show });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/members");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to update setting" };
  }
}

export async function resendPasswordSetupAction(
  userId: string,
): Promise<{ error?: string }> {
  try {
    const actor = await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role: true,
        hashedPassword: true,
      },
    });

    if (!user) return { error: "User not found" };
    if (user.role === Role.ADMIN) {
      return { error: "Admin accounts manage their own passwords" };
    }
    if (user.status !== UserStatus.APPROVED) {
      return { error: "User must be approved first" };
    }
    if (user.hashedPassword) {
      return { error: "This member already has a password" };
    }

    await issuePasswordSetupInvite(user);
    await writeAuditLog(actor.id, "user.password_setup.resend", userId);
    revalidatePath(`/admin/users/${userId}`);
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to resend login link" };
  }
}
