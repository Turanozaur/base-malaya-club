import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@/generated/prisma/client";
import { DeleteEventButton } from "@/components/admin/delete-event-button";

export const metadata: Metadata = { title: "Events — Admin" };

const STATUS_BADGE: Record<EventStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  PUBLISHED: { label: "Published", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: {
      object: { select: { name: true } },
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Link href="/admin/events/new" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          New event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No events yet</td></tr>
            )}
            {events.map((event) => {
              const badge = STATUS_BADGE[event.status];
              return (
                <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{event.object?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.startDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {event._count.registrations}
                    {event.capacity ? `/${event.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {event.visiblePublic && event.visibleMembers && "Public + members"}
                    {event.visiblePublic && !event.visibleMembers && "Public"}
                    {!event.visiblePublic && event.visibleMembers && "Members only"}
                    {!event.visiblePublic && !event.visibleMembers && "Hidden"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/events/${event.id}/edit`} className="text-xs font-medium text-primary hover:underline">Edit</Link>
                      <Link href={`/admin/events/${event.id}/registrations`} className="text-xs font-medium hover:underline">Registrations</Link>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
