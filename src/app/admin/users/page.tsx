import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { UserStatus, Role } from "@/generated/prisma/client";
import { sortUsersByName } from "@/lib/user-sort";

export const metadata: Metadata = { title: "Users — Admin" };

const STATUS_BADGE: Record<
  UserStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const { q, status } = await searchParams;

  const users = sortUsersByName(
    await prisma.user.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { country: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status && Object.values(UserStatus).includes(status as UserStatus)
          ? { status: status as UserStatus }
          : {}),
      },
      include: { permissions: true },
    }),
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Users</h1>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, country…"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {Object.values(UserStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_BADGE[s].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
        {(q || status) && (
          <Link
            href="/admin/users"
            className="flex h-9 items-center rounded-md border px-4 text-sm hover:bg-accent"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Name / Email</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">BASE</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
            {users.map((user) => {
              const badge = STATUS_BADGE[user.status];
              return (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.country ?? "—"}</td>
                  <td className="px-4 py-3">{user.baseJumpCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.role === Role.ADMIN ? "Admin" : "Member"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.appliedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{users.length} user(s) found</p>
    </div>
  );
}
