import type { Metadata } from "next";
import Link from "next/link";
import { requireSessionUser } from "@/lib/auth-session";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Change password" };

export default async function ChangePasswordPage() {
  await requireSessionUser();

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="mb-6">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="-ml-2"
          render={<Link href="/me" />}
        >
          ← Back to profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
