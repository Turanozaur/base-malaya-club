import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth-session";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { validatePasswordSetupToken } from "@/lib/password-setup";
import { SITE_CONTACT_EMAIL } from "@/lib/site-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Set your password" };

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function SetPasswordPage({ searchParams }: Props) {
  await redirectIfAuthenticated();

  const { token } = await searchParams;
  const valid = token ? await validatePasswordSetupToken(token) : null;

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>Set your password</CardTitle>
          {valid ? (
            <CardDescription>
              Welcome{valid.name ? `, ${valid.name}` : ""}! Choose a password for{" "}
              {valid.email}.
            </CardDescription>
          ) : (
            <CardDescription>This link is invalid or has expired.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {valid && token ? (
            <SetPasswordForm token={token} />
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Ask an administrator to resend your login link, or email us at{" "}
                <a
                  href={`mailto:${SITE_CONTACT_EMAIL}`}
                  className="text-foreground underline"
                >
                  {SITE_CONTACT_EMAIL}
                </a>
                .
              </p>
              <Button nativeButton={false} variant="outline" render={<Link href="/login" />}>
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
