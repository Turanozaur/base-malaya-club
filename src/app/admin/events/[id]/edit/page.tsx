import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { sortUsersByName } from "@/lib/user-sort";
import { EventForm } from "@/components/admin/event-form";
import { PhotographerPicker } from "@/components/admin/photographer-picker";
import { updateEventAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: event ? `Edit: ${event.title} — Admin` : "Edit event — Admin" };
}

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const [event, objects, approvedUsersRaw, assignedPhotographers] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.baseObject.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { status: "APPROVED" },
      select: { id: true, name: true, email: true, country: true },
    }),
    prisma.eventPhotographer.findMany({
      where: { eventId: id },
      select: { userId: true },
    }),
  ]);
  const approvedUsers = sortUsersByName(approvedUsersRaw);

  if (!event) notFound();
  const boundAction = updateEventAction.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/events" className="hover:text-foreground hover:underline">Events</Link>
        <span>/</span>
        <span className="text-foreground">{event.title}</span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit event</h1>
      <EventForm
        action={boundAction}
        objects={objects}
        initialValues={{
          title: event.title,
          slug: event.slug,
          description: event.description ?? undefined,
          schedule: event.schedule ?? undefined,
          startDate: toDateInput(event.startDate),
          endDate: toDateInput(event.endDate),
          capacity: event.capacity,
          objectId: event.objectId,
          requiresPayment: event.requiresPayment,
          visiblePublic: event.visiblePublic,
          visibleMembers: event.visibleMembers,
          schedulePublic: event.schedulePublic,
          summaryPublic: event.summaryPublic,
        }}
        submitLabel="Save changes"
      />

      <div className="mt-8">
        <PhotographerPicker
          eventId={id}
          users={approvedUsers}
          assignedIds={assignedPhotographers.map((p) => p.userId)}
        />
      </div>
    </div>
  );
}
