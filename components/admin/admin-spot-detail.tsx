"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminActionHistory } from "@/components/admin/admin-action-history";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentStatus, DuplicateCandidate, ModerationAction, Photo, Spot, SpotLifecycleStatus } from "@/lib/types";
import { formatCoordinatePair, formatDateTimeLabel } from "@/lib/utils";

const moderationStatuses: ContentStatus[] = ["pending", "published", "hidden", "rejected"];

export function AdminSpotDetail({
  spot,
  photos,
  duplicateCandidates,
  actions,
  reportCount,
  openReportCount,
  creatorName,
  reviewerName
}: {
  spot: Spot;
  photos: Photo[];
  duplicateCandidates: DuplicateCandidate[];
  actions: ModerationAction[];
  reportCount: number;
  openReportCount: number;
  creatorName: string;
  reviewerName: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SpotLifecycleStatus>(spot.status);
  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description);
  const [campusArea, setCampusArea] = useState(spot.campusArea);
  const [bestTime, setBestTime] = useState(spot.bestTime);
  const [latitude, setLatitude] = useState(String(spot.latitude));
  const [longitude, setLongitude] = useState(String(spot.longitude));
  const [duplicateOf, setDuplicateOf] = useState(spot.duplicateOf ?? "");
  const [canonicalSpotId, setCanonicalSpotId] = useState(spot.canonicalSpotId ?? "");
  const [moderationNote, setModerationNote] = useState(spot.moderationNote ?? "");
  const [rejectionReason, setRejectionReason] = useState(spot.rejectionReason ?? "");
  const [hideReason, setHideReason] = useState(spot.hideReason ?? "");
  const [isFeatured, setIsFeatured] = useState(Boolean(spot.isFeatured));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(nextStatus: ContentStatus) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/spots/${spot.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus,
          name,
          description,
          campusArea,
          bestTime,
          latitude: Number(latitude),
          longitude: Number(longitude),
          duplicateOf: duplicateOf || null,
          canonicalSpotId: canonicalSpotId || null,
          isDuplicate: Boolean(duplicateOf),
          moderationNote,
          rejectionReason: rejectionReason || null,
          hideReason: hideReason || null,
          isFeatured
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update spot.");
      }

      setStatus(nextStatus);
      setMessage("Spot saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update spot.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-4xl font-semibold">{spot.name}</h2>
              <StatusBadge status={status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              Created by {creatorName} / {spot.createdAt ? formatDateTimeLabel(spot.createdAt) : "Unknown"} / Last reviewed {spot.reviewedAt ? formatDateTimeLabel(spot.reviewedAt) : "not yet"}
              {reviewerName ? ` by ${reviewerName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/spots/${spot.slug}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-coral">
              Open public page
            </Link>
            <Link href={`/admin/spots/merge?source=${spot.id}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
              Open merge tool
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
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Campus area
            <input value={campusArea} onChange={(event) => setCampusArea(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink md:col-span-2">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Best time
            <input value={bestTime} onChange={(event) => setBestTime(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Latitude
            <input value={latitude} onChange={(event) => setLatitude(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Longitude
            <input value={longitude} onChange={(event) => setLongitude(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Mark duplicate of
            <select value={duplicateOf} onChange={(event) => setDuplicateOf(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
              <option value="">Not marked as duplicate</option>
              {duplicateCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Canonical spot
            <select value={canonicalSpotId} onChange={(event) => setCanonicalSpotId(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
              <option value="">Use this spot as canonical</option>
              {duplicateCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink md:col-span-2">
            Internal moderation note
            <textarea value={moderationNote} onChange={(event) => setModerationNote(event.target.value)} rows={3} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Hide reason
            <input value={hideReason} onChange={(event) => setHideReason(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Rejection reason
            <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-medium text-ink">
            <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
            Feature this spot on the homepage
          </label>
        </div>

        <div className="mt-5 grid gap-4 rounded-[24px] bg-mist p-5 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Coordinates</p>
            <p className="mt-2 text-sm text-ink">{formatCoordinatePair(spot.latitude, spot.longitude)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Photos</p>
            <p className="mt-2 text-sm text-ink">{photos.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Reports</p>
            <p className="mt-2 text-sm text-ink">{reportCount} total / {openReportCount} open</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Duplicate state</p>
            <p className="mt-2 text-sm text-ink">{spot.isDuplicate ? "Marked duplicate" : "Primary or unreviewed"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Merge relationship</p>
            <p className="mt-2 text-sm text-ink">{spot.mergedIntoSpotId ? `Merged into ${spot.mergedIntoSpotId}` : "No merge target"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Featured</p>
            <p className="mt-2 text-sm text-ink">{isFeatured ? "Homepage featured" : "Standard published spot"}</p>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-moss">{message}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <h3 className="font-display text-2xl font-semibold">Linked photos</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => (
              <Link key={photo.id} href={`/admin/photos/${photo.id}`} className="overflow-hidden rounded-[24px] border border-ink/10 bg-white">
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${photo.image_url})` }} />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-ink">{photo.title}</h4>
                    <StatusBadge status={photo.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/66">{photo.caption}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <h3 className="font-display text-2xl font-semibold">Possible duplicates</h3>
          <div className="mt-4 grid gap-3">
            {duplicateCandidates.length ? (
              duplicateCandidates.map((candidate) => (
                <Link key={candidate.id} href={`/admin/spots/${candidate.id}`} className="rounded-2xl bg-mist px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{candidate.name}</p>
                    <StatusBadge status={candidate.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink/62">distance score: {candidate.distanceScore}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/20 bg-white/70 p-4 text-sm text-ink/60">
                No obvious duplicates were found for this spot.
              </div>
            )}
          </div>
        </div>
      </section>

      <AdminActionHistory actions={actions} />
    </div>
  );
}
