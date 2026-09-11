import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

type Props = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  BUILDING: "Building",
  ANTENNA: "Antenna",
  SPAN: "Bridge / Span",
  EARTH: "Earth / Cliff",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const obj = await prisma.baseObject.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!obj) return {};
  return { title: `${obj.name} — BASE Malaya Club`, description: obj.description ?? undefined };
}

export default async function ObjectPage({ params }: Props) {
  const { slug } = await params;

  const obj = await prisma.baseObject.findUnique({
    where: { slug, isActive: true },
    include: {
      coverImage: { select: { storageKey: true } },
      mediaLinks: {
        include: { media: { select: { storageKey: true, caption: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!obj) notFound();

  const storage = getStorageProvider();
  const coverUrl = obj.coverImage
    ? storage.getPublicUrl(obj.coverImage.storageKey)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/objects" className="hover:underline">
          ← Objects
        </Link>
      </div>

      {coverUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={coverUrl}
            alt={obj.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">{obj.name}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            {TYPE_LABELS[obj.type] ?? obj.type}
          </span>
        </div>

        <dl className="mt-4 flex flex-wrap gap-6 text-sm">
          {obj.heightMeters != null && (
            <div>
              <dt className="text-muted-foreground">Height</dt>
              <dd className="font-semibold">{obj.heightMeters} m</dd>
            </div>
          )}
          {obj.city && (
            <div>
              <dt className="text-muted-foreground">City</dt>
              <dd className="font-semibold">{obj.city}</dd>
            </div>
          )}
          {obj.latitude != null && obj.longitude != null && (
            <div>
              <dt className="text-muted-foreground">Coordinates</dt>
              <dd className="font-semibold">
                <a
                  href={`https://maps.google.com/?q=${obj.latitude},${obj.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {obj.latitude.toFixed(4)}, {obj.longitude.toFixed(4)}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {obj.description && (
        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
          {obj.description}
        </div>
      )}

      {obj.mediaLinks.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {obj.mediaLinks.map(({ media }) => (
              <div
                key={media.storageKey}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={storage.getPublicUrl(media.storageKey)}
                  alt={media.caption ?? obj.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 300px"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
