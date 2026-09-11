"use client";

import { useTransition } from "react";
import { deleteEventAction } from "@/app/admin/events/actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this event? All registrations will be deleted too. This cannot be undone.")) return;
    startTransition(async () => { await deleteEventAction(eventId); });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending}
      className="text-xs font-medium text-destructive hover:underline disabled:opacity-50">
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
