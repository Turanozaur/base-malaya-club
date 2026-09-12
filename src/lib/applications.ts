import { cache } from "react";

import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Pending membership applications awaiting admin review. */
export const getPendingApplicationsCount = cache(async () =>
  prisma.user.count({ where: { status: UserStatus.PENDING } }),
);
