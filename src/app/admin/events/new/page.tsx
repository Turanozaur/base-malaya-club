import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/admin/event-form";
import { createEventAction } from "../actions";

export const metadata: Metadata = { title: "New event — Admin" };

export default async function NewEventPage() {
  const objects = await prisma.baseObject.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/events" className="hover:text-foreground hover:underline">Events</Link>
        <span>/</span>
        <span className="text-foreground">New event</span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm action={createEventAction} objects={objects} submitLabel="Create event" />
    </div>
  );
}
