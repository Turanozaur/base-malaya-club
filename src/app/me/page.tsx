import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { ProfilePrivacyForm } from "@/components/profile-privacy-form";
import { formatBirthDate } from "@/lib/birth-date";
import {
  formatMonthYear,
  fullYearsSince,
} from "@/lib/experience";
import { logoutAction } from "./actions";

export const metadata: Metadata = { title: "My profile" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Application under review",
  APPROVED: "Club member",
  REJECTED: "Application rejected",
  SUSPENDED: "Access suspended",
};

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ passwordUpdated?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { passwordUpdated } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: true, voucher: true },
  });
  if (!user) redirect("/login");

  const yearsInBase =
    user.baseSince != null ? fullYearsSince(user.baseSince) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">My profile</h1>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href="/me/change-password" />}
          >
            Change password
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {passwordUpdated ? (
        <p
          className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200"
          role="status"
        >
          Your password has been updated.
        </p>
      ) : null}

      <div className="mb-6 flex justify-center">
        <AvatarUpload
          currentUrl={user.image}
          name={user.name ?? user.email}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.name ?? user.email}</CardTitle>
          <CardDescription>
            {STATUS_LABELS[user.status] ?? user.status}
            {user.role === "ADMIN" ? " · Administrator" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Email: </span>
            {user.email}
          </div>
          <div>
            <span className="text-muted-foreground">Country: </span>
            {user.country ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Gender: </span>
            {user.gender === "MALE"
              ? "Male"
              : user.gender === "FEMALE"
                ? "Female"
                : "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Date of birth: </span>
            {user.birthDate ? formatBirthDate(user.birthDate) : "—"}
          </div>
          <div>
            <span className="text-muted-foreground">BASE jumps: </span>
            {user.baseJumpCount ?? 0}
          </div>
          <div>
            <span className="text-muted-foreground">Skydive jumps: </span>
            {user.skydiveJumpCount ?? 0}
          </div>
          <div>
            <span className="text-muted-foreground">In BASE since: </span>
            {yearsInBase != null
              ? `${yearsInBase} years (since ${formatMonthYear(user.baseSince!)})`
              : "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Voucher: </span>
            {user.voucher?.name ?? user.voucherNote ?? "—"}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Control what appears on your public member profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePrivacyForm
            showBirthDatePublicly={user.showBirthDatePublicly}
          />
        </CardContent>
      </Card>

      {user.permissions.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Permissions: {user.permissions.map((p) => p.permission).join(", ")}
        </p>
      )}
    </div>
  );
}
