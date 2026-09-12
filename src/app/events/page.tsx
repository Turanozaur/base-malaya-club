import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { publicEventsWhere } from "@/lib/event-visibility";
import {
  eventListInclude,
  serializeEventListItem,
} from "@/lib/events-list";
import { EventsPageContent } from "@/components/events/events-page-content";

export const metadata: Metadata = { title: "Events — BASE Malaya Club" };

export const revalidate = 60;

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: publicEventsWhere(),
    include: eventListInclude,
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">
          BASE jumping events by the Malaysian community
        </p>
      </div>

      <EventsPageContent
        publicEvents={events.map(serializeEventListItem)}
      />
    </div>
  );
}
