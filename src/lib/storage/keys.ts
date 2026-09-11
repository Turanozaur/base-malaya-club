import { createHash } from "crypto";
import { extname } from "path";

function ext(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
  };
  return map[mimeType] ?? "bin";
}

function yearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** avatars/{userId}/{uuid}.jpg  — date omitted, avatars are few and per-user */
export function avatarKey(userId: string, mimeType: string): string {
  return `avatars/${userId}/${crypto.randomUUID()}.${ext(mimeType)}`;
}

/** media/events/{eventId}/{yyyy}/{mm}/{uuid}.jpg */
export function eventMediaKey(eventId: string, mimeType: string): string {
  return `media/events/${eventId}/${yearMonth()}/${crypto.randomUUID()}.${ext(mimeType)}`;
}

/** media/objects/{objectId}/{yyyy}/{mm}/{uuid}.jpg */
export function objectMediaKey(objectId: string, mimeType: string): string {
  return `media/objects/${objectId}/${yearMonth()}/${crypto.randomUUID()}.${ext(mimeType)}`;
}

/** media/events/{eventId}/wall-of-fame/{userId}/{uuid}.jpg */
export function eventPhotoKey(eventId: string, userId: string, mimeType: string): string {
  return `media/events/${eventId}/wall-of-fame/${userId}/${crypto.randomUUID()}.${ext(mimeType)}`;
}

/** Extract file extension from an original filename (fallback only). */
export function extFromFilename(filename: string): string {
  return extname(filename).replace(".", "") || "bin";
}

function emailHash(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

/** avatars/pending/{emailHash}/{uuid}.jpg — before account exists */
export function pendingAvatarKey(email: string, mimeType: string): string {
  return `avatars/pending/${emailHash(email)}/${crypto.randomUUID()}.${ext(mimeType)}`;
}

export function isPendingAvatarKeyForEmail(
  key: string,
  email: string,
): boolean {
  return key.startsWith(`avatars/pending/${emailHash(email)}/`);
}
