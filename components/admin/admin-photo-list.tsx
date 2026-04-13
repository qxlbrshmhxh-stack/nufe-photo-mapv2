"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentStatus, Photo } from "@/lib/types";

const batchStatuses: ContentStatus[] = ["published", "hidden", "rejected"];

export function AdminPhotoList({
  items,
  statusCounts
}: {
  items: { photo: Photo; spotName: string; spotSlug: string; spotStatus: string }[];
  statusCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [selectedIds.length, items.length]
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : items.map((item) => item.photo.id));
  }

  async function runBatch(status: ContentStatus) {
    if (!selectedIds.length) {
      setMessage("Select at least one photo first.");
      return;
    }

    const confirmed = window.confirm(`Apply ${status} to ${selectedIds.length} selected photos?`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/photos/batch", {
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
        throw new Error(result.message || "Failed to batch update photos.");
      }

      setMessage(`Updated ${selectedIds.length} photos.`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to batch update photos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No photos match the current admin filters.
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
              ["rejected", statusCounts.rejected ?? 0]
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
        {items.map((item) => (
          <article key={item.photo.id} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <div className="grid gap-5 lg:grid-cols-[24px_220px_1fr]">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.photo.id)}
                onChange={() => toggleSelection(item.photo.id)}
                className="mt-2 h-5 w-5 rounded border border-ink/20"
              />
              <div className="h-48 rounded-[24px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${item.photo.image_url})` }} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl font-semibold">{item.photo.title}</h3>
                  <StatusBadge status={item.photo.status} />
                </div>
                <p className="mt-2 text-sm text-ink/62">Uploader: {item.photo.photographer_name}</p>
                <p className="text-sm text-ink/62">Linked spot: {item.spotName} ({item.spotStatus})</p>
                <p className="mt-3 text-sm leading-6 text-ink/70">{item.photo.caption}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/photos/${item.photo.id}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                    Review detail
                  </Link>
                  {item.spotSlug ? (
                    <Link href={`/spots/${item.spotSlug}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-coral">
                      Public spot
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
