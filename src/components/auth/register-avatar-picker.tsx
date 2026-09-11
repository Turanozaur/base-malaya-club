"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type Props = {
  defaultStorageKey?: string;
  defaultName?: string;
};

export function RegisterAvatarPicker({
  defaultStorageKey = "",
  defaultName = "",
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState(defaultStorageKey);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
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

    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const email = emailInput?.value.trim().toLowerCase() ?? "";
    if (!email) {
      setError("Enter your email above before uploading a photo.");
      return;
    }

    setIsPending(true);
    try {
      const intentRes = await fetch("/api/register/avatar/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!intentRes.ok) {
        const data = await intentRes.json().catch(() => ({}));
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not start upload. Check your email and try again.",
        );
        return;
      }

      const intent = await intentRes.json();

      const uploadRes = await fetch(intent.url, {
        method: "PUT",
        headers: intent.headers,
        body: file,
      });

      if (!uploadRes.ok) {
        setError("Upload failed. Please try again.");
        return;
      }

      setStorageKey(intent.key);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsPending(false);
    }
  }

  function openFilePicker() {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    void handleFile(file).finally(() => {
      input.value = "";
    });
  }

  const displayName = defaultName || "?";

  return (
    <div className="flex flex-col items-center gap-3">
      <input type="hidden" name="avatarStorageKey" value={storageKey} />

      <button
        type="button"
        className="group relative size-24 overflow-hidden rounded-full border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={openFilePicker}
        disabled={isPending}
        aria-label="Upload profile photo"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile preview"
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {initials(displayName) || "?"}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-xs font-medium text-white">
            {isPending ? "Uploading…" : previewUrl ? "Change" : "Add photo"}
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

      <p className="text-center text-xs text-muted-foreground">
        Optional. JPEG, PNG or WebP, up to 5 MB.
      </p>

      {error ? (
        <p className="text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openFilePicker}
        disabled={isPending}
      >
        {isPending ? "Uploading…" : previewUrl ? "Change photo" : "Add photo"}
      </Button>
    </div>
  );
}
