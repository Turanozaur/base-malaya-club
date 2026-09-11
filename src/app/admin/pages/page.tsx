import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pages — Admin" };

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Static pages</h1>

      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-xs text-muted-foreground">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Updated {page.updatedAt.toLocaleDateString()}</span>
              <Link
                href={`/admin/pages/${page.slug}/edit`}
                className="font-medium text-primary hover:underline"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
