"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { adminNav } from "@/lib/admin-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <LayoutDashboard className="size-4" />
        Admin
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {adminNav.map(({ href, label }) => (
          <DropdownMenuItem key={href} render={<Link href={href} />}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
