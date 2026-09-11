import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { sortByUserName } from "@/lib/user-sort";
import { RegistrationsTable } from "@/components/admin/registrations-table";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: event ? `Registrations: ${event.title} — Admin` : "Registrations — Admin" };
}

export default async function RegistrationsPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, country: true, email: true },
          },
        },
      },
    },
  });

  if (!event) notFound();

  const rows = sortByUserName(
    event.registrations.map((r) => ({
      id: r.id,
      status: r.status,
      paymentStatus: r.paymentStatus,
      registeredAt: r.registeredAt,
      hasEventPhoto: !!r.eventPhotoKey,
      user: {
        id: r.user.id,
        name: r.user.name,
        country: r.user.country,
        email: r.user.email,
      },
    })),
    (row) => row.user,
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/events" className="hover:text-foreground hover:underline">Events</Link>
        <span>/</span>
        <Link href={`/admin/events/${id}/edit`} className="hover:text-foreground hover:underline">{event.title}</Link>
        <span>/</span>
        <span className="text-foreground">Registrations</span>
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          <p className="text-sm text-muted-foreground">
            {event.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href={`/events/${event.slug}`} target="_blank" className="text-sm text-primary hover:underline">
          View public page →
        </Link>
      </div>

      <RegistrationsTable
        eventId={event.id}
        eventSlug={event.slug}
        eventTitle={event.title}
        wallOfFamePublic={event.wallOfFamePublic}
        registrations={rows}
      />
    </div>
  );
}
