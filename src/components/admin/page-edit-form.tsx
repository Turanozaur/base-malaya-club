"use client";

import { useActionState } from "react";
import type { PageFormState } from "@/app/admin/pages/actions";

type Props = {
  action: (prev: PageFormState, formData: FormData) => Promise<PageFormState>;
  initialTitle: string;
  initialBody: string;
};

export function PageEditForm({ action, initialTitle, initialBody }: Props) {
  const [state, dispatch, isPending] = useActionState(action, {});

  return (
    <form action={dispatch} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/40 dark:text-green-300">
          Page saved successfully.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialTitle}
          className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">Content</label>
        <textarea
          id="body"
          name="body"
          rows={20}
          defaultValue={initialBody}
          className="rounded-md border bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.body && (
          <p className="text-xs text-destructive">{state.fieldErrors.body[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <a
          href="/admin/pages"
          className="flex items-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
