import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { UserStatus } from "@/generated/prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Session = NonNullable<Awaited<ReturnType<typeof auth>>>;

async function findApprovedUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== UserStatus.APPROVED) return null;
  return user;
}

function redirectToClearSession(redirectTo: string): never {
  redirect(
    `/api/auth/clear-session?redirect=${encodeURIComponent(redirectTo)}`,
  );
}

/** Session backed by a live APPROVED user in the database, or null if missing/stale. */
export async function getValidSessionUser(): Promise<{
  session: Session;
  user: NonNullable<Awaited<ReturnType<typeof findApprovedUser>>>;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await findApprovedUser(session.user.id);
  if (!user) return null;

  return { session, user };
}

/**
 * Guest-only pages: redirect signed-in users to profile.
 * Stale JWT cookies are ignored — the page renders and a fresh sign-in replaces them.
 */
export async function redirectIfAuthenticated(redirectTo = "/me") {
  const validSession = await getValidSessionUser();
  if (validSession) redirect(redirectTo);
}

type RequireSessionUserOptions = {
  include?: Prisma.UserInclude;
};

/** Protected pages: require a live APPROVED user; clear stale sessions via route handler. */
export async function requireSessionUser(options?: RequireSessionUserOptions) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: options?.include,
  });

  if (!user || user.status !== UserStatus.APPROVED) {
    redirectToClearSession("/login");
  }

  return { session, user };
}
