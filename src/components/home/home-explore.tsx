import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import {
  EventStatus,
  PostStatus,
  PostType,
  UserStatus,
} from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";
import { textExcerpt } from "@/lib/text-excerpt";
import { cn } from "@/lib/utils";
import { sortUsersByName } from "@/lib/user-sort";
import { ExploreBlock } from "@/components/home/explore-block";
import { publicEventsWhere } from "@/lib/event-visibility";

const EVENT_BADGE: Record<string, { label: string; className: string }> = {
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

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function HomeExplore() {
  const now = new Date();

  const [
    upcomingEvent,
    latestEvent,
    latestNews,
    latestEducation,
    objects,
    historyPage,
    memberPreviewRaw,
    memberCount,
    eventMedia,
    objectMedia,
  ] = await Promise.all([
    prisma.event.findFirst({
      where: { ...publicEventsWhere(), startDate: { gte: now } },
      include: {
        object: { select: { name: true } },
        coverImage: { select: { storageKey: true } },
        _count: {
          select: { registrations: { where: { status: "REGISTERED" } } },
        },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.event.findFirst({
      where: publicEventsWhere(),
      include: {
        object: { select: { name: true } },
        coverImage: { select: { storageKey: true } },
        _count: {
          select: { registrations: { where: { status: "REGISTERED" } } },
        },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.post.findFirst({
      where: { type: PostType.NEWS, status: PostStatus.PUBLISHED },
      include: {
        author: { select: { name: true } },
        coverImage: { select: { storageKey: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.post.findFirst({
      where: { type: PostType.EDUCATION, status: PostStatus.PUBLISHED },
      include: {
        author: { select: { name: true } },
        coverImage: { select: { storageKey: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.baseObject.findMany({
      where: { isActive: true },
      include: { coverImage: { select: { storageKey: true } } },
      orderBy: { name: "asc" },
      take: 3,
    }),
    prisma.page.findUnique({ where: { slug: "history" } }),
    prisma.user.findMany({
      where: {
        status: UserStatus.APPROVED,
        showInMembersDirectory: true,
        baseJumpCount: { gt: 0 },
      },
      select: { id: true, name: true, email: true, image: true },
    }),
    prisma.user.count({
      where: {
        status: UserStatus.APPROVED,
        showInMembersDirectory: true,
        baseJumpCount: { gt: 0 },
      },
    }),
    prisma.eventMedia.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        media: { select: { id: true, storageKey: true } },
        event: { select: { status: true, visiblePublic: true } },
      },
    }),
    prisma.objectMedia.findMany({
      where: { showInGallery: true },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { media: { select: { id: true, storageKey: true } } },
    }),
  ]);

  const storage = getStorageProvider();
  const featuredEvent = upcomingEvent ?? latestEvent;
  const memberPreview = sortUsersByName(memberPreviewRaw).slice(0, 6);

  const galleryItems = [
    ...eventMedia
      .filter((em) => em.event.visiblePublic)
      .filter(
        (em) =>
          em.event.status === EventStatus.PUBLISHED ||
          em.event.status === EventStatus.COMPLETED,
      )
      .map((em) => ({
        id: em.media.id,
        url: storage.getPublicUrl(em.media.storageKey),
        createdAt: em.createdAt.getTime(),
      })),
    ...objectMedia.map((om) => ({
      id: om.media.id,
      url: storage.getPublicUrl(om.media.storageKey),
      createdAt: om.createdAt.getTime(),
    })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Explore
        </h2>
        <p className="mt-2 text-muted-foreground">
          Events, news, gallery and everything else in the club
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {/* Row 1 — Events left; Gallery + News stacked on the right */}
        <div
          className={cn(
            "grid grid-cols-1 gap-3 md:gap-4",
            featuredEvent && "md:grid-cols-2 md:grid-rows-2",
          )}
        >
        {featuredEvent && (
          <ExploreBlock title="Events" href="/events" className="md:row-span-2">
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="group flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background/50 transition-colors hover:bg-accent/30"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-auto md:min-h-32 md:flex-1 lg:min-h-48">
                {featuredEvent.coverImage ? (
                  <Image
                    src={storage.getPublicUrl(
                      featuredEvent.coverImage.storageKey,
                    )}
                    alt={featuredEvent.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    🪂
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-2.5 md:gap-1.5 md:p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary md:text-base">
                    {featuredEvent.title}
                  </h4>
                  {EVENT_BADGE[featuredEvent.status] && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_BADGE[featuredEvent.status].className}`}
                    >
                      {EVENT_BADGE[featuredEvent.status].label}
                    </span>
                  )}
                </div>
                {featuredEvent.object && (
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    {featuredEvent.object.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(featuredEvent.startDate)}
                  {featuredEvent.endDate &&
                    ` – ${formatDate(featuredEvent.endDate)}`}
                </p>
                <p className="mt-auto text-xs text-muted-foreground">
                  {featuredEvent._count.registrations} registered
                  {featuredEvent.capacity != null &&
                    ` / ${featuredEvent.capacity}`}
                  {!upcomingEvent && latestEvent && (
                    <span className="ml-1 text-muted-foreground/80">
                      · latest
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </ExploreBlock>
        )}

        {/* Gallery */}
        <ExploreBlock title="Gallery" href="/gallery">
          {galleryItems.length > 0 ? (
            <Link
              href="/gallery"
              className="group grid flex-1 grid-cols-4 gap-1.5 overflow-hidden rounded-lg"
            >
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-square"
                >
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="120px"
                  />
                </div>
              ))}
            </Link>
          ) : (
            <EmptyHint text="No photos in the gallery yet." href="/gallery" />
          )}
        </ExploreBlock>

        {/* News */}
        <ExploreBlock title="News" href="/news">
          {latestNews ? (
            <PostPreview
              href={`/news/${latestNews.slug}`}
              title={latestNews.title}
              excerpt={latestNews.excerpt}
              coverUrl={
                latestNews.coverImage
                  ? storage.getPublicUrl(latestNews.coverImage.storageKey)
                  : null
              }
              meta={[
                latestNews.author.name,
                latestNews.publishedAt
                  ? formatDate(latestNews.publishedAt)
                  : null,
              ]}
              compact
            />
          ) : (
            <EmptyHint text="No news published yet." href="/news" />
          )}
        </ExploreBlock>
        </div>

        {/* Row 2 — Objects, Education, History, Members */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {/* Objects */}
        <ExploreBlock title="Objects" href="/objects">
          {objects.length > 0 ? (
            <div className="flex flex-1 flex-col gap-2">
              {objects.map((obj) => {
                const coverUrl = obj.coverImage
                  ? storage.getPublicUrl(obj.coverImage.storageKey)
                  : null;
                return (
                  <Link
                    key={obj.id}
                    href={`/objects/${obj.slug}`}
                    className="group flex items-center gap-2 rounded-lg border bg-background/50 p-1.5 transition-colors hover:bg-accent/30 md:gap-2.5 md:p-2"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted md:size-12">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={obj.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-lg">
                          🏗
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">
                        {obj.name}
                      </p>
                      {obj.heightMeters != null && (
                        <p className="text-xs text-muted-foreground">
                          {obj.heightMeters} m
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyHint text="No objects listed yet." href="/objects" />
          )}
        </ExploreBlock>

        {/* Education */}
        <ExploreBlock title="Education" href="/education">
          {latestEducation ? (
            <PostPreview
              href={`/education/${latestEducation.slug}`}
              title={latestEducation.title}
              excerpt={latestEducation.excerpt}
              coverUrl={
                latestEducation.coverImage
                  ? storage.getPublicUrl(
                      latestEducation.coverImage.storageKey,
                    )
                  : null
              }
              compact
            />
          ) : (
            <EmptyHint text="No articles published yet." href="/education" />
          )}
        </ExploreBlock>

        {/* History — compact text teaser */}
        <ExploreBlock title="History" href="/history">
          {historyPage?.body ? (
            <Link
              href="/history"
              className="group flex flex-col gap-2 rounded-lg transition-colors"
            >
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80">
                {textExcerpt(historyPage.body, 100)}
              </p>
              <span className="text-xs font-medium text-primary group-hover:underline">
                Read more →
              </span>
            </Link>
          ) : (
            <EmptyHint text="Club history coming soon." href="/history" />
          )}
        </ExploreBlock>

        {/* Members */}
        <ExploreBlock
          title="Members"
          href="/members"
          className="md:col-span-3 lg:col-span-1"
        >
          {memberCount > 0 ? (
            <Link
              href="/members"
              className="group flex flex-1 flex-col justify-center gap-3 rounded-lg transition-colors md:flex-row md:items-center md:justify-between lg:flex-col"
            >
              <p className="text-lg font-semibold tabular-nums md:text-xl lg:text-2xl">
                {memberCount}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground md:text-sm lg:text-base">
                  jumper{memberCount !== 1 ? "s" : ""}
                </span>
              </p>
              <div className="flex items-center">
                {memberPreview.map((member, i) => (
                  <div
                    key={member.id}
                    className="relative size-8 overflow-hidden rounded-full border-2 border-card bg-muted md:size-9 lg:size-10"
                    style={{ marginLeft: i === 0 ? 0 : -10, zIndex: memberPreview.length - i }}
                  >
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name ?? "Member"}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
                        {(member.name ?? "?")[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
                {memberCount > memberPreview.length && (
                  <span className="ml-2 text-xs text-muted-foreground group-hover:text-primary lg:text-sm">
                    +{memberCount - memberPreview.length}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <EmptyHint text="No members in the directory yet." href="/members" />
          )}
        </ExploreBlock>
        </div>
      </div>
    </section>
  );
}

type PostPreviewProps = {
  href: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  meta?: (string | null)[];
  compact?: boolean;
};

function PostPreview({
  href,
  title,
  excerpt,
  coverUrl,
  meta,
  compact,
}: PostPreviewProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border bg-background/50 transition-colors hover:bg-accent/30",
        !compact && "md:flex-row",
      )}
    >
      {coverUrl && (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-muted aspect-video w-full",
            !compact && "md:h-auto md:w-40",
          )}
        >
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="160px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:gap-1.5 md:p-3">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {title}
        </h4>
        {excerpt && (
          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}
        {meta && (
          <p className="mt-auto text-xs text-muted-foreground">
            {meta.filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyHint({ text, href }: { text: string; href: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-2 text-sm text-muted-foreground">
      <p>{text}</p>
      <Link href={href} className="text-primary hover:underline">
        Browse section →
      </Link>
    </div>
  );
}
