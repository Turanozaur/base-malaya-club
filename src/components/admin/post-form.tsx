"use client";

import { useActionState } from "react";
import type { PostFormState } from "@/app/admin/posts/actions";
import { PostType, PostStatus, type PostType as PostTypeValue, type PostStatus as PostStatusValue } from "@/lib/constants/post";

type InitialValues = {
  type?: PostTypeValue;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  status?: PostStatusValue;
};

type Props = {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
  initialValues?: InitialValues;
  submitLabel?: string;
};

export function PostForm({ action, initialValues, submitLabel = "Save" }: Props) {
  const [state, dispatch, isPending] = useActionState(action, {});

  return (
    <form action={dispatch} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium">Type</label>
          <select
            id="type"
            name="type"
            defaultValue={initialValues?.type ?? PostType.NEWS}
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={PostType.NEWS}>News</option>
            <option value={PostType.EDUCATION}>Education</option>
          </select>
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={initialValues?.slug}
            placeholder="my-post-slug"
            className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {state.fieldErrors?.slug && (
            <p className="text-xs text-destructive">{state.fieldErrors.slug[0]}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialValues?.title}
          placeholder="Post title"
          className="h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      {/* Excerpt */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-medium">
          Excerpt <span className="font-normal text-muted-foreground">(optional, shown in list)</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={initialValues?.excerpt}
          placeholder="Short summary…"
          className="rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        {state.fieldErrors?.excerpt && (
          <p className="text-xs text-destructive">{state.fieldErrors.excerpt[0]}</p>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">Content</label>
        <textarea
          id="body"
          name="body"
          rows={16}
          defaultValue={initialValues?.body}
          placeholder="Write your content here…"
          className="rounded-md border bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.body && (
          <p className="text-xs text-destructive">{state.fieldErrors.body[0]}</p>
        )}
      </div>

      {/* Published toggle */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={initialValues?.status === PostStatus.PUBLISHED}
          className="h-4 w-4 rounded border"
        />
        <span className="text-sm font-medium">Published</span>
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
          href="/admin/posts"
          className="flex items-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
