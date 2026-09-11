"use client";

import { useTransition } from "react";

import { resendPasswordSetupAction } from "@/app/admin/users/[id]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  userId: string;
};

export function ResendLoginLinkButton({ userId }: Props) {
  const [isPending, startTransition] = useTransition();

  function resend() {
    startTransition(async () => {
      const result = await resendPasswordSetupAction(userId);
      if (result.error) {
        alert(result.error);
      } else {
        alert("Login link sent.");
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={resend}
      disabled={isPending}
    >
      {isPending ? "Sending…" : "Resend login link"}
    </Button>
  );
}
