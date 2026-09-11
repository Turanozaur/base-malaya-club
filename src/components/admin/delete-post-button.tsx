"use client";

import { useTransition } from "react";
import { deletePostAction } from "@/app/admin/posts/actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    startTransition(async () => {
      await deletePostAction(postId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
