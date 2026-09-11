import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

import { verifyLocalToken } from "@/lib/storage/local";

// This route exists only for local development. In production, clients upload
// directly to Cloudflare R2 via presigned URLs and this route is never hit.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { key: keySegments } = await params;
  const key = keySegments.join("/");
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const expires = searchParams.get("expires") ?? "";

  if (!verifyLocalToken(key, token, expires)) {
    return NextResponse.json({ error: "Invalid or expired upload token" }, { status: 401 });
  }

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  const filePath = join(process.cwd(), "public", "uploads", key);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(body));

  return new NextResponse(null, { status: 200 });
}
