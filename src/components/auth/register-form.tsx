"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { registerAction, type RegisterState } from "@/app/register/actions";
import { RegisterAvatarPicker } from "@/components/auth/register-avatar-picker";
import { BirthDateInput } from "@/components/birth-date-input";
import { CountryCombobox } from "@/components/country-combobox";
import { MonthYearInput } from "@/components/month-year-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  PrivacyConsentCheckbox,
  ShowBirthDateCheckbox,
} from "@/components/ui/checkbox-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isRegisterFormReady } from "@/lib/register-form-ready";

const selectCls =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<
    RegisterState | undefined,
    FormData
  >(registerAction, undefined);

  const errors = state?.errors ?? {};
  const vals = state?.values ?? {};
  const formKey = state?.values ? JSON.stringify(state.values) : "initial";

  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const updateReady = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    setCanSubmit(isRegisterFormReady(new FormData(form)));
  }, []);

  useEffect(() => {
    updateReady();
  }, [formKey, updateReady]);

  return (
    <form
      key={formKey}
      ref={formRef}
      action={formAction}
      className="space-y-6"
      onInput={updateReady}
      onChange={updateReady}
      noValidate
    >
      <p className="text-sm text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are
        required.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            If approved, we will email you a link to set your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Name"
            htmlFor="name"
            error={errors.name}
            required
            className="sm:col-span-2"
          >
            <Input
              id="name"
              name="name"
              autoComplete="name"
              defaultValue={vals.name}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email}
            required
            className="sm:col-span-2"
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={vals.email}
            />
          </FormField>
          <div className="sm:col-span-2">
            <RegisterAvatarPicker
              defaultStorageKey={vals.avatarStorageKey}
              defaultName={vals.name}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jumper profile</CardTitle>
          <CardDescription>
            Helps administrators identify you. Jump counts and experience dates
            are optional — photographers and other non-jumpers can leave them
            blank.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Country"
            htmlFor="country"
            error={errors.country}
            required
          >
            <CountryCombobox
              id="country"
              name="country"
              defaultValue={vals.country}
              aria-invalid={Boolean(errors.country?.length)}
              onValueChange={updateReady}
            />
          </FormField>

          <FormField
            label="Gender"
            htmlFor="gender"
            error={errors.gender}
            required
          >
            <select
              id="gender"
              name="gender"
              defaultValue={vals.gender ?? ""}
              className={selectCls}
              aria-invalid={Boolean(errors.gender?.length)}
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </FormField>

          <FormField
            label="Have you participated in BASE jump in Malaysia?"
            htmlFor="participatedBasejumpInMalaysia"
            error={errors.participatedBasejumpInMalaysia}
            required
            className="sm:col-span-2"
          >
            <select
              id="participatedBasejumpInMalaysia"
              name="participatedBasejumpInMalaysia"
              defaultValue={vals.participatedBasejumpInMalaysia ?? ""}
              className={selectCls}
              aria-invalid={Boolean(
                errors.participatedBasejumpInMalaysia?.length,
              )}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FormField>

          <FormField
            label="Date of birth"
            htmlFor="birthDate-day"
            error={errors.birthDate}
            required
            className="sm:col-span-2"
          >
            <BirthDateInput
              defaultValue={vals.birthDate}
              onValueChange={updateReady}
            />
          </FormField>

          <div className="sm:col-span-2">
            <ShowBirthDateCheckbox
              defaultChecked={vals.showBirthDatePublicly === "true"}
            />
          </div>

          <FormField
            label="BASE jumps"
            htmlFor="baseJumpCount"
            error={errors.baseJumpCount}
          >
            <Input
              id="baseJumpCount"
              name="baseJumpCount"
              type="number"
              min={0}
              defaultValue={vals.baseJumpCount}
            />
          </FormField>
          <FormField
            label="Skydive jumps"
            htmlFor="skydiveJumpCount"
            error={errors.skydiveJumpCount}
          >
            <Input
              id="skydiveJumpCount"
              name="skydiveJumpCount"
              type="number"
              min={0}
              defaultValue={vals.skydiveJumpCount}
            />
          </FormField>
          <FormField
            label="BASE since"
            htmlFor="baseSince-month"
            error={errors.baseSince}
          >
            <MonthYearInput
              name="baseSince"
              idPrefix="baseSince"
              defaultValue={vals.baseSince}
            />
          </FormField>
          <FormField
            label="Skydiving since"
            htmlFor="skydiveSince-month"
            error={errors.skydiveSince}
          >
            <MonthYearInput
              name="skydiveSince"
              idPrefix="skydiveSince"
              defaultValue={vals.skydiveSince}
            />
          </FormField>
          <FormField
            label="About you"
            htmlFor="bio"
            error={errors.bio}
            hint="Optional"
            className="sm:col-span-2"
          >
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={vals.bio}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Optional. Username or full URL.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Instagram" htmlFor="instagram">
            <Input
              id="instagram"
              name="instagram"
              defaultValue={vals.instagram}
            />
          </FormField>
          <FormField label="Facebook" htmlFor="facebook">
            <Input
              id="facebook"
              name="facebook"
              defaultValue={vals.facebook}
            />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp">
            <Input
              id="whatsapp"
              name="whatsapp"
              defaultValue={vals.whatsapp}
            />
          </FormField>
          <FormField label="Telegram" htmlFor="telegram">
            <Input
              id="telegram"
              name="telegram"
              defaultValue={vals.telegram}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voucher</CardTitle>
          <CardDescription>
            A club member who can vouch for you. Will be replaced with a member
            picker in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            label="Who recommends you"
            htmlFor="voucher"
            error={errors.voucher}
            required
          >
            <Input
              id="voucher"
              name="voucher"
              placeholder="Name and contact of the voucher"
              defaultValue={vals.voucher}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <PrivacyConsentCheckbox
            error={errors.personalDataConsent}
            requiredMark
          />
        </CardContent>
      </Card>

      {state?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending || !canSubmit}
        className="h-11 min-w-52 px-8 text-base"
      >
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
