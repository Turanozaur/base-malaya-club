import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { GalleryGrid, type GalleryItem } from "@/components/gallery/gallery-grid";
import { isEventPubliclyVisible, publicEventsWhere } from "@/lib/event-visibility";

export const metadata: Metadata = { title: "Gallery — BASE Malaya Club" };

type Props = {
  searchParams: Promise<{ event?: string; object?: string }>;
};

export default async function GalleryPage({ searchParams }: Props) {
  const { event: eventSlug, object: objectSlug } = await searchParams;

  const [events, objects] = await Promise.all([
    prisma.event.findMany({
      where: publicEventsWhere(),
      select: { id: true, slug: true, title: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.baseObject.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const eventFilter = eventSlug ? events.find((e) => e.slug === eventSlug) : null;
  const objectFilter = objectSlug ? objects.find((o) => o.slug === objectSlug) : null;

  const [eventMedia, objectMedia] = await Promise.all([
    prisma.eventMedia.findMany({
      where: eventFilter ? { eventId: eventFilter.id } : {},
      include: {
        media: {
          include: { uploadedBy: { select: { name: true } } },
        },
        event: { select: { slug: true, title: true, status: true, visiblePublic: true, visibleMembers: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.objectMedia.findMany({
      where: {
        showInGallery: true,
        ...(objectFilter ? { objectId: objectFilter.id } : {}),
      },
      include: {
        media: {
          include: { uploadedBy: { select: { name: true } } },
        },
        object: { select: { slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const storage = getStorageProvider();

  const eventItems: GalleryItem[] = eventMedia
    .filter((em) => isEventPubliclyVisible(em.event))
    .map((em) => ({
      id: em.media.id,
      url: storage.getPublicUrl(em.media.storageKey),
      caption: em.media.caption,
      uploaderName: em.media.uploadedBy.name,
      eventTitle: em.event.title,
      eventSlug: em.event.slug,
      objectName: null,
      objectSlug: null,
      createdAt: em.createdAt.getTime(),
    }));

  const objectItems: GalleryItem[] = objectMedia.map((om) => ({
    id: om.media.id,
    url: storage.getPublicUrl(om.media.storageKey),
    caption: om.media.caption,
    uploaderName: om.media.uploadedBy.name,
    eventTitle: null,
    eventSlug: null,
    objectName: om.object.name,
    objectSlug: om.object.slug,
    createdAt: om.createdAt.getTime(),
  }));

  type ItemWithDate = GalleryItem & { createdAt: number };
  const sortedItems: GalleryItem[] = ([...eventItems, ...objectItems] as ItemWithDate[])
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ createdAt, ...item }) => {
      void createdAt;
      return item;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Photos from BASE Malaya Club events and jumps
        </p>
      </div>

      {/* Filters */}
      <form method="get" className="mb-8 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="event" className="mb-1 block text-sm font-medium">
            Event
          </label>
          <select
            id="event"
            name="event"
            defaultValue={eventSlug ?? ""}
            className="h-9 min-w-[200px] rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.slug}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="object" className="mb-1 block text-sm font-medium">
            Object
          </label>
          <select
            id="object"
            name="object"
            defaultValue={objectSlug ?? ""}
            className="h-9 min-w-[200px] rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All objects</option>
            {objects.map((o) => (
              <option key={o.id} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>

        {(eventSlug || objectSlug) && (
          <Link href="/gallery" className="text-sm text-muted-foreground hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <GalleryGrid items={sortedItems} />
    </div>
  );
}
