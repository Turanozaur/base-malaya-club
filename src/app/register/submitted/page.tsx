import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Application submitted" };

export default function RegisterSubmittedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Application submitted
      </h1>
      <p className="mt-4 text-muted-foreground">
        Thank you! An administrator will review your application. If approved,
        we will email you a link to set your password and sign in.
      </p>
      <div className="mt-8">
        <Button nativeButton={false} render={<Link href="/" />}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
