import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/client";
import { DeletePostButton } from "@/components/admin/delete-post-button";

export const metadata: Metadata = { title: "Posts — Admin" };

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New post
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No posts yet
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{post.slug}</p>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {post.type.toLowerCase()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.status === PostStatus.PUBLISHED
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                  >
                    {post.status === PostStatus.PUBLISHED ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {post.author.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {post.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
