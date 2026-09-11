export type UploadOptions = {
  contentType: string;
  maxSizeBytes?: number;
  metadata?: Record<string, string>;
};

/**
 * Everything the client needs to PUT a file directly to storage.
 * publicUrl is intentionally absent — derive it from the key via
 * storageProvider.getPublicUrl(key) or mediaService.toDto().
 */
export type UploadIntent = {
  /** Storage key — store this in Media.storageKey */
  key: string;
  /** PUT target: R2 presigned URL or local API route */
  url: string;
  method: "PUT";
  /** Headers the client must include in the PUT request */
  headers: Record<string, string>;
  expiresAt: Date;
};

export interface StorageProvider {
  /**
   * Issue a short-lived upload intent. The client PUTs the file directly
   * to the returned URL — the app server never handles the file bytes.
   */
  getUploadIntent(key: string, opts: UploadOptions): Promise<UploadIntent>;

  /** Delete an object by its storage key. */
  deleteObject(key: string): Promise<void>;

  /**
   * Resolve a storage key to its public URL.
   * Pure computation — no network call.
   */
  getPublicUrl(key: string): string;
}

/** Allowed MIME types and max size per upload purpose. */
export const UPLOAD_LIMITS = {
  avatar: {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    types: ["image/jpeg", "image/png", "image/webp"] as string[],
  },
  eventMedia: {
    maxBytes: 20 * 1024 * 1024, // 20 MB
    types: ["image/jpeg", "image/png", "image/webp"] as string[],
  },
  objectMedia: {
    maxBytes: 20 * 1024 * 1024, // 20 MB
    types: ["image/jpeg", "image/png", "image/webp"] as string[],
  },
  // TODO: clarify minimum photo resolution requirements with Malaysian BASE community for banner printing.
  eventPhoto: {
    maxBytes: 8 * 1024 * 1024, // 8 MB — typical high-quality iPhone JPEG is 3–5 MB
    types: ["image/jpeg", "image/png", "image/webp"] as string[],
  },
} as const;

export type UploadPurpose = keyof typeof UPLOAD_LIMITS;
