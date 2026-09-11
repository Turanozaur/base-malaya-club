"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setUserStatusAction } from "@/app/admin/users/[id]/actions";
import { UserStatus, type UserStatus as UserStatusType } from "@/lib/constants/user";

const STATUS_LABELS: Record<UserStatusType, string> = {
  [UserStatus.PENDING]: "Pending",
  [UserStatus.APPROVED]: "Approved",
  [UserStatus.REJECTED]: "Rejected",
  [UserStatus.SUSPENDED]: "Suspended",
};

const STATUS_BADGE: Record<UserStatusType, string> = {
  [UserStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  [UserStatus.APPROVED]: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  [UserStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  [UserStatus.SUSPENDED]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

type Props = {
  userId: string;
  currentStatus: UserStatusType;
};

export function StatusActions({ userId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: UserStatusType) {
    startTransition(async () => {
      const result = await setUserStatusAction(userId, status);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current status:</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[currentStatus]}`}
        >
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentStatus !== UserStatus.APPROVED && (
          <Button
            type="button"
            size="sm"
            onClick={() => setStatus(UserStatus.APPROVED)}
            disabled={isPending}
          >
            Approve
          </Button>
        )}
        {currentStatus !== UserStatus.SUSPENDED && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatus(UserStatus.SUSPENDED)}
            disabled={isPending}
          >
            Suspend
          </Button>
        )}
        {currentStatus !== UserStatus.REJECTED && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setStatus(UserStatus.REJECTED)}
            disabled={isPending}
          >
            Reject
          </Button>
        )}
      </div>
    </div>
  );
}
