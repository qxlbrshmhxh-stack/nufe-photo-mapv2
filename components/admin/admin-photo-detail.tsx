"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminActionHistory } from "@/components/admin/admin-action-history";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentStatus, ModerationAction, Photo } from "@/lib/types";
import { formatDateTimeLabel } from "@/lib/utils";

const moderationStatuses: ContentStatus[] = ["pending", "published", "hidden", "rejected"];

export function AdminPhotoDetail({
  photo,
  spotName,
  spotSlug,
  spotStatus,
  actions,
  reportCount,
  openReportCount,
  uploaderName,
  reviewerName
}: {
  photo: Photo;
  spotName: string;
  spotSlug: string;
  spotStatus: string;
  actions: ModerationAction[];
  reportCount: number;
  openReportCount: number;
  uploaderName: string;
  reviewerName: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ContentStatus>(photo.status);
  const [title, setTitle] = useState(photo.title);
  const [caption, setCaption] = useState(photo.caption);
  const [moderationNote, setModerationNote] = useState(photo.moderation_note ?? "");
  const [rejectionReason, setRejectionReason] = useState(photo.rejection_reason ?? "");
  const [hideReason, setHideReason] = useState(photo.hide_reason ?? "");
  const [isFeatured, setIsFeatured] = useState(Boolean(photo.is_featured));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(nextStatus: ContentStatus) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/photos/${photo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus,
          title,
          caption,
          moderationNote,
          rejectionReason: rejectionReason || null,
          hideReason: hideReason || null,
          isFeatured
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update photo.");
      }

      setStatus(nextStatus);
      setMessage("Photo saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update photo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-[28px] border border-ink/10 bg-white">
            <div className="h-[420px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${photo.image_url})` }} />
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-4xl font-semibold">{photo.title}</h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm leading-6 text-ink/68">
              Uploaded by {uploaderName} / {formatDateTimeLabel(photo.created_at)} / Last reviewed {photo.reviewed_at ? formatDateTimeLabel(photo.reviewed_at) : "not yet"}
              {reviewerName ? ` by ${reviewerName}` : ""}
            </p>
            <div className="grid gap-4 rounded-[24px] bg-mist p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Linked spot</p>
                <p className="mt-2 text-sm text-ink">
                  {spotName} ({spotStatus})
                </p>
                {spotSlug ? (
                  <Link href={`/admin/spots?query=${encodeURIComponent(spotName)}`} className="mt-2 inline-flex text-sm font-semibold text-coral">
                    Open spots admin
                  </Link>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Reports</p>
                <p className="mt-2 text-sm text-ink">{reportCount} total / {openReportCount} open</p>
              </div>
            </div>

            <label className="block space-y-2 text-sm font-medium text-ink">
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              Caption
              <textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={4} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              Internal moderation note
              <textarea value={moderationNote} onChange={(event) => setModerationNote(event.target.value)} rows={3} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              Hide reason
              <input value={hideReason} onChange={(event) => setHideReason(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              Rejection reason
              <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-medium text-ink">
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
              Feature this photo on the homepage
            </label>

            <div className="flex flex-wrap gap-2">
              <Link href={spotSlug ? `/spots/${spotSlug}` : "/"} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-coral">
                Open public spot
              </Link>
              {moderationStatuses.map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(nextStatus)}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                >
                  {nextStatus}
                </button>
              ))}
            </div>
            {message ? <p className="text-sm text-moss">{message}</p> : null}
          </div>
        </div>
      </section>

      <AdminActionHistory actions={actions} />
    </div>
  );
}
