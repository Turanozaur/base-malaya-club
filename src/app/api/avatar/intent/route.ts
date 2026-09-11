import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { UserStatus } from "@/generated/prisma/client";
import { getStorageProvider, UPLOAD_LIMITS, avatarKey } from "@/lib/storage";

const bodySchema = z.object({
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
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

  const { contentType, sizeBytes } = parsed.data;
  const limits = UPLOAD_LIMITS.avatar;

  if (!limits.types.includes(contentType)) {
    return NextResponse.json(
      { error: `Unsupported type. Allowed: ${limits.types.join(", ")}` },
      { status: 400 },
    );
  }

  if (sizeBytes > limits.maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${limits.maxBytes / 1024 / 1024} MB` },
      { status: 400 },
    );
  }

  const key = avatarKey(session.user.id, contentType);
  const storage = getStorageProvider();
  const intent = await storage.getUploadIntent(key, { contentType });

  return NextResponse.json(intent);
}
