import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

const bodySchema = z.object({
  storageKey: z.string().min(1),
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

  const { storageKey } = parsed.data;

  // Ensure the key belongs to this user (avatars/{userId}/...)
  if (!storageKey.startsWith(`avatars/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const storage = getStorageProvider();
  const newUrl = storage.getPublicUrl(storageKey);

  // Fetch current avatar key to delete the old file after updating.
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { image: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: newUrl },
  });

  // Best-effort deletion of the old avatar — failure is non-fatal.
  if (currentUser.image) {
    const oldKey = extractStorageKey(currentUser.image, storage.getPublicUrl(""));
    if (oldKey) {
      await storage.deleteObject(oldKey).catch((err) => {
        console.error("[avatar] Failed to delete old avatar:", err);
      });
    }
  }

  return NextResponse.json({ url: newUrl });
}

/** Derive storageKey from a public URL: strip the base URL prefix. */
function extractStorageKey(imageUrl: string, baseUrl: string): string | null {
  // Strip trailing slash from base
  const base = baseUrl.replace(/\/$/, "");
  if (!imageUrl.startsWith(base)) return null;
  return imageUrl.slice(base.length + 1); // +1 for the "/"
}
