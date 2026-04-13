"use client";

import Link from "next/link";
import { AdminUserListItem, UserRole, UserStatus } from "@/lib/types";
import { formatDateTimeLabel } from "@/lib/utils";

const roleStyles: Record<UserRole, string> = {
  user: "bg-mist text-ink",
  moderator: "bg-sky-50 text-sky-700",
  admin: "bg-coral/10 text-coral"
};

const statusStyles: Record<UserStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  restricted: "bg-amber-50 text-amber-700",
  banned: "bg-rose-50 text-rose-700"
};

export function AdminUserList({ items }: { items: AdminUserListItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No users match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article key={item.id} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-semibold">{item.nickname}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[item.role]}`}>
                  {item.role}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-ink/62">{item.email || "No email available"}</p>
              <p className="text-sm text-ink/62">
                Joined {formatDateTimeLabel(item.createdAt)} / uploads {item.uploadCount} / reports {item.reportCount}
              </p>
              {item.restrictedUntil ? (
                <p className="text-sm text-ink/62">Restricted until {formatDateTimeLabel(item.restrictedUntil)}</p>
              ) : null}
              {item.moderationNote ? (
                <div className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-ink/72">{item.moderationNote}</div>
              ) : null}
            </div>
            <Link
              href={`/admin/users/${item.id}`}
              className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Open user detail
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
