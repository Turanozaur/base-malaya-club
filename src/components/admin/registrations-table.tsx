"use client";

import { useTransition } from "react";
import {
  setPaymentStatusAction,
  adminCancelRegistrationAction,
  markAttendedAction,
  publishWallOfFameAction,
  unpublishWallOfFameAction,
} from "@/app/admin/events/[id]/registrations/actions";
import { RegistrationStatus, PaymentStatus } from "@/lib/constants/event";
import { sortByUserName } from "@/lib/user-sort";

type Reg = {
  id: string;
  status: string;
  paymentStatus: string | null;
  registeredAt: Date;
  user: { id: string; name: string | null; country: string | null; email: string };
  hasEventPhoto: boolean;
};

type Props = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  wallOfFamePublic: boolean;
  registrations: Reg[];
};

function ActionButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "green";
}) {
  const cls =
    variant === "danger"
      ? "text-destructive hover:underline"
      : variant === "green"
        ? "text-green-700 dark:text-green-400 hover:underline"
        : "text-primary hover:underline";
  return (
    <button type="button" onClick={onClick} className={`text-xs font-medium ${cls}`}>
      {label}
    </button>
  );
}

function PaymentToggle({ regId, paid }: { regId: string; paid: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => { await setPaymentStatusAction(regId, !paid); })}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
        paid
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      } hover:opacity-80 disabled:opacity-50`}
    >
      {paid ? "Paid ✓" : "Pending"}
    </button>
  );
}

const STATUS_BADGE: Record<string, string> = {
  REGISTERED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  WAITLISTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  ATTENDED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export function RegistrationsTable({
  eventId,
  eventSlug,
  eventTitle,
  wallOfFamePublic,
  registrations,
}: Props) {
  const [isFamePending, startFameTransition] = useTransition();

  const active = sortByUserName(
    registrations.filter(
      (r) =>
        r.status === RegistrationStatus.REGISTERED ||
        r.status === RegistrationStatus.ATTENDED,
    ),
    (r) => r.user,
  );
  const waitlisted = sortByUserName(
    registrations.filter((r) => r.status === RegistrationStatus.WAITLISTED),
    (r) => r.user,
  );
  const cancelled = sortByUserName(
    registrations.filter((r) => r.status === RegistrationStatus.CANCELLED),
    (r) => r.user,
  );

  function handleWallToggle() {
    if (wallOfFamePublic) {
      if (!confirm("Unpublish the wall of fame for this event?")) return;
      startFameTransition(async () => { await unpublishWallOfFameAction(eventId); });
    } else {
      if (!confirm(`Take a profile snapshot and publish the wall of fame for "${eventTitle}"? This will capture participants' current stats.`)) return;
      startFameTransition(async () => { await publishWallOfFameAction(eventId); });
    }
  }

  function renderRows(regs: Reg[]) {
    return regs.map((reg) => {
      const canCancel = reg.status !== RegistrationStatus.CANCELLED;
      const canAttend = reg.status === RegistrationStatus.REGISTERED;

      return (
        <tr key={reg.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3">
            <p className="font-medium">{reg.user.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{reg.user.email}</p>
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">{reg.user.country ?? "—"}</td>
          <td className="px-4 py-3">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[reg.status] ?? ""}`}>
              {reg.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <PaymentToggle regId={reg.id} paid={reg.paymentStatus === PaymentStatus.PAID} />
          </td>
          <td className="px-4 py-3 text-xs text-muted-foreground">
            {reg.hasEventPhoto ? (
              <span className="text-green-700 dark:text-green-400">✓ photo</span>
            ) : (
              <span className="text-muted-foreground">avatar only</span>
            )}
          </td>
          <td className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{reg.registeredAt.toLocaleDateString()}</p>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              {canAttend && (
                <MarkAttendedButton regId={reg.id} />
              )}
              {canCancel && (
                <CancelButton regId={reg.id} eventSlug={eventSlug} eventTitle={eventTitle} />
              )}
            </div>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="space-y-8">
      {/* Wall of fame */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Wall of Fame</p>
          <p className="text-sm text-muted-foreground">
            {wallOfFamePublic
              ? "Published — visible to everyone. You can re-publish to refresh snapshots."
              : "Not published yet. Publishing captures a snapshot of all participants' profiles."}
          </p>
        </div>
        <button
          type="button"
          disabled={isFamePending}
          onClick={handleWallToggle}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            wallOfFamePublic
              ? "border bg-background hover:bg-accent"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isFamePending
            ? "Saving…"
            : wallOfFamePublic
              ? "Unpublish"
              : "Publish Wall of Fame"}
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-6 text-sm">
        <div><span className="font-medium">{active.length}</span> registered</div>
        <div><span className="font-medium">{waitlisted.length}</span> waitlisted</div>
        <div><span className="font-medium">{cancelled.length}</span> cancelled</div>
        <div>
          <span className="font-medium">
            {[...new Set(active.map((r) => r.user.country).filter(Boolean))].length}
          </span>{" "}
          countries
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No registrations yet</td></tr>
            )}
            {renderRows([...active, ...waitlisted, ...cancelled])}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarkAttendedButton({ regId }: { regId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <ActionButton
      label={isPending ? "…" : "Mark attended"}
      variant="green"
      onClick={() => startTransition(async () => { await markAttendedAction(regId); })}
    />
  );
}

function CancelButton({ regId, eventSlug, eventTitle }: { regId: string; eventSlug: string; eventTitle: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <ActionButton
      label={isPending ? "…" : "Cancel"}
      variant="danger"
      onClick={() => {
        if (!confirm(`Remove this participant from "${eventTitle}"?`)) return;
        startTransition(async () => { await adminCancelRegistrationAction(regId, eventSlug); });
      }}
    />
  );
}
