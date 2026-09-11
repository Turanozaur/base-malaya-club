"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/app/me/change-password/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    ChangePasswordState | undefined,
    FormData
  >(changePasswordAction, undefined);

  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.success) {
      router.push("/me?passwordUpdated=1");
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword?.length)}
        />
        <FieldError messages={errors.currentPassword} />
      </div>

      <div>
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password?.length)}
        />
        <FieldError messages={errors.password} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          At least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword?.length)}
        />
        <FieldError messages={errors.confirmPassword} />
      </div>

      {state?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
