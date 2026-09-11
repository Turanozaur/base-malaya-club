import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Join the club" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/me");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <span className="mb-3 inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground">
        Membership application
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">Join the club</h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        The club is private — applications are approved by administrators. No
        password needed now; if approved, we email you a link to set one.
      </p>
      <RegisterForm />
    </div>
  );
}
