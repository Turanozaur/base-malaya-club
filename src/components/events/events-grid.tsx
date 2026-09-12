"use client";

import Link from "next/link";
import Image from "next/image";

import type { EventListItem } from "@/lib/events-list";
import { isEventPubliclyVisible } from "@/lib/event-visibility";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Open",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

type EventsGridProps = {
  events: EventListItem[];
  isApproved: boolean;
};

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventsGrid({ events, isApproved }: EventsGridProps) {
  if (events.length === 0) {
    return <p className="text-muted-foreground">No events published yet.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const badge = STATUS_BADGE[event.status] ?? STATUS_BADGE.COMPLETED;
        const membersOnly =
          isApproved && event.visibleMembers && !event.visiblePublic;

        return (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {event.coverUrl ? (
                <Image
                  src={event.coverUrl}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">
                  🪂
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-snug group-hover:text-primary">
                  {event.title}
                </h2>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
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
                <p className="text-xs text-muted-foreground">
                  {event.object.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.startDate)}
                {event.endDate && ` – ${formatEventDate(event.endDate)}`}
              </p>
              {(isEventPubliclyVisible(event) || isApproved) && (
                <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{event.registrationCount} registered</span>
                  {event.capacity != null && (
                    <span>/ {event.capacity} capacity</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
