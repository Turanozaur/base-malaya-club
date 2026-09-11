import type { Metadata } from "next";
import Link from "next/link";

import { ObjectForm } from "@/components/admin/object-form";
import { createObjectAction } from "../actions";

export const metadata: Metadata = { title: "New object — Admin" };

export default function NewObjectPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/objects" className="hover:text-foreground hover:underline">
          Objects
        </Link>
        <span>/</span>
        <span className="text-foreground">New object</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New object</h1>

      <ObjectForm action={createObjectAction} submitLabel="Create object" />
    </div>
  );
}
