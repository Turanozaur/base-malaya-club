import Link from "next/link";

import { mainNav } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { SiteHeaderAuth } from "@/components/site-header-auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/45 backdrop-blur-md supports-[backdrop-filter]:bg-background/35">
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center gap-2 px-4 sm:h-16 sm:gap-3 md:gap-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold sm:gap-2.5"
        >
          <MalaysiaFlag className="h-5 w-10 shrink-0 sm:h-6 sm:w-12" />
          <span className="truncate text-sm leading-none tracking-tight sm:text-base md:text-lg">
            BASE Malaya Club
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <SiteHeaderAuth />
        </div>
      </div>
    </header>
  );
}
