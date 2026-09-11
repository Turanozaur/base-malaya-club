import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth-session";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>For approved club members only.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Not a member yet?{" "}
            <Link href="/register" className="underline">
              Apply to join
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
