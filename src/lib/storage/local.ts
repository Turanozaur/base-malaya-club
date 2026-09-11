import { createHmac } from "crypto";
import { type StorageProvider, type UploadIntent, type UploadOptions } from "./types";

const SECRET = process.env.AUTH_SECRET ?? "local-dev-secret";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const EXPIRES_IN_MS = 5 * 60 * 1000; // 5 minutes

function sign(key: string, expiresAt: number): string {
  return createHmac("sha256", SECRET)
    .update(`${key}:${expiresAt}`)
    .digest("hex");
}

export function verifyLocalToken(
  key: string,
  token: string,
  expires: string,
): boolean {
  const expiresAt = parseInt(expires, 10);
  if (Date.now() > expiresAt) return false;
  const expected = sign(key, expiresAt);
  // Constant-time comparison to prevent timing attacks.
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export class LocalStorageProvider implements StorageProvider {
  async getUploadIntent(
    key: string,
    opts: UploadOptions,
  ): Promise<UploadIntent> {
    const expiresAt = Date.now() + EXPIRES_IN_MS;
    const token = sign(key, expiresAt);

    // Encode the key into path segments for the [...key] route.
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    const url = `${BASE_URL}/api/storage/${encodedKey}?token=${token}&expires=${expiresAt}`;

    return {
      key,
      url,
      method: "PUT",
      headers: { "Content-Type": opts.contentType },
      expiresAt: new Date(expiresAt),
    };
  }

  async deleteObject(key: string): Promise<void> {
    const { unlink } = await import("fs/promises");
    const { join } = await import("path");
    const filePath = join(process.cwd(), "public", "uploads", key);
    await unlink(filePath).catch(() => {
      // Ignore — file may already be gone.
    });
  }

  getPublicUrl(key: string): string {
    return `${BASE_URL}/uploads/${key}`;
  }
}
