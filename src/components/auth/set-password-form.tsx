"use client";

import { useActionState } from "react";

import {
  setPasswordAction,
  type SetPasswordState,
} from "@/app/set-password/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

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

      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password}
        hint="At least 8 characters with uppercase, lowercase, and a number."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password?.length)}
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword?.length)}
        />
      </FormField>

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
