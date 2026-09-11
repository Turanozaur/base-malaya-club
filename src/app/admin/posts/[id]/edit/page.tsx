import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import { updatePostAction } from "../../actions";
import type { PostType, PostStatus } from "@/lib/constants/post";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `Edit: ${post.title} — Admin` : "Edit post — Admin" };
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const boundAction = updatePostAction.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/posts" className="hover:text-foreground hover:underline">
          Posts
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit post</h1>

      <PostForm
        action={boundAction}
        initialValues={{
          type: post.type as PostType,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          body: post.body,
          status: post.status as PostStatus,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
