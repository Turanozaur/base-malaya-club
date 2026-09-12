"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import type { EventListItem } from "@/lib/events-list";
import { UserStatus } from "@/lib/constants/user";
import { EventsGrid } from "@/components/events/events-grid";

type EventsPageContentProps = {
  publicEvents: EventListItem[];
};

export function EventsPageContent({ publicEvents }: EventsPageContentProps) {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState(publicEvents);

  const isApproved =
    status === "authenticated" &&
    session?.user?.status === UserStatus.APPROVED;

  useEffect(() => {
    setEvents(publicEvents);
  }, [publicEvents]);

  useEffect(() => {
    if (!isApproved) return;

    let cancelled = false;

    void fetch("/api/events/member")
      .then((response) => {
        if (!response.ok) return null;
        return response.json() as Promise<EventListItem[]>;
      })
      .then((memberEvents) => {
        if (!cancelled && memberEvents) {
          setEvents(memberEvents);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isApproved]);

  return <EventsGrid events={events} isApproved={isApproved} />;
}
