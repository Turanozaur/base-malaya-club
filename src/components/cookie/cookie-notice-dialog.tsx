"use client";

import { CookieNoticeContent } from "@/components/cookie/cookie-notice-content";
import { NoticeDialog } from "@/components/ui/notice-dialog";

type CookieNoticeDialogProps = {
  triggerLabel?: string;
  className?: string;
};

export function CookieNoticeDialog({
  triggerLabel = "cookie notice",
  className,
}: CookieNoticeDialogProps) {
  return (
    <NoticeDialog
      triggerLabel={triggerLabel}
      title="Cookie notice"
      description="How BASE Malaya Club uses cookies and local storage"
      className={className}
    >
      <CookieNoticeContent />
    </NoticeDialog>
  );
}
