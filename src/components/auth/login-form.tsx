"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/login/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<
    LoginState | undefined,
    FormData
  >(loginAction, undefined);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
        />
      </FormField>

      {state?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
