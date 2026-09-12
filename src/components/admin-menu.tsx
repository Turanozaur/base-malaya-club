"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { adminNav } from "@/lib/admin-nav";
import { PendingApplicationsBadge } from "@/components/admin/pending-applications-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const APPLICATIONS_HREF = "/admin/applications";

type AdminMenuProps = {
  pendingCount?: number;
};

export function AdminMenu({ pendingCount = 0 }: AdminMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <LayoutDashboard className="size-4" />
        Admin
        <PendingApplicationsBadge count={pendingCount} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {adminNav.map(({ href, label }) => (
          <DropdownMenuItem
            key={href}
            className="w-full"
            render={
              <Link
                href={href}
                className="flex w-full items-center justify-between gap-3"
              />
            }
          >
            <span>{label}</span>
            {href === APPLICATIONS_HREF && (
              <PendingApplicationsBadge count={pendingCount} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
