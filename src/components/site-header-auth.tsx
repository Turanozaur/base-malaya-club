"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { mainNav } from "@/lib/nav";
import { Role, UserStatus } from "@/lib/constants/user";
import { Button } from "@/components/ui/button";
import { AdminMenu } from "@/components/admin-menu";
import { SiteMobileNav } from "@/components/site-mobile-nav";

export function SiteHeaderAuth() {
  const { data: session, status } = useSession();

  const signedIn =
    status === "authenticated" &&
    Boolean(session?.user?.id) &&
    session.user.status === UserStatus.APPROVED;
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        {isAdmin && <AdminMenu />}
        {signedIn ? (
          <Button size="sm" nativeButton={false} render={<Link href="/me" />}>
            Profile
          </Button>
        ) : status === "loading" ? (
          <span
            className="inline-block h-8 w-28 rounded-md bg-muted/60"
            aria-hidden
          />
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
      <SiteMobileNav items={mainNav} signedIn={signedIn} isAdmin={isAdmin} />
    </>
  );
}
