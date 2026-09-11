"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PrivacyNoticeDialog } from "@/components/privacy/privacy-notice-dialog";

type CheckboxFieldProps = {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
  required?: boolean;
  className?: string;
};

export function CheckboxField({
  name,
  label,
  defaultChecked,
  required,
  className,
}: CheckboxFieldProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 text-sm leading-snug",
        className,
      )}
    >
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        required={required}
        className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

export function PrivacyConsentCheckbox({
  error,
  requiredMark,
}: {
  error?: string[];
  requiredMark?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3 text-sm leading-snug">
        <input
          id="personalDataConsent"
          type="checkbox"
          name="personalDataConsent"
          value="true"
          aria-describedby="personalDataConsent-text"
          className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
        />
        <p id="personalDataConsent-text">
          I agree to the{" "}
          <PrivacyNoticeDialog triggerLabel="processing of my personal data" />{" "}
          as described in the club&apos;s privacy notice.
          {requiredMark ? (
            <>
              <span className="text-destructive" aria-hidden="true">
                {" *"}
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </p>
      </div>
      {error?.[0] ? (
        <p className="text-xs text-destructive" role="alert">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

export function ShowBirthDateCheckbox({
  defaultChecked,
}: {
  defaultChecked?: boolean;
}) {
  return (
    <CheckboxField
      name="showBirthDatePublicly"
      defaultChecked={defaultChecked}
      label="Show my age and date of birth on my public profile"
    />
  );
}
