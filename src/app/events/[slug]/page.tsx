import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EventStatus, RegistrationStatus, UserStatus, Role } from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";
import { canViewEvent } from "@/lib/event-visibility";
import { canUploadToEvent } from "@/lib/media-service";
import { sortByUserName } from "@/lib/user-sort";
import { RegisterForm } from "@/components/events/register-form";
import { CancelRegistrationButton } from "@/components/events/cancel-registration-button";
import { EventMediaUpload } from "@/components/events/event-media-upload";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { title: true } });
  if (!event) return {};
  return { title: `${event.title} — BASE Malaya Club` };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      object: { select: { name: true, slug: true, city: true } },
      coverImage: { select: { storageKey: true } },
      createdBy: { select: { name: true } },
      mediaLinks: {
        include: {
          media: { select: { id: true, storageKey: true, caption: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      registrations: {
        where: { status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED] } },
        include: { user: { select: { id: true, name: true, country: true, email: true } } },
      },
    },
  });

  const session = await auth();

  if (
    !event ||
    !canViewEvent(event, {
      isAdmin: session?.user?.role === Role.ADMIN,
      isApproved: session?.user?.status === UserStatus.APPROVED,
    })
  ) {
    notFound();
  }

  const isApproved = session?.user?.status === UserStatus.APPROVED;
  const isMember = isApproved;
  const isMembersOnly = event.visibleMembers && !event.visiblePublic;

  const storage = getStorageProvider();
  const coverUrl = event.coverImage
    ? storage.getPublicUrl(event.coverImage.storageKey)
    : null;

  const myRegistration = session?.user
    ? event.registrations.find((r) => r.user.id === session.user!.id)
    : null;

  const registered = sortByUserName(
    event.registrations.filter((r) => r.status === RegistrationStatus.REGISTERED),
    (r) => r.user,
  );
  const waitlisted = sortByUserName(
    event.registrations.filter((r) => r.status === RegistrationStatus.WAITLISTED),
    (r) => r.user,
  );
  const isFull = event.capacity != null && registered.length >= event.capacity;
  const isOpen = event.status === EventStatus.PUBLISHED;

  const userRecord = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true, baseJumpCount: true },
      })
    : null;

  const canUpload =
    session?.user != null &&
    (await canUploadToEvent(
      { id: session.user.id, role: session.user.role as Role },
      event.id,
    ));

  const canRegister =
    isApproved && userRecord != null && (userRecord.baseJumpCount ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/events" className="hover:underline">← Events</Link>
      </div>

      {coverUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <h1 className="mb-4 text-4xl font-bold tracking-tight">{event.title}</h1>

      {isMembersOnly && isMember && (
        <p className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Club members only — not shown on the public website
        </p>
      )}

      {/* Key info */}
      <dl className="mb-8 flex flex-wrap gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Dates</dt>
          <dd className="font-semibold">
            {event.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            {event.endDate && ` – ${event.endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
          </dd>
        </div>
        {event.object && (
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-semibold">
              <Link href={`/objects/${event.object.slug}`} className="text-primary hover:underline">
                {event.object.name}
              </Link>
              {event.object.city && `, ${event.object.city}`}
            </dd>
          </div>
        )}
        {event.summaryPublic && (
          <div>
            <dt className="text-muted-foreground">Participants</dt>
            <dd className="font-semibold">
              {registered.length}
              {event.capacity && ` / ${event.capacity}`}
              {(() => {
                const countries = [...new Set(registered.map((r) => r.user.country).filter(Boolean))];
                return countries.length > 0 ? ` · ${countries.length} countries` : "";
              })()}
            </dd>
          </div>
        )}
        {event.requiresPayment && (
          <div>
            <dt className="text-muted-foreground">Entry fee</dt>
            <dd className="font-semibold">Required (paid on arrival)</dd>
          </div>
        )}
        {event.wallOfFamePublic && (
          <div>
            <dd>
              <Link href={`/events/${slug}/wall-of-fame`} className="font-semibold text-primary hover:underline">
                Wall of fame →
              </Link>
            </dd>
          </div>
        )}
      </dl>

      {event.description && (
        <div className="prose prose-neutral dark:prose-invert mb-8 max-w-none whitespace-pre-wrap">
          {event.description}
        </div>
      )}

      {/* Schedule */}
      {event.schedule && (event.schedulePublic || isMember) && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">
            Schedule
            {!event.schedulePublic && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">(members only)</span>
            )}
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {event.schedule}
          </div>
        </section>
      )}

      {/* Participants list — members only */}
      {isMember && registered.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">
            Participants <span className="text-sm font-normal text-muted-foreground">({registered.length})</span>
          </h2>
          <ol className="space-y-1 text-sm">
            {registered.map((reg, i) => (
              <li key={reg.user.id} className="flex items-center gap-2">
                <span className="w-6 text-right text-muted-foreground">{i + 1}.</span>
                <span className="font-medium">{reg.user.name ?? "—"}</span>
                {reg.user.country && <span className="text-muted-foreground">{reg.user.country}</span>}
                {reg.user.id === session?.user?.id && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">you</span>
                )}
              </li>
            ))}
          </ol>
          {waitlisted.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-medium text-muted-foreground">Waitlist ({waitlisted.length})</p>
              <ol className="space-y-1 text-sm">
                {waitlisted.map((reg, i) => (
                  <li key={reg.user.id} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-6 text-right">{i + 1}.</span>
                    <span>{reg.user.name ?? "—"}</span>
                    {reg.user.country && <span>{reg.user.country}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {/* Event photos */}
      {event.mediaLinks.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Photos</h2>
            <Link href={`/gallery?event=${slug}`} className="text-sm text-primary hover:underline">
              View in gallery →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {event.mediaLinks.map(({ media }) => (
              <div
                key={media.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={storage.getPublicUrl(media.storageKey)}
                  alt={media.caption ?? event.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Photographer upload */}
      {canUpload && (
        <section className="mb-8">
          <EventMediaUpload eventId={event.id} />
        </section>
      )}

      {/* Registration box */}
      {isOpen && isApproved && canRegister && (
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Registration</h2>

          {myRegistration ? (
            <div className="space-y-3">
              <p className="text-sm">
                {myRegistration.status === RegistrationStatus.REGISTERED
                  ? "✓ You are registered for this event."
                  : "You are on the waitlist for this event."}
              </p>
              <CancelRegistrationButton
                registrationId={myRegistration.id}
                eventTitle={event.title}
              />
            </div>
          ) : isFull ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The event is full. You can join the waitlist — you will be promoted automatically if a spot opens up.
              </p>
              <RegisterForm eventId={event.id} hasAvatar={!!userRecord?.image} />
            </div>
          ) : (
            <RegisterForm eventId={event.id} hasAvatar={!!userRecord?.image} />
          )}
        </section>
      )}

      {isOpen && isApproved && !canRegister && (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Event registration is available to approved BASE jumpers only.
        </div>
      )}

      {isOpen && !session?.user && (
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          {" "}to register for this event.
        </div>
      )}
    </div>
  );
}
