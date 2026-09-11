import type { Media, Event } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/client";
import { getStorageProvider } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

type SessionUser = {
  id: string;
  role: Role;
  permissions?: { permission: string }[];
};

// ─── DTO ────────────────────────────────────────────────────────────────────

export type MediaDto = {
  id: string;
  url: string; // computed — never stored in DB
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  uploadedById: string;
  createdAt: Date;
};

/**
 * Enrich a raw Media record with a public URL.
 * This is the only place that knows about CDN/storage URLs.
 * The client never receives storageKey.
 */
export function toDto(media: Media): MediaDto {
  const storage = getStorageProvider();
  return {
    id: media.id,
    url: storage.getPublicUrl(media.storageKey),
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    width: media.width,
    height: media.height,
    caption: media.caption,
    uploadedById: media.uploadedById,
    createdAt: media.createdAt,
  };
}

export function toDtoList(media: Media[]): MediaDto[] {
  return media.map(toDto);
}

// ─── Ownership / permissions ─────────────────────────────────────────────────

/** Admin or assigned EventPhotographer may upload to an event gallery. */
export async function canUploadToEvent(
  actor: SessionUser,
  eventId: string,
): Promise<boolean> {
  if (actor.role === Role.ADMIN) return true;
  if (hasPermission(actor as Parameters<typeof hasPermission>[0], "MEDIA_UPLOAD" as never)) {
    return true;
  }
  const assignment = await prisma.eventPhotographer.findUnique({
    where: { eventId_userId: { eventId, userId: actor.id } },
  });
  return assignment != null;
}

/**
 * Only the uploader or an admin can delete the Media record and its R2 object.
 * Event organizers may only unlink — see canUnlinkFromEvent.
 */
export function canDeleteMedia(actor: SessionUser, media: Media): boolean {
  if (actor.role === Role.ADMIN) return true;
  if (media.uploadedById === actor.id) return true;
  return false;
}

/**
 * Unlinking removes the EventMedia row but does NOT delete the file.
 * Allowed for: uploader, event creator, admin, USER_MANAGE permission.
 */
export function canUnlinkFromEvent(
  actor: SessionUser,
  media: Media,
  event: Pick<Event, "createdById">,
): boolean {
  if (actor.role === Role.ADMIN) return true;
  if (media.uploadedById === actor.id) return true;
  if (event.createdById === actor.id) return true;
  if (hasPermission(actor as Parameters<typeof hasPermission>[0], "USER_MANAGE" as never))
    return true;
  return false;
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Fully delete a Media record: remove all join-table rows, the Media row,
 * and finally the R2 object. Throws if actor lacks permission.
 */
export async function deleteMedia(
  actor: SessionUser,
  mediaId: string,
): Promise<void> {
  const media = await prisma.media.findUniqueOrThrow({ where: { id: mediaId } });

  if (!canDeleteMedia(actor, media)) {
    throw new Error("Forbidden: you cannot delete this media");
  }

  // Remove join-table rows first (FK constraints).
  await prisma.eventMedia.deleteMany({ where: { mediaId } });
  await prisma.objectMedia.deleteMany({ where: { mediaId } });

  // Remove the Media record.
  await prisma.media.delete({ where: { id: mediaId } });

  // Delete the file from storage last — if this fails, the DB is already clean.
  // The orphan cleanup job will handle any leftover R2 objects.
  await getStorageProvider().deleteObject(media.storageKey).catch((err) => {
    console.error(`[media] Failed to delete R2 object ${media.storageKey}:`, err);
  });
}

/**
 * Remove a media item from an event (delete EventMedia row only).
 * Does NOT delete the Media record or the R2 object.
 */
export async function unlinkFromEvent(
  actor: SessionUser,
  eventMediaId: string,
): Promise<void> {
  const eventMedia = await prisma.eventMedia.findUniqueOrThrow({
    where: { id: eventMediaId },
    include: { media: true, event: true },
  });

  if (!canUnlinkFromEvent(actor, eventMedia.media, eventMedia.event)) {
    throw new Error("Forbidden: you cannot unlink this media from the event");
  }

  await prisma.eventMedia.delete({ where: { id: eventMediaId } });
}
