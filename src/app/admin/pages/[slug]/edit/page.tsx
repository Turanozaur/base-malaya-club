import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { PageEditForm } from "@/components/admin/page-edit-form";
import { updatePageAction } from "../../actions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit page: ${slug} — Admin` };
}

export default async function EditPagePage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();

  const boundAction = updatePageAction.bind(null, slug);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/pages" className="hover:text-foreground hover:underline">
          Pages
        </Link>
        <span>/</span>
        <span className="text-foreground">{page.title}</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit page</h1>

      <PageEditForm
        action={boundAction}
        initialTitle={page.title}
        initialBody={page.body}
      />
    </div>
  );
}
