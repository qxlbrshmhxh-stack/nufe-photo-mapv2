"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminUserDetail as AdminUserDetailType, UserRole, UserStatus } from "@/lib/types";
import { formatDateTimeLabel } from "@/lib/utils";

export function AdminUserDetail({
  detail,
  canManageRoles
}: {
  detail: AdminUserDetailType;
  canManageRoles: boolean;
}) {
  const initialRestrictedUntil = detail.profile.restricted_until
    ? new Date(detail.profile.restricted_until).toISOString().slice(0, 16)
    : "";
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(detail.profile.role);
  const [status, setStatus] = useState<UserStatus>(detail.profile.status);
  const [restrictedUntil, setRestrictedUntil] = useState(initialRestrictedUntil);
  const [moderationNote, setModerationNote] = useState(detail.profile.moderation_note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${detail.profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role,
          status,
          restrictedUntil: restrictedUntil || null,
          moderationNote
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update user.");
      }

      setMessage("User governance saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-4xl font-semibold">{detail.profile.nickname}</h2>
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink">{detail.profile.role}</span>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{detail.profile.status}</span>
            </div>
            <p className="text-sm text-ink/62">{detail.profile.email || "No email available"}</p>
            <p className="text-sm text-ink/62">Joined {formatDateTimeLabel(detail.profile.created_at)}</p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save user settings"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Role
            <select
              value={role}
              disabled={!canManageRoles}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none disabled:opacity-60"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Account status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            >
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="banned">Banned</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Restricted until
            <input
              type="datetime-local"
              value={restrictedUntil}
              onChange={(event) => setRestrictedUntil(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink md:col-span-2">
            Internal moderation note
            <textarea
              value={moderationNote}
              onChange={(event) => setModerationNote(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            />
          </label>
        </div>

        {message ? <p className="mt-4 text-sm text-moss">{message}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <h3 className="font-display text-2xl font-semibold">Uploads</h3>
          <div className="mt-4 grid gap-3">
            {detail.uploads.length ? (
              detail.uploads.map((photo) => (
                <div key={photo.id} className="rounded-2xl bg-mist px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{photo.title}</p>
                    <StatusBadge status={photo.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink/62">{photo.photographer_name}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/20 bg-white/70 p-4 text-sm text-ink/60">
                This user has not uploaded any photos yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <h3 className="font-display text-2xl font-semibold">Reports submitted</h3>
          <div className="mt-4 grid gap-3">
            {detail.reports.length ? (
              detail.reports.map((report) => (
                <div key={report.id} className="rounded-2xl bg-mist px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold capitalize text-ink">{report.reason}</p>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink/62">{report.target_type} target</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/20 bg-white/70 p-4 text-sm text-ink/60">
                This user has not submitted any reports yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
