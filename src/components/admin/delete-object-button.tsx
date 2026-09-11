"use client";

import { useTransition } from "react";
import { deleteObjectAction } from "@/app/admin/objects/actions";

export function DeleteObjectButton({ objectId }: { objectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this object? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteObjectAction(objectId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
