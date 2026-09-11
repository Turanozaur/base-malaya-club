import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, UserStatus, MediaType, MediaStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canUploadToEvent, toDto } from "@/lib/media-service";

const bodySchema = z.object({
  storageKey: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  caption: z.string().max(500).optional(),
  eventId: z.string().optional(),
  objectId: z.string().optional(),
  showInGallery: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== UserStatus.APPROVED) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storageKey, mimeType, sizeBytes, width, height, caption, eventId, objectId, showInGallery } =
    parsed.data;

  const actor = session.user as { id: string; role: Role; permissions?: { permission: string }[] };

  if (eventId && !(await canUploadToEvent(actor, eventId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (objectId && actor.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  if (!eventId && !objectId) {
    return NextResponse.json({ error: "eventId or objectId is required" }, { status: 400 });
  }

  const existing = await prisma.media.findUnique({ where: { storageKey } });
  if (existing) {
    return NextResponse.json({ error: "Media already registered" }, { status: 409 });
  }

  const media = await prisma.media.create({
    data: {
      type: MediaType.IMAGE,
      status: MediaStatus.READY,
      storageKey,
      mimeType,
      sizeBytes,
      width,
      height,
      caption,
      uploadedById: session.user.id,
      ...(eventId ? { eventLinks: { create: { eventId } } } : {}),
      ...(objectId
        ? { objectLinks: { create: { objectId, showInGallery: showInGallery ?? false } } }
        : {}),
    },
  });

  return NextResponse.json(toDto(media), { status: 201 });
}
