"use client";

import { useTransition } from "react";
import { cancelRegistrationAction } from "@/app/events/[slug]/actions";

type Props = {
  registrationId: string;
  eventTitle: string;
  label?: string;
};

export function CancelRegistrationButton({
  registrationId,
  eventTitle,
  label = "Cancel my registration",
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Are you sure you want to cancel your registration for "${eventTitle}"? This cannot be undone.`,
      )
    )
      return;

    startTransition(async () => {
      const result = await cancelRegistrationAction(registrationId);
      if (result.error) alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-destructive hover:underline disabled:opacity-50"
    >
      {isPending ? "Cancelling…" : label}
    </button>
  );
}
