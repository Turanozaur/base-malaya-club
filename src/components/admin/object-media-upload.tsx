"use client";

import { useRef, useState, useTransition } from "react";

type Props = {
  objectId: string;
};

export function ObjectMediaUpload({ objectId }: Props) {
  const [showInGallery, setShowInGallery] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(false);

    startUpload(async () => {
      try {
        const intentRes = await fetch("/api/media/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose: "objectMedia",
            contentType: file.type,
            sizeBytes: file.size,
            objectId,
          }),
        });

        if (!intentRes.ok) {
          const data = await intentRes.json().catch(() => ({}));
          throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
        }

        const intent = await intentRes.json();

        const uploadRes = await fetch(intent.url, {
          method: "PUT",
          headers: intent.headers,
          body: file,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

        const confirmRes = await fetch("/api/media/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storageKey: intent.key,
            mimeType: file.type,
            sizeBytes: file.size,
            caption: caption.trim() || undefined,
            objectId,
            showInGallery,
          }),
        });

        if (!confirmRes.ok) {
          const data = await confirmRes.json().catch(() => ({}));
          throw new Error(typeof data.error === "string" ? data.error : "Failed to save photo");
        }

        setSuccess(true);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold">Object photos</h2>
        <p className="text-sm text-muted-foreground">
          Upload photos for this object page. Check &quot;Publish in gallery&quot; for informal jump photos.
        </p>
      </div>

      <div>
        <label htmlFor="object-caption" className="mb-1 block text-sm font-medium">
          Caption (optional)
        </label>
        <input
          id="object-caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showInGallery}
          onChange={(e) => setShowInGallery(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        Publish in gallery (jump photos only)
      </label>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={isUploading}
        onChange={handleFiles}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-xs file:font-medium"
      />

      {isUploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Photo uploaded. Refresh the object page to see it.
        </p>
      )}
    </div>
  );
}
