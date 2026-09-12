import type { Metadata } from "next";

import { PendingApplicationsBadge } from "@/components/admin/pending-applications-badge";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/generated/prisma/client";
import { sortUsersByName } from "@/lib/user-sort";
import { ApplicationRow } from "@/components/admin/application-row";

export const metadata: Metadata = { title: "Applications — Admin" };

export default async function ApplicationsPage() {
  const pending = sortUsersByName(
    await prisma.user.findMany({
      where: { status: UserStatus.PENDING },
      include: { voucher: { select: { name: true } } },
    }),
  );

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        Pending applications
        <PendingApplicationsBadge count={pending.length} size="md" />
      </h1>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">No pending applications — all caught up!</p>
      ) : (
        <div className="space-y-4">
          {pending.map((user) => (
            <ApplicationRow
              key={user.id}
              userId={user.id}
              name={user.name ?? user.email}
              email={user.email}
              country={user.country}
              gender={user.gender}
              participatedBasejumpInMalaysia={
                user.participatedBasejumpInMalaysia
              }
              baseJumps={user.baseJumpCount ?? 0}
              appliedAt={user.appliedAt}
              voucherName={user.voucher?.name ?? null}
              voucherNote={user.voucherNote}
              instagram={user.instagram}
            />
          ))}
        </div>
      )}
    </div>
  );
}
