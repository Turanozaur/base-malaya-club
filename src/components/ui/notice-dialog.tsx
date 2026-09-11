"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NoticeDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function NoticeDialog({
  triggerLabel,
  title,
  description,
  children,
  className,
}: NoticeDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        type="button"
        className={cn(
          "inline text-primary underline underline-offset-4 hover:text-primary/80",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {triggerLabel}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[60] flex max-h-[min(85vh,720px)] w-[min(calc(100vw-2rem),42rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border bg-background shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                />
              }
            >
              <X />
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto px-5 py-4">{children}</div>

          <div className="border-t px-5 py-4">
            <Dialog.Close render={<Button type="button" className="w-full sm:w-auto" />}>
              Close
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
