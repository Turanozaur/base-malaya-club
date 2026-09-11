import { randomBytes } from "crypto";

import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPasswordSetupEmail } from "@/lib/email";

const TOKEN_PREFIX = "password-setup:";
const TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

function tokenIdentifier(userId: string): string {
  return `${TOKEN_PREFIX}${userId}`;
}

function setupUrl(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/set-password?token=${token}`;
}

export async function createPasswordSetupToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  const identifier = tokenIdentifier(userId);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function validatePasswordSetupToken(token: string): Promise<{
  userId: string;
  email: string;
  name: string | null;
} | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record?.identifier.startsWith(TOKEN_PREFIX)) return null;
  if (record.expires < new Date()) return null;

  const userId = record.identifier.slice(TOKEN_PREFIX.length);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, status: true },
  });

  if (!user || user.status !== UserStatus.APPROVED) return null;

  return { userId: user.id, email: user.email, name: user.name };
}

export async function completePasswordSetup(
  token: string,
  hashedPassword: string,
): Promise<{ email: string } | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record?.identifier.startsWith(TOKEN_PREFIX)) return null;
  if (record.expires < new Date()) return null;

  const userId = record.identifier.slice(TOKEN_PREFIX.length);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true },
  });

  if (!user || user.status !== UserStatus.APPROVED) return null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { hashedPassword, emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { email: user.email };
}

type InviteUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function issuePasswordSetupInvite(user: InviteUser): Promise<void> {
  const token = await createPasswordSetupToken(user.id);
  await sendPasswordSetupEmail(
    user.email,
    user.name ?? user.email,
    setupUrl(token),
  );
}
