"use client";

import { PrivacyNoticeContent } from "@/components/privacy/privacy-notice-content";
import { NoticeDialog } from "@/components/ui/notice-dialog";

type PrivacyNoticeDialogProps = {
  triggerLabel?: string;
  className?: string;
};

export function PrivacyNoticeDialog({
  triggerLabel = "processing of my personal data",
  className,
}: PrivacyNoticeDialogProps) {
  return (
    <NoticeDialog
      triggerLabel={triggerLabel}
      title="Privacy notice"
      description="Personal data processing for BASE Malaya Club membership"
      className={className}
    >
      <PrivacyNoticeContent />
    </NoticeDialog>
  );
}
