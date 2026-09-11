"use client";

import { useActionState } from "react";
import type { EventFormState } from "@/app/admin/events/actions";

type ObjectOption = { id: string; name: string };

type InitialValues = {
  title?: string;
  slug?: string;
  description?: string;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number | null;
  objectId?: string | null;
  requiresPayment?: boolean;
  visiblePublic?: boolean;
  visibleMembers?: boolean;
  schedulePublic?: boolean;
  summaryPublic?: boolean;
};

type Props = {
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  initialValues?: InitialValues;
  objects: ObjectOption[];
  submitLabel?: string;
};

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="h-4 w-4 rounded border" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

const inputCls = "h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const textareaCls = "rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function EventForm({ action, initialValues, objects, submitLabel = "Save" }: Props) {
  const [state, dispatch, isPending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={dispatch} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" id="title" error={fe.title?.[0]}>
          <input id="title" name="title" type="text" defaultValue={initialValues?.title} placeholder="KL Tower Boogie 2027" className={inputCls} />
        </Field>

        <Field label="Slug" id="slug" error={fe.slug?.[0]}>
          <input id="slug" name="slug" type="text" defaultValue={initialValues?.slug} placeholder="kl-tower-boogie-2027" className={inputCls} />
        </Field>

        <Field label="Start date" id="startDate" error={fe.startDate?.[0]}>
          <input id="startDate" name="startDate" type="date" defaultValue={initialValues?.startDate} className={inputCls} />
        </Field>

        <Field label="End date" id="endDate" error={fe.endDate?.[0]}>
          <input id="endDate" name="endDate" type="date" defaultValue={initialValues?.endDate} className={inputCls} />
        </Field>

        <Field label="Capacity" id="capacity" error={fe.capacity?.[0]}>
          <input id="capacity" name="capacity" type="number" min={1} defaultValue={initialValues?.capacity ?? ""} placeholder="Leave empty for unlimited" className={inputCls} />
        </Field>

        <Field label="Location (object)" id="objectId" error={fe.objectId?.[0]}>
          <select id="objectId" name="objectId" defaultValue={initialValues?.objectId ?? ""} className={inputCls}>
            <option value="">— No specific object —</option>
            {objects.map((obj) => (
              <option key={obj.id} value={obj.id}>{obj.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" id="description" error={fe.description?.[0]}>
        <textarea id="description" name="description" rows={4} defaultValue={initialValues?.description} placeholder="About this event…" className={textareaCls} />
      </Field>

      <Field label="Schedule" id="schedule" error={fe.schedule?.[0]}>
        <textarea id="schedule" name="schedule" rows={6} defaultValue={initialValues?.schedule} placeholder="Day 1 — Opening ceremony...&#10;Day 2 — Jump day..." className={`${textareaCls} font-mono`} />
      </Field>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium text-muted-foreground">Visibility &amp; settings</p>
        <Checkbox
          name="visiblePublic"
          label="Visible on public website (guests and search engines)"
          defaultChecked={initialValues?.visiblePublic}
        />
        <Checkbox
          name="visibleMembers"
          label="Visible to approved members (club-only announcement)"
          defaultChecked={initialValues?.visibleMembers}
        />
        <Checkbox name="schedulePublic" label="Schedule visible to everyone (not just members)" defaultChecked={initialValues?.schedulePublic} />
        <Checkbox name="summaryPublic" label="Show participant count &amp; country summary publicly" defaultChecked={initialValues?.summaryPublic} />
        <Checkbox name="requiresPayment" label="Entry fee required" defaultChecked={initialValues?.requiresPayment} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {isPending ? "Saving…" : submitLabel}
        </button>
        <a href="/admin/events" className="flex items-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent">
          Cancel
        </a>
      </div>
    </form>
  );
}
