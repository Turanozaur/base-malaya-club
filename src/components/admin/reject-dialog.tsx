"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  onConfirm: (reason: string) => Promise<void>;
};

export function RejectDialog({ onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm(reason);
      setOpen(false);
      setReason("");
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Reject
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background p-3 shadow-md">
      <Label htmlFor="reason" className="text-xs font-medium">
        Rejection reason (optional, will be included in the email)
      </Label>
      <Textarea
        id="reason"
        rows={2}
        placeholder="e.g. Application is incomplete"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isPending}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? "Rejecting…" : "Confirm rejection"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { setOpen(false); setReason(""); }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
