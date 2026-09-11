"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";

type UploadedItem = {
  id: string;
  url: string;
  caption: string | null;
};

type Props = {
  eventId: string;
};

export function EventMediaUpload({ eventId }: Props) {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const intentRes = await fetch("/api/media/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: "eventMedia",
        contentType: file.type,
        sizeBytes: file.size,
        eventId,
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
        eventId,
      }),
    });

    if (!confirmRes.ok) {
      const data = await confirmRes.json().catch(() => ({}));
      throw new Error(typeof data.error === "string" ? data.error : "Failed to save photo");
    }

    const media = await confirmRes.json();
    setItems((prev) => [{ id: media.id, url: media.url, caption: media.caption }, ...prev]);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);

    startUpload(async () => {
      try {
        for (const file of Array.from(files)) {
          await uploadFile(file);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="mb-1 text-xl font-semibold">Upload event photos</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Photos will appear in the gallery and on this event page.
      </p>

      <div className="mb-4 space-y-3">
        <div>
          <label htmlFor="event-caption" className="mb-1 block text-sm font-medium">
            Caption (optional, applies to next upload)
          </label>
          <input
            id="event-caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            placeholder="e.g. Exit from the north side"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          onChange={handleFiles}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-xs file:font-medium"
        />
      </div>

      {isUploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={item.url} alt={item.caption ?? "Uploaded photo"} fill className="object-cover" sizes="120px" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
