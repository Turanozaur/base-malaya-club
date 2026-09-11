"use client";

import { useTransition } from "react";
import { setShowInMembersDirectoryAction } from "@/app/admin/users/[id]/actions";

type Props = {
  userId: string;
  showInMembersDirectory: boolean;
};

export function MembersDirectoryToggle({ userId, showInMembersDirectory }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await setShowInMembersDirectoryAction(userId, checked);
      if (result.error) alert(result.error);
    });
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4">
      <input
        type="checkbox"
        checked={showInMembersDirectory}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4 rounded border"
      />
      <div>
        <p className="text-sm font-medium">Show in members directory</p>
        <p className="text-xs text-muted-foreground">
          Uncheck for hired photographers or members who should not appear publicly.
        </p>
      </div>
    </label>
  );
}
