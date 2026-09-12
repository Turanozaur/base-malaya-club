"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function usePendingApplicationsCount(enabled: boolean) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPendingCount(0);
      return;
    }

    let cancelled = false;

    void fetch("/api/admin/applications/count")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: number } | null) => {
        if (!cancelled && typeof data?.count === "number") {
          setPendingCount(data.count);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, pathname]);

  return pendingCount;
}
