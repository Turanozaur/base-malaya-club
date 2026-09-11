import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { DeleteObjectButton } from "@/components/admin/delete-object-button";

export const metadata: Metadata = { title: "Objects — Admin" };

const TYPE_LABELS: Record<string, string> = {
  BUILDING: "Building",
  ANTENNA: "Antenna",
  SPAN: "Bridge / Span",
  EARTH: "Earth / Cliff",
};

export default async function AdminObjectsPage() {
  const objects = await prisma.baseObject.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Objects</h1>
        <Link
          href="/admin/objects/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New object
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Height</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {objects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No objects yet
                </td>
              </tr>
            )}
            {objects.map((obj) => (
              <tr key={obj.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{obj.name}</p>
                  <p className="text-xs text-muted-foreground">{obj.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {TYPE_LABELS[obj.type] ?? obj.type}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {obj.heightMeters != null ? `${obj.heightMeters} m` : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{obj.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      obj.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {obj.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/objects/${obj.id}/edit`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteObjectButton objectId={obj.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
