import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export const metadata: Metadata = { title: "Objects — BASE Malaya Club" };

const TYPE_LABELS: Record<string, string> = {
  BUILDING: "Building",
  ANTENNA: "Antenna",
  SPAN: "Bridge / Span",
  EARTH: "Earth / Cliff",
};

export default async function ObjectsPage() {
  const objects = await prisma.baseObject.findMany({
    where: { isActive: true },
    include: { coverImage: { select: { storageKey: true } } },
    orderBy: { name: "asc" },
  });

  const storage = getStorageProvider();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Objects</h1>
        <p className="mt-2 text-muted-foreground">
          Malaysia&apos;s iconic BASE jumping locations
        </p>
      </div>

      {objects.length === 0 ? (
        <p className="text-muted-foreground">No objects listed yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objects.map((obj) => {
            const coverUrl = obj.coverImage
              ? storage.getPublicUrl(obj.coverImage.storageKey)
              : null;
            return (
              <Link
                key={obj.id}
                href={`/objects/${obj.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={obj.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                      <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-snug group-hover:text-primary">
                      {obj.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {TYPE_LABELS[obj.type] ?? obj.type}
                    </span>
                  </div>
                  {obj.heightMeters != null && (
                    <p className="text-sm text-muted-foreground">{obj.heightMeters} m</p>
                  )}
                  {obj.description && (
                    <p className="line-clamp-2 mt-1 text-sm text-muted-foreground">
                      {obj.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
