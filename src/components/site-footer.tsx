import Link from "next/link";

import {
  SITE_CONTACT_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
} from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/45 backdrop-blur-md supports-[backdrop-filter]:bg-background/35">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
          <p className="shrink-0 text-sm font-medium md:text-base">Contacts</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground md:text-base">
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="transition-colors hover:text-foreground"
            >
              {SITE_CONTACT_EMAIL}
            </a>
            <span aria-hidden className="hidden text-border sm:inline">
              ·
            </span>
            <a
              href={SITE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              @{SITE_INSTAGRAM_HANDLE}
            </a>
            <span aria-hidden className="hidden text-border sm:inline">
              ·
            </span>
            <Link
              href="/register"
              className="transition-colors hover:text-foreground"
            >
              Apply to join
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground/80 md:text-sm">
          © {new Date().getFullYear()} BASE Malaya Club. The BASE jumping
          community of Malaysia.
        </p>
      </div>
    </footer>
  );
}
