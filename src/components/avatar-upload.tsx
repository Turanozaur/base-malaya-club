"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type Props = {
  currentUrl: string | null;
  name: string;
};

export function AvatarUpload({ currentUrl, name }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function initials(n: string) {
    return n
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  async function handleFile(file: File) {
    setError(null);

    // 1. Request an upload intent from the server.
    const intentRes = await fetch("/api/avatar/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
    });

    if (!intentRes.ok) {
      const data = await intentRes.json().catch(() => ({}));
      setError(data.error ?? "Could not start upload");
      return;
    }

    const intent = await intentRes.json();

    // 2. PUT the file directly to storage (R2 presigned URL or local route).
    const uploadRes = await fetch(intent.url, {
      method: "PUT",
      headers: intent.headers,
      body: file,
    });

    if (!uploadRes.ok) {
      setError("Upload failed. Please try again.");
      return;
    }

    // 3. Show optimistic preview.
    setPreviewUrl(URL.createObjectURL(file));

    // 4. Confirm: update User.image in the database.
    const confirmRes = await fetch("/api/avatar/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageKey: intent.key }),
    });

    if (!confirmRes.ok) {
      setError("Upload saved but profile not updated. Please refresh.");
      return;
    }

    const { url } = await confirmRes.json();
    setPreviewUrl(url);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(() => handleFile(file));
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className="group relative size-24 overflow-hidden rounded-full border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="Change avatar"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {initials(name)}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-xs font-medium text-white">
            {isPending ? "Uploading…" : "Change"}
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={onChange}
        disabled={isPending}
      />

      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? "Uploading…" : "Change photo"}
      </Button>
    </div>
  );
}
