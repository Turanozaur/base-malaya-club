"use client";

import { useState } from "react";
import Image from "next/image";

export type GalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  uploaderName: string | null;
  eventTitle: string | null;
  eventSlug: string | null;
  objectName: string | null;
  objectSlug: string | null;
};

type Props = {
  items: GalleryItem[];
};

export function GalleryGrid({ items }: Props) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return <p className="text-muted-foreground">No photos yet.</p>;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted text-left"
          >
            <Image
              src={item.url}
              alt={item.caption ?? "Gallery photo"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {(item.caption || item.eventTitle || item.objectName) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                {item.caption && (
                  <p className="line-clamp-2 text-xs font-medium text-white">{item.caption}</p>
                )}
                <p className="mt-0.5 text-xs text-white/70">
                  {item.eventTitle ?? item.objectName}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
          onKeyDown={(e) => e.key === "Escape" && setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <div
            className="relative max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.caption ?? "Gallery photo"}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
            <div className="mt-3 text-center text-sm text-white/90">
              {active.caption && <p className="font-medium">{active.caption}</p>}
              {active.eventTitle && active.eventSlug && (
                <p className="mt-1 text-white/70">
                  Event:{" "}
                  <a href={`/events/${active.eventSlug}`} className="underline hover:text-white">
                    {active.eventTitle}
                  </a>
                </p>
              )}
              {active.objectName && active.objectSlug && (
                <p className="mt-1 text-white/70">
                  Object:{" "}
                  <a href={`/objects/${active.objectSlug}`} className="underline hover:text-white">
                    {active.objectName}
                  </a>
                </p>
              )}
              {active.uploaderName && (
                <p className="mt-1 text-xs text-white/50">Photo by {active.uploaderName}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
