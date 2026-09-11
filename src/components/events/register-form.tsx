"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { registerForEventAction, type RegisterState } from "@/app/events/[slug]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
  hasAvatar: boolean;
};

export function RegisterForm({ eventId, hasAvatar }: Props) {
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, dispatch, isPending] = useActionState<RegisterState, FormData>(
    registerForEventAction,
    {},
  );

  const photoRequired = !hasAvatar && !photoKey;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    startUpload(async () => {
      const intentRes = await fetch("/api/event-photo/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, sizeBytes: file.size, eventId }),
      });

      if (!intentRes.ok) {
        const data = await intentRes.json().catch(() => ({}));
        setUploadError(data.error ?? "Upload failed");
        return;
      }

      const intent = await intentRes.json();

      const uploadRes = await fetch(intent.url, {
        method: "PUT",
        headers: intent.headers,
        body: file,
      });

      if (!uploadRes.ok) {
        setUploadError("Upload failed. Please try again.");
        return;
      }

      setPhotoKey(intent.key);
    });
  }

  if (state.success) {
    return (
      <div className="rounded-lg border bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
        ✓ You are registered! Check your email for confirmation.
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      {photoKey && <input type="hidden" name="eventPhotoKey" value={photoKey} />}

      {/* Event photo upload — required only when user has no avatar */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          Wall of fame photo{" "}
          {photoRequired ? (
            <span className="text-destructive">* (required — you have no avatar)</span>
          ) : (
            <span className="font-normal text-muted-foreground">(optional, replaces your avatar on the wall)</span>
          )}
        </label>

        {photoKey ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-700 dark:text-green-400">✓ Photo uploaded</span>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => { setPhotoKey(null); if (fileRef.current) fileRef.current.value = ""; }}
            >
              Change
            </button>
          </div>
        ) : (
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={isUploading}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-accent"
          />
        )}

        {isUploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
        {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending || isUploading || photoRequired}
        className="w-full"
      >
        {isPending ? "Registering…" : "Register for this event"}
      </Button>

      {photoRequired && (
        <p className="text-center text-xs text-muted-foreground">
          Upload a photo above to enable registration
        </p>
      )}
    </form>
  );
}
