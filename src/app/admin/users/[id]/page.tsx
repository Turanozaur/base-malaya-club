import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { formatMonthYear } from "@/lib/experience";
import { Permission, UserStatus, Role } from "@/generated/prisma/client";
import { PermissionToggle } from "@/components/admin/permission-toggle";
import { StatusActions } from "@/components/admin/status-actions";
import { MembersDirectoryToggle } from "@/components/admin/members-directory-toggle";
import { ResendLoginLinkButton } from "@/components/admin/resend-login-link-button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
  return { title: user ? `${user.name ?? user.email} — Admin` : "User — Admin" };
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { permissions: true, voucher: { select: { name: true } } },
  });

  if (!user) notFound();

  const grantedPermissions = new Set(user.permissions.map((p) => p.permission));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/users" className="hover:text-foreground hover:underline">
          Users
        </Link>
        <span>/</span>
        <span className="text-foreground">{user.name ?? user.email}</span>
      </div>

      {/* Profile card */}
      <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ""}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
            {(user.name ?? user.email)[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="text-lg font-semibold">{user.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.country && (
            <p className="text-sm text-muted-foreground">{user.country}</p>
          )}
        </div>
      </div>

      {/* Profile details */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">BASE jumps</dt>
          <dd className="font-medium">{user.baseJumpCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">BASE jump in Malaysia</dt>
          <dd className="font-medium">
            {user.participatedBasejumpInMalaysia === true
              ? "Yes"
              : user.participatedBasejumpInMalaysia === false
                ? "No"
                : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Skydive jumps</dt>
          <dd className="font-medium">{user.skydiveJumpCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">BASE since</dt>
          <dd className="font-medium">
            {user.baseSince ? formatMonthYear(user.baseSince) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Applied</dt>
          <dd className="font-medium">{user.appliedAt.toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium">{user.role === Role.ADMIN ? "Admin" : "Member"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Voucher</dt>
          <dd className="font-medium">{user.voucher?.name ?? user.voucherNote ?? "—"}</dd>
        </div>
        {user.instagram && (
          <div>
            <dt className="text-muted-foreground">Instagram</dt>
            <dd>
              <a
                href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {user.instagram}
              </a>
            </dd>
          </div>
        )}
        {user.bio && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-muted-foreground">Bio</dt>
            <dd className="whitespace-pre-wrap">{user.bio}</dd>
          </div>
        )}
      </dl>

      {/* Status actions */}
      <section>
        <h2 className="mb-3 text-base font-semibold">Status</h2>
        <StatusActions userId={user.id} currentStatus={user.status} />
      </section>

      {user.role !== Role.ADMIN && user.status === UserStatus.APPROVED && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Account access</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4 text-sm">
            <span className="text-muted-foreground">
              Password:{" "}
              <span className="font-medium text-foreground">
                {user.hashedPassword ? "Set" : "Not set yet"}
              </span>
            </span>
            {!user.hashedPassword && <ResendLoginLinkButton userId={user.id} />}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">Public profile</h2>
        <MembersDirectoryToggle
          userId={user.id}
          showInMembersDirectory={user.showInMembersDirectory}
        />
      </section>

      {/* Permissions — only for non-admin members */}
      {user.role !== Role.ADMIN && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Permissions</h2>
          <div className="space-y-2">
            {Object.values(Permission).map((perm) => (
              <PermissionToggle
                key={perm}
                userId={user.id}
                permission={perm}
                granted={grantedPermissions.has(perm)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
