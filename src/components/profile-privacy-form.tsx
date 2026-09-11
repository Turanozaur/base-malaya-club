"use client";

import { useActionState } from "react";

import {
  updateProfilePrivacyAction,
  type ProfilePrivacyState,
} from "@/app/me/actions";
import { ShowBirthDateCheckbox } from "@/components/ui/checkbox-field";
import { Button } from "@/components/ui/button";

type Props = {
  showBirthDatePublicly: boolean;
};

export function ProfilePrivacyForm({ showBirthDatePublicly }: Props) {
  const [state, formAction, pending] = useActionState<
    ProfilePrivacyState | undefined,
    FormData
  >(updateProfilePrivacyAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ShowBirthDateCheckbox defaultChecked={showBirthDatePublicly} />
      {state?.error ? (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="text-xs text-green-700 dark:text-green-400" role="status">
          Privacy settings saved.
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save privacy settings"}
      </Button>
    </form>
  );
}
