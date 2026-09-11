import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus, Role } from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";
import { canViewEvent } from "@/lib/event-visibility";
import { fullYearsSince, isoMonthYearToDate } from "@/lib/experience";
import { sortUsersByName } from "@/lib/user-sort";

type Props = { params: Promise<{ slug: string }> };

type ProfileSnapshot = {
  name?: string;
  country?: string;
  baseJumpCount?: number;
  skydiveJumpCount?: number;
  baseSince?: string;
  skydiveSince?: string;
  instagram?: string;
  photoUrl?: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { title: true } });
  if (!event) return {};
  return { title: `Wall of Fame — ${event.title} — BASE Malaya Club` };
}

export default async function WallOfFamePage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, wallOfFamePublic: true },
    include: {
      object: { select: { name: true } },
      registrations: {
        where: {
          status: { in: ["REGISTERED", "ATTENDED"] },
          profileSnapshot: { not: undefined },
        },
        select: {
          id: true,
          eventPhotoKey: true,
          profileSnapshot: true,
        },
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

  const storage = getStorageProvider();

  const jumpers = sortUsersByName(
    event.registrations
      .map((reg) => {
        const snap = reg.profileSnapshot as ProfileSnapshot | null;
        if (!snap) return null;

        const photoUrl = reg.eventPhotoKey
          ? storage.getPublicUrl(reg.eventPhotoKey)
          : (snap.photoUrl ?? null);

        if (!photoUrl) return null;

        return { ...snap, photoUrl };
      })
      .filter(Boolean) as (ProfileSnapshot & { photoUrl: string })[],
  );

  const countries = [...new Set(jumpers.map((j) => j.country).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href={`/events/${slug}`} className="hover:underline">← {event.title}</Link>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Wall of Fame</h1>
        <p className="mt-2 text-lg font-medium">{event.title}</p>
        {event.object && (
          <p className="text-muted-foreground">{event.object.name}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {event.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p className="mt-3 text-sm font-medium">
          {jumpers.length} jumper{jumpers.length !== 1 ? "s" : ""} · {countries.length} countr{countries.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      {jumpers.length === 0 ? (
        <p className="text-center text-muted-foreground">No profiles with photos yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {jumpers.map((jumper) => {
            const yearsInBase = jumper.baseSince
              ? fullYearsSince(
                  isoMonthYearToDate(jumper.baseSince),
                  new Date(event.startDate),
                )
              : null;

            return (
              <div
                key={jumper.name ?? jumper.photoUrl}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center"
              >
                <div className="relative size-28 overflow-hidden rounded-full border-2 border-muted bg-muted">
                  <Image
                    src={jumper.photoUrl}
                    alt={jumper.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>

                <div>
                  <p className="font-semibold leading-snug">{jumper.name ?? "—"}</p>
                  {jumper.country && (
                    <p className="text-xs text-muted-foreground">{jumper.country}</p>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{jumper.baseJumpCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">BASE</p>
                  </div>
                  {(jumper.skydiveJumpCount ?? 0) > 0 && (
                    <div className="text-center">
                      <p className="font-semibold">{jumper.skydiveJumpCount}</p>
                      <p className="text-xs text-muted-foreground">Skydive</p>
                    </div>
                  )}
                  {yearsInBase != null && (
                    <div className="text-center">
                      <p className="font-semibold">{yearsInBase}</p>
                      <p className="text-xs text-muted-foreground">Yrs</p>
                    </div>
                  )}
                </div>

                {jumper.instagram && (
                  <a
                    href={`https://instagram.com/${jumper.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    @{jumper.instagram.replace("@", "")}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
