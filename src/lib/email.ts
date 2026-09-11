import { Resend } from "resend";

import { SITE_CONTACT_EMAIL } from "@/lib/site-config";

// Lazily instantiated so import doesn't crash when RESEND_API_KEY is absent.
let _resend: Resend | null = null;

function resend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set in .env");
  return (_resend ??= new Resend(key));
}

function from(): string {
  return process.env.EMAIL_FROM ?? "BASE Malaya Club <noreply@basemalaya.club>";
}

function siteUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// ─── Templates ──────────────────────────────────────────────────────────────

export async function sendPasswordSetupEmail(
  to: string,
  name: string,
  setupUrl: string,
): Promise<void> {
  await resend().emails.send({
    from: from(),
    to,
    subject: "Welcome to BASE Malaya Club — set your password",
    html: `
      <p>Hi ${name},</p>
      <p>Great news — your membership application to <strong>BASE Malaya Club</strong> has been approved!</p>
      <p>Click the link below to choose a password and sign in. This link expires in <strong>72 hours</strong>.</p>
      <p><a href="${setupUrl}">Set your password</a></p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p>${setupUrl}</p>
      <p>Blue skies and safe exits,<br/>BASE Malaya Club</p>
    `,
  });
}

export async function sendEventRegistrationEmail(
  to: string,
  name: string,
  eventTitle: string,
  startDate: Date,
  eventSlug: string,
): Promise<void> {
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(startDate);

  await resend().emails.send({
    from: from(),
    to,
    subject: `You're registered for ${eventTitle}!`,
    html: `
      <p>Hi ${name},</p>
      <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p>View the event details:</p>
      <p><a href="${siteUrl()}/events/${eventSlug}">${siteUrl()}/events/${eventSlug}</a></p>
      <p>Blue skies,<br/>BASE Malaya Club</p>
    `,
  });
}

export async function sendNewRegistrationNotification(
  to: string,
  organizerName: string,
  participantName: string,
  eventTitle: string,
  eventSlug: string,
  totalRegistered: number,
): Promise<void> {
  await resend().emails.send({
    from: from(),
    to,
    subject: `New registration: ${eventTitle}`,
    html: `
      <p>Hi ${organizerName},</p>
      <p><strong>${participantName}</strong> has registered for <strong>${eventTitle}</strong>.</p>
      <p>Total registered: <strong>${totalRegistered}</strong></p>
      <p><a href="${siteUrl()}/admin/events/${eventSlug}/registrations">Manage registrations →</a></p>
      <p>BASE Malaya Club</p>
    `,
  });
}

export async function sendRejectionEmail(
  to: string,
  name: string,
  reason?: string,
): Promise<void> {
  await resend().emails.send({
    from: from(),
    to,
    subject: "BASE Malaya Club — membership application update",
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for applying to <strong>BASE Malaya Club</strong>.</p>
      <p>After review, we are unable to approve your application at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you have questions, email us at <a href="mailto:${SITE_CONTACT_EMAIL}">${SITE_CONTACT_EMAIL}</a>.</p>
      <p>BASE Malaya Club</p>
    `,
  });
}
