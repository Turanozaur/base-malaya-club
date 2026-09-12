import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthPageCloseProps = {
  href?: string;
  size?: "sm" | "md";
  className?: string;
};

export function AuthPageClose({
  href = "/",
  size = "sm",
  className,
}: AuthPageCloseProps) {
  return (
    <Button
      variant="ghost"
      size={size === "md" ? "icon" : "icon-sm"}
      nativeButton={false}
      render={<Link href={href} aria-label="Close" />}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      <X className={size === "md" ? "size-5" : "size-4"} />
    </Button>
  );
}
