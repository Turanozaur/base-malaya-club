import { cn } from "@/lib/utils";

type PendingApplicationsBadgeProps = {
  count: number;
  className?: string;
  size?: "sm" | "md";
};

export function PendingApplicationsBadge({
  count,
  className,
  size = "sm",
}: PendingApplicationsBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary font-medium tabular-nums text-primary-foreground",
        size === "sm" && "px-1.5 py-0.5 text-xs",
        size === "md" && "px-2 py-0.5 text-sm",
        className,
      )}
      aria-label={`${count} pending application${count === 1 ? "" : "s"}`}
    >
      {count}
    </span>
  );
}
