import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ObjectForm } from "@/components/admin/object-form";
import { ObjectMediaUpload } from "@/components/admin/object-media-upload";
import { updateObjectAction } from "../../actions";
import type { ObjectType } from "@/lib/constants/event";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const obj = await prisma.baseObject.findUnique({ where: { id }, select: { name: true } });
  return { title: obj ? `Edit: ${obj.name} — Admin` : "Edit object — Admin" };
}

export default async function EditObjectPage({ params }: Props) {
  const { id } = await params;
  const obj = await prisma.baseObject.findUnique({ where: { id } });
  if (!obj) notFound();

  const boundAction = updateObjectAction.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/objects" className="hover:text-foreground hover:underline">
          Objects
        </Link>
        <span>/</span>
        <span className="text-foreground">{obj.name}</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit object</h1>

      <ObjectForm
        action={boundAction}
        initialValues={{
          name: obj.name,
          slug: obj.slug,
          type: obj.type as ObjectType,
          description: obj.description ?? undefined,
          heightMeters: obj.heightMeters,
          city: obj.city,
          latitude: obj.latitude,
          longitude: obj.longitude,
          isActive: obj.isActive,
        }}
        submitLabel="Save changes"
      />

      <div className="mt-8">
        <ObjectMediaUpload objectId={id} />
      </div>
    </div>
  );
}
