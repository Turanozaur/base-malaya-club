"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, PostType, PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Admins and users with CONTENT_MANAGE permission can edit posts.
  const user = session.user;
  if (
    user.role !== Role.ADMIN &&
    !(user as { permissions?: { permission: string }[] }).permissions?.some(
      (p) => p.permission === "CONTENT_MANAGE",
    )
  ) {
    redirect("/");
  }
  return user;
}

const postSchema = z.object({
  type: z.enum(["NEWS", "EDUCATION"]),
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1, "Content is required"),
  published: z.coerce.boolean().optional(),
});

export type PostFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const author = await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { type, title, slug, excerpt, body, published } = parsed.data;

  try {
    await prisma.post.create({
      data: {
        type: type as PostType,
        title,
        slug,
        excerpt: excerpt || null,
        body,
        status: published ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: published ? new Date() : null,
        authorId: author.id,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return { error: "A post with this slug already exists" };
    }
    return { error: "Failed to create post" };
  }

  revalidatePath("/news");
  revalidatePath("/education");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePostAction(
  id: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { type, title, slug, excerpt, body, published } = parsed.data;

  const existing = await prisma.post.findUniqueOrThrow({ where: { id } });

  try {
    await prisma.post.update({
      where: { id },
      data: {
        type: type as PostType,
        title,
        slug,
        excerpt: excerpt || null,
        body,
        status: published ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt:
          published && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return { error: "A post with this slug already exists" };
    }
    return { error: "Failed to update post" };
  }

  revalidatePath("/news");
  revalidatePath("/education");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePostAction(id: string): Promise<void> {
  await requireEditor();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/education");
  revalidatePath("/admin/posts");
}
