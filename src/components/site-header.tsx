import Link from "next/link";

import { auth } from "@/auth";
import { mainNav } from "@/lib/nav";
import { Role } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { AdminMenu } from "@/components/admin-menu";
import { SiteMobileNav } from "@/components/site-mobile-nav";

export async function SiteHeader() {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === Role.ADMIN;

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
          <div className="hidden items-center gap-2 md:flex">
            {isAdmin && <AdminMenu />}
            {signedIn ? (
              <Button size="sm" nativeButton={false} render={<Link href="/me" />}>
                Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Join
                </Button>
              </>
            )}
          </div>
          <SiteMobileNav
            items={mainNav}
            signedIn={signedIn}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  );
}
