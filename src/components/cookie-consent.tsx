"use client";

import * as React from "react";

import { CookieNoticeDialog } from "@/components/cookie/cookie-notice-dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "cookie-consent-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "accepted";
}

function getServerSnapshot() {
  return true;
}

export function CookieConsent() {
  const accepted = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (accepted) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur-md sm:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p id="cookie-consent-title" className="font-medium text-foreground">
            Cookies
          </p>
          <p className="mt-1">
            We use essential cookies for sign-in and site preferences. See our{" "}
            <CookieNoticeDialog triggerLabel="cookie notice" /> for details.
          </p>
        </div>
        <Button type="button" onClick={accept} className="shrink-0">
          Accept
        </Button>
      </div>
    </div>
  );
}
