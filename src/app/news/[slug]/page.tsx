import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { PostType, PostStatus } from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });
  if (!post) return {};
  return { title: `${post.title} — BASE Malaya Club`, description: post.excerpt ?? undefined };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, type: PostType.NEWS, status: PostStatus.PUBLISHED },
    include: {
      author: { select: { name: true, image: true } },
      coverImage: { select: { storageKey: true } },
    },
  });

  if (!post) notFound();

  const storage = getStorageProvider();
  const coverUrl = post.coverImage
    ? storage.getPublicUrl(post.coverImage.storageKey)
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/news" className="hover:underline">
          ← News
        </Link>
      </div>

      <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight">
        {post.title}
      </h1>

      <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
        {post.author.name && <span>{post.author.name}</span>}
        {post.publishedAt && (
          <>
            <span>·</span>
            <span>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(post.publishedAt)}
            </span>
          </>
        )}
      </div>

      {coverUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {post.excerpt && (
        <p className="mb-8 text-lg font-medium leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </article>
  );
}
