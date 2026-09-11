import Link from "next/link";
import Image from "next/image";

type PostCardProps = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  authorName: string | null;
  coverUrl: string | null;
  basePath: "/news" | "/education";
};

export function PostCard({
  slug,
  title,
  excerpt,
  publishedAt,
  authorName,
  coverUrl,
  basePath,
}: PostCardProps) {
  const dateStr = publishedAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(publishedAt)
    : null;

  return (
    <Link
      href={`${basePath}/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30"
    >
      {coverUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
          {title}
        </h2>
        {excerpt && (
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {authorName && <span>{authorName}</span>}
          {authorName && dateStr && <span>·</span>}
          {dateStr && <span>{dateStr}</span>}
        </div>
      </div>
    </Link>
  );
}
