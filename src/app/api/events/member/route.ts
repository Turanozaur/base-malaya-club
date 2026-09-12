import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { memberEventsWhere } from "@/lib/event-visibility";
import { eventListInclude, serializeEventListItem } from "@/lib/events-list";

export async function GET() {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.status !== UserStatus.APPROVED
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: memberEventsWhere(),
    include: eventListInclude,
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(events.map(serializeEventListItem));
}
