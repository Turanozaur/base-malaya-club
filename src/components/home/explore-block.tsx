import Link from "next/link";

import { cn } from "@/lib/utils";

type ExploreBlockProps = {
  title: string;
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function ExploreBlock({
  title,
  href,
  className,
  children,
}: ExploreBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2 md:gap-3 md:px-3 md:py-2.5 lg:px-4 lg:py-3">
        <h3 className="text-xs font-semibold tracking-tight md:text-sm">{title}</h3>
        <Link
          href={href}
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          View all →
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-3 lg:p-4">{children}</div>
    </div>
  );
}
