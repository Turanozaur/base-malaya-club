import { signOut } from "@/auth";

function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/login";
  }
  return value;
}

export async function GET(request: Request) {
  const redirectTo = safeRedirectPath(
    new URL(request.url).searchParams.get("redirect"),
  );

  await signOut({ redirectTo });
}
