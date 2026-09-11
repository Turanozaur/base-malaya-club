import type { Metadata } from "next";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/generated/prisma/client";
import { countryFlag } from "@/lib/country-flag";
import { ageFromBirthDate, formatBirthDate } from "@/lib/birth-date";
import { fullYearsSince } from "@/lib/experience";
import { sortUsersByName } from "@/lib/user-sort";

export const metadata: Metadata = { title: "Members — BASE Malaya Club" };

export default async function MembersPage() {
  const members = sortUsersByName(
    await prisma.user.findMany({
      where: {
        status: UserStatus.APPROVED,
        showInMembersDirectory: true,
        baseJumpCount: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        birthDate: true,
        showBirthDatePublicly: true,
        baseJumpCount: true,
        baseSince: true,
        instagram: true,
      },
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Members</h1>
        <p className="mt-2 text-muted-foreground">
          {members.length} BASE jumper{members.length !== 1 ? "s" : ""} in the club
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {members.length === 0 && (
        <p className="text-muted-foreground">No members yet.</p>
      )}
    </div>
  );
}

type MemberCardProps = {
  member: {
    id: string;
    name: string | null;
    image: string | null;
    country: string | null;
    birthDate: Date | null;
    showBirthDatePublicly: boolean;
    baseJumpCount: number | null;
    baseSince: Date | null;
    instagram: string | null;
  };
};

function MemberCard({ member }: MemberCardProps) {
  const yearsInBase =
    member.baseSince != null ? fullYearsSince(member.baseSince) : null;

  const flag = countryFlag(member.country);

  const initials = (member.name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30">
      <div className="relative aspect-square w-full bg-muted">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name ?? "Member"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-muted-foreground">
            {initials}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div>
          <p className="font-semibold leading-snug">{member.name ?? "—"}</p>
          {member.country && (
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span>{member.country}</span>
              {flag && (
                <span aria-hidden className="text-base leading-none">
                  {flag}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold">{member.baseJumpCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">BASE jumps</p>
          </div>
          {yearsInBase != null && (
            <div className="text-center">
              <p className="font-semibold">{yearsInBase}</p>
              <p className="text-xs text-muted-foreground">years in BASE</p>
            </div>
          )}
          {member.showBirthDatePublicly && member.birthDate && (
            <div className="text-center">
              <p className="font-semibold">{ageFromBirthDate(member.birthDate)}</p>
              <p className="text-xs text-muted-foreground">years old</p>
            </div>
          )}
        </div>

        {member.showBirthDatePublicly && member.birthDate && (
          <p className="text-xs text-muted-foreground">
            Born {formatBirthDate(member.birthDate)}
          </p>
        )}

        {member.instagram && (
          <a
            href={`https://instagram.com/${member.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            @{member.instagram.replace("@", "")}
          </a>
        )}
      </div>
    </div>
  );
}
