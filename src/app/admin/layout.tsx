import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";
import { adminNav } from "@/lib/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:flex-row sm:gap-8">
      <nav className="mb-6 shrink-0 sm:mb-0 sm:w-48">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Admin
        </p>
        <ul className="space-y-1">
          {adminNav.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
