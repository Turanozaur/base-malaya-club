"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import { adminNav } from "@/lib/admin-nav";
import type { NavItem } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteMobileNavProps = {
  items: NavItem[];
  signedIn: boolean;
  isAdmin: boolean;
};

const linkCls =
  "block rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent";

export function SiteMobileNav({ items, signedIn, isAdmin }: SiteMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-4" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 lg:hidden" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-0 top-14 z-50 flex max-h-[calc(100dvh-3.5rem)] flex-col border-b bg-background shadow-lg outline-none",
            "data-open:animate-in data-open:slide-in-from-top-2 data-open:fade-in-0",
            "data-closed:animate-out data-closed:slide-out-to-top-2 data-closed:fade-out-0",
            "sm:top-16 lg:hidden",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="text-sm font-semibold">Menu</Dialog.Title>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close menu"
                />
              }
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <nav className="overflow-y-auto px-2 py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={linkCls}
                onClick={close}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {isAdmin ? (
            <div className="border-t px-2 py-2 md:hidden">
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={linkCls}
                  onClick={close}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-auto border-t px-4 py-4 md:hidden">
            {signedIn ? (
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/me" prefetch={false} onClick={close} />}
              >
                Profile
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/login" prefetch={false} onClick={close} />}
                >
                  Sign in
                </Button>
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/register" prefetch={false} onClick={close} />}
                >
                  Join
                </Button>
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
