import { type StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";
import { R2StorageProvider } from "./r2";

export { type StorageProvider, type UploadIntent, type UploadOptions, type UploadPurpose, UPLOAD_LIMITS } from "./types";
export {
  avatarKey,
  eventMediaKey,
  objectMediaKey,
  eventPhotoKey,
  pendingAvatarKey,
  isPendingAvatarKeyForEmail,
} from "./keys";

let _provider: StorageProvider | null = null;

/**
 * Returns the appropriate storage provider based on the environment.
 * - Production: always R2.
 * - Development with R2 env vars: R2 (useful for testing against real storage).
 * - Development without R2 env vars: LocalStorageProvider (files in public/uploads/).
 */
export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider;

  const useR2 =
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.R2_ACCOUNT_ID);

  _provider = useR2 ? new R2StorageProvider() : new LocalStorageProvider();
  return _provider;
}
