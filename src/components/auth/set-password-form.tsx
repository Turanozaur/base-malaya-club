"use client";

import { useActionState } from "react";

import {
  setPasswordAction,
  type SetPasswordState,
} from "@/app/set-password/actions";
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

type Props = {
  token: string;
};

export function SetPasswordForm({ token }: Props) {
  const [state, formAction, pending] = useActionState<
    SetPasswordState | undefined,
    FormData
  >(setPasswordAction, undefined);

  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="password">Password</Label>
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
        <Label htmlFor="confirmPassword">Confirm password</Label>
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save password and sign in"}
      </Button>
    </form>
  );
}
