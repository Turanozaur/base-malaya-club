import type { Metadata } from "next";
import Link from "next/link";

import { PostForm } from "@/components/admin/post-form";
import { createPostAction } from "../actions";

export const metadata: Metadata = { title: "New post — Admin" };

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/posts" className="hover:text-foreground hover:underline">
          Posts
        </Link>
        <span>/</span>
        <span className="text-foreground">New post</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New post</h1>

      <PostForm action={createPostAction} submitLabel="Create post" />
    </div>
  );
}
