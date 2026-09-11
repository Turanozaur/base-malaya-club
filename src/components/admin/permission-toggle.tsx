"use client";

import { useTransition } from "react";
import { grantPermissionAction, revokePermissionAction } from "@/app/admin/users/[id]/actions";
import { Permission, type Permission as PermissionType } from "@/lib/constants/user";

const PERMISSION_LABELS: Record<PermissionType, string> = {
  [Permission.MEDIA_UPLOAD]: "Media upload (photographer)",
  [Permission.EVENT_MANAGE]: "Event management",
  [Permission.CONTENT_MANAGE]: "Content management (news / education)",
  [Permission.USER_MANAGE]: "User management (moderator)",
};

type Props = {
  userId: string;
  permission: PermissionType;
  granted: boolean;
};

export function PermissionToggle({ userId, permission, granted }: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const action = granted ? revokePermissionAction : grantPermissionAction;
      const result = await action(userId, permission);
      if (result.error) alert(result.error);
    });
  }

  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent/50 transition-colors">
      <span className="text-sm">{PERMISSION_LABELS[permission]}</span>
      <button
        type="button"
        role="switch"
        aria-checked={granted}
        onClick={toggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
          granted ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            granted ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
