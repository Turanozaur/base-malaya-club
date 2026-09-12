import type { Prisma } from "@/generated/prisma/client";

import { getStorageProvider } from "@/lib/storage";

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  visiblePublic: boolean;
  visibleMembers: boolean;
  startDate: string;
  endDate: string | null;
  capacity: number | null;
  object: { name: string } | null;
  coverUrl: string | null;
  registrationCount: number;
};

const eventListInclude = {
  object: { select: { name: true } },
  coverImage: { select: { storageKey: true } },
  _count: { select: { registrations: { where: { status: "REGISTERED" as const } } } },
} satisfies Prisma.EventInclude;

export type EventListRow = Prisma.EventGetPayload<{
  include: typeof eventListInclude;
}>;

export function serializeEventListItem(event: EventListRow): EventListItem {
  const storage = getStorageProvider();

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    status: event.status,
    visiblePublic: event.visiblePublic,
    visibleMembers: event.visibleMembers,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    capacity: event.capacity,
    object: event.object,
    coverUrl: event.coverImage
      ? storage.getPublicUrl(event.coverImage.storageKey)
      : null,
    registrationCount: event._count.registrations,
  };
}

export { eventListInclude };
