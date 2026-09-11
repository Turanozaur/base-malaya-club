import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getStorageProvider, UPLOAD_LIMITS, pendingAvatarKey } from "@/lib/storage";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, contentType, sizeBytes } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered." },
      { status: 409 },
    );
  }

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

  const key = pendingAvatarKey(email, contentType);
  const storage = getStorageProvider();
  const intent = await storage.getUploadIntent(key, { contentType });

  return NextResponse.json(intent);
}
