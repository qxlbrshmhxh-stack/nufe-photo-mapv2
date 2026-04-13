"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentStatus, DuplicateCandidate, Spot } from "@/lib/types";
import { formatCoordinatePair } from "@/lib/utils";

type AdminSpotListItem = Spot & {
  duplicateCandidates?: DuplicateCandidate[];
};

const batchStatuses: ContentStatus[] = ["published", "hidden", "rejected"];

export function AdminSpotList({
  spots,
  statusCounts
}: {
  spots: AdminSpotListItem[];
  statusCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const allSelected = useMemo(
    () => spots.length > 0 && selectedIds.length === spots.length,
    [selectedIds.length, spots.length]
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : spots.map((spot) => spot.id));
  }

  async function runBatch(status: ContentStatus) {
    if (!selectedIds.length) {
      setMessage("Select at least one spot first.");
      return;
    }

    const confirmed = window.confirm(`Apply ${status} to ${selectedIds.length} selected spots?`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/spots/batch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: selectedIds,
          status
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to batch update spots.");
      }

      setMessage(`Updated ${selectedIds.length} spots.`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to batch update spots.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!spots.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No spots match the current admin filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              ["pending", statusCounts.pending ?? 0],
              ["published", statusCounts.published ?? 0],
              ["hidden", statusCounts.hidden ?? 0],
              ["rejected", statusCounts.rejected ?? 0],
              ["merged", statusCounts.merged ?? 0]
            ].map(([label, count]) => (
              <div key={label} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-ink">
                {label}: {count}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              {allSelected ? "Clear selection" : "Select all on page"}
            </button>
            {batchStatuses.map((status) => (
              <button
                key={status}
                type="button"
                disabled={isSubmitting}
                onClick={() => runBatch(status)}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Batch {status}
              </button>
            ))}
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}
      </section>

      <div className="grid gap-4">
        {spots.map((spot) => (
          <article key={spot.id} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(spot.id)}
                  onChange={() => toggleSelection(spot.id)}
                  className="mt-1 h-5 w-5 rounded border border-ink/20"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-2xl font-semibold">{spot.name}</h3>
                    <StatusBadge status={spot.status} />
                    {spot.isDuplicate ? <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">duplicate</span> : null}
                  </div>
                  <p className="mt-2 text-sm text-ink/62">
                    {spot.campusArea} / {spot.bestTime} / {formatCoordinatePair(spot.latitude, spot.longitude)}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">{spot.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/spots/${spot.id}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                  Review detail
                </Link>
                <Link href={`/spots/${spot.slug}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-coral">
                  Public page
                </Link>
              </div>
            </div>

            {spot.duplicateCandidates?.length ? (
              <div className="mt-5 rounded-2xl bg-sand/55 p-4">
                <p className="text-sm font-semibold text-ink">Possible duplicates</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {spot.duplicateCandidates.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/admin/spots/${candidate.id}`}
                      className="inline-flex rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                    >
                      {candidate.name} ({candidate.status})
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
