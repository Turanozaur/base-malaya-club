import type { Metadata } from "next";
import Link from "next/link";

import { PrivacyNoticeContent } from "@/components/privacy/privacy-notice-content";

export const metadata: Metadata = {
  title: "Privacy & personal data",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Privacy notice</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-GB")}
      </p>

      <PrivacyNoticeContent />

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href="/register" className="text-primary hover:underline">
          ← Back to application
        </Link>
      </p>
    </div>
  );
}
