import { Role, type Permission } from "@/generated/prisma/client";

type PermissionAware = {
  role: Role;
  permissions?: { permission: Permission }[];
};

/**
 * Admins have every permission implicitly (god mode). Other users only have
 * permissions explicitly granted via UserPermission rows. This keeps roles
 * from proliferating — delegation is handled through permissions, not roles.
 */
export function hasPermission(
  user: PermissionAware,
  permission: Permission,
): boolean {
  if (user.role === Role.ADMIN) return true;
  return user.permissions?.some((p) => p.permission === permission) ?? false;
}

export function isAdmin(user: { role: Role }): boolean {
  return user.role === Role.ADMIN;
}
