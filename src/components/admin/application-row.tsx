"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RejectDialog } from "./reject-dialog";
import { approveUserAction, rejectUserAction } from "@/app/admin/applications/actions";

type Props = {
  userId: string;
  name: string;
  email: string;
  country: string | null;
  gender: string | null;
  participatedBasejumpInMalaysia: boolean | null;
  baseJumps: number;
  appliedAt: Date;
  voucherName: string | null;
  voucherNote: string | null;
  instagram: string | null;
};

export function ApplicationRow({
  userId,
  name,
  email,
  country,
  gender,
  participatedBasejumpInMalaysia,
  baseJumps,
  appliedAt,
  voucherName,
  voucherNote,
  instagram,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showInMembers, setShowInMembers] = useState(true);

  function handleApprove() {
    startTransition(async () => {
      const result = await approveUserAction(userId, showInMembers);
      if (result.error) alert(result.error);
    });
  }

  async function handleReject(reason: string) {
    const result = await rejectUserAction(userId, reason || undefined);
    if (result.error) alert(result.error);
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Applied {new Date(appliedAt).toLocaleDateString()}
        </p>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Country</dt>
          <dd>{country ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Gender</dt>
          <dd>
            {gender === "MALE"
              ? "Male"
              : gender === "FEMALE"
                ? "Female"
                : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">BASE jump in Malaysia</dt>
          <dd>
            {participatedBasejumpInMalaysia === true
              ? "Yes"
              : participatedBasejumpInMalaysia === false
                ? "No"
                : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">BASE jumps</dt>
          <dd>{baseJumps}</dd>
        </div>
        {instagram && (
          <div>
            <dt className="text-muted-foreground">Instagram</dt>
            <dd>
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {instagram}
              </a>
            </dd>
          </div>
        )}
        {(voucherName || voucherNote) && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-muted-foreground">Voucher</dt>
            <dd>{voucherName ?? voucherNote ?? "—"}</dd>
          </div>
        )}
      </dl>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showInMembers}
          onChange={(e) => setShowInMembers(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        Show in members directory
      </label>

      <div className="flex flex-wrap items-start gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleApprove}
          disabled={isPending}
        >
          {isPending ? "Approving…" : "Approve"}
        </Button>
        <RejectDialog onConfirm={handleReject} />
      </div>
    </div>
  );
}
