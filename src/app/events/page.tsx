import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";
import {
  isEventPubliclyVisible,
  memberEventsWhere,
  publicEventsWhere,
} from "@/lib/event-visibility";

export const metadata: Metadata = { title: "Events — BASE Malaya Club" };

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Open", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export default async function EventsPage() {
  const session = await auth();
  const isApproved = session?.user?.status === UserStatus.APPROVED;

  const events = await prisma.event.findMany({
    where: isApproved ? memberEventsWhere() : publicEventsWhere(),
    include: {
      object: { select: { name: true } },
      coverImage: { select: { storageKey: true } },
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
    },
    orderBy: { startDate: "desc" },
  });

  const storage = getStorageProvider();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">
          BASE jumping events by the Malaysian community
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground">No events published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const badge = STATUS_BADGE[event.status] ?? STATUS_BADGE.COMPLETED;
            const membersOnly =
              isApproved && event.visibleMembers && !event.visiblePublic;
            const coverUrl = event.coverImage
              ? storage.getPublicUrl(event.coverImage.storageKey)
              : null;
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🪂</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-snug group-hover:text-primary">
                      {event.title}
                    </h2>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                      {membersOnly && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Members
                        </span>
                      )}
                    </div>
                  </div>
                  {event.object && (
                    <p className="text-xs text-muted-foreground">{event.object.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {event.startDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.endDate && ` – ${event.endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                  </p>
                  {(isEventPubliclyVisible(event) || isApproved) && (
                    <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{event._count.registrations} registered</span>
                      {event.capacity && <span>/ {event.capacity} capacity</span>}
                    </div>
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
