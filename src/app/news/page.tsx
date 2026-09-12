import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { PostType, PostStatus } from "@/generated/prisma/client";
import { PostCard } from "@/components/post-card";
import { getStorageProvider } from "@/lib/storage";

export const metadata: Metadata = { title: "News — BASE Malaya Club" };

export const revalidate = 60;

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { type: PostType.NEWS, status: PostStatus.PUBLISHED },
    include: {
      author: { select: { name: true } },
      coverImage: { select: { storageKey: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const storage = getStorageProvider();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">News</h1>
        <p className="mt-2 text-muted-foreground">
          Latest from the BASE Malaya community
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No news published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              publishedAt={post.publishedAt}
              authorName={post.author.name}
              coverUrl={
                post.coverImage
                  ? storage.getPublicUrl(post.coverImage.storageKey)
                  : null
              }
              basePath="/news"
            />
          ))}
        </div>
      )}
    </div>
  );
}
