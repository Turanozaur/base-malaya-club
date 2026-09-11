import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { Role, UserStatus } from "@/generated/prisma/client";
import {
  getStorageProvider,
  UPLOAD_LIMITS,
  type UploadPurpose,
  eventMediaKey,
  objectMediaKey,
} from "@/lib/storage";
import { canUploadToEvent } from "@/lib/media-service";

const bodySchema = z.object({
  purpose: z.enum(["eventMedia", "objectMedia"]),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
  eventId: z.string().optional(),
  objectId: z.string().optional(),
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

  const { purpose, contentType, sizeBytes, eventId, objectId } = parsed.data;
  const actor = session.user as { id: string; role: Role; permissions?: { permission: string }[] };

  if (purpose === "eventMedia") {
    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }
    if (!(await canUploadToEvent(actor, eventId))) {
      return NextResponse.json({ error: "Forbidden: not assigned as photographer for this event" }, { status: 403 });
    }
  }

  if (purpose === "objectMedia") {
    if (!objectId) {
      return NextResponse.json({ error: "objectId is required" }, { status: 400 });
    }
    if (actor.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
    }
  }

  const limits = UPLOAD_LIMITS[purpose as UploadPurpose];

  if (!limits.types.includes(contentType)) {
    return NextResponse.json(
      { error: `Unsupported content type. Allowed: ${limits.types.join(", ")}` },
      { status: 400 },
    );
  }

  if (sizeBytes > limits.maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max: ${limits.maxBytes / 1024 / 1024} MB` },
      { status: 400 },
    );
  }

  const key =
    purpose === "eventMedia"
      ? eventMediaKey(eventId!, contentType)
      : objectMediaKey(objectId!, contentType);

  const storage = getStorageProvider();
  const intent = await storage.getUploadIntent(key, { contentType, maxSizeBytes: limits.maxBytes });

  return NextResponse.json(intent);
}
