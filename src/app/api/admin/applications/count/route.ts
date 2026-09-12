import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";
import { getPendingApplicationsCount } from "@/lib/applications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const count = await getPendingApplicationsCount();
  return NextResponse.json({ count });
}
