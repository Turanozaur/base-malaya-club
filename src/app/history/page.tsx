import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "History — BASE Malaya Club" };

export const revalidate = 60;

export default async function HistoryPage() {
  const page = await prisma.page.findUnique({ where: { slug: "history" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        {page?.title ?? "Club History"}
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
        {page?.body ?? ""}
      </div>
    </div>
  );
}
