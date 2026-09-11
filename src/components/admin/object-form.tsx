"use client";

import { useActionState } from "react";
import type { ObjectFormState } from "@/app/admin/objects/actions";
import { ObjectType, type ObjectType as ObjectTypeValue } from "@/lib/constants/event";

type InitialValues = {
  name?: string;
  slug?: string;
  type?: ObjectTypeValue;
  description?: string;
  heightMeters?: number | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
};

type Props = {
  action: (prev: ObjectFormState, formData: FormData) => Promise<ObjectFormState>;
  initialValues?: InitialValues;
  submitLabel?: string;
};

const OBJECT_TYPES: { value: ObjectTypeValue; label: string }[] = [
  { value: ObjectType.BUILDING, label: "Building" },
  { value: ObjectType.ANTENNA, label: "Antenna" },
  { value: ObjectType.SPAN, label: "Bridge / Span" },
  { value: ObjectType.EARTH, label: "Earth / Cliff" },
];

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ObjectForm({ action, initialValues, submitLabel = "Save" }: Props) {
  const [state, dispatch, isPending] = useActionState(action, {});

  const fe = state.fieldErrors ?? {};

  return (
    <form action={dispatch} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" id="name" error={fe.name?.[0]}>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={initialValues?.name}
            placeholder="KL Tower"
            className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <Field label="Slug" id="slug" error={fe.slug?.[0]}>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={initialValues?.slug}
            placeholder="kl-tower"
            className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <Field label="Type" id="type" error={fe.type?.[0]}>
          <select
            id="type"
            name="type"
            defaultValue={initialValues?.type ?? ObjectType.BUILDING}
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {OBJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Height (m)" id="heightMeters" error={fe.heightMeters?.[0]}>
          <input
            id="heightMeters"
            name="heightMeters"
            type="number"
            min={0}
            defaultValue={initialValues?.heightMeters ?? ""}
            placeholder="421"
            className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <Field label="City" id="city" error={fe.city?.[0]}>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={initialValues?.city ?? ""}
            placeholder="Kuala Lumpur"
            className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" id="latitude" error={fe.latitude?.[0]}>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={initialValues?.latitude ?? ""}
              placeholder="3.1528"
              className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Longitude" id="longitude" error={fe.longitude?.[0]}>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={initialValues?.longitude ?? ""}
              placeholder="101.7038"
              className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
      </div>

      <Field label="Description" id="description" error={fe.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={initialValues?.description}
          placeholder="About this object…"
          className="rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked={initialValues?.isActive !== false}
          className="h-4 w-4 rounded border"
        />
        <span className="text-sm font-medium">Active (visible on the site)</span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/admin/objects"
          className="flex items-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
