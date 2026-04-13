"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MergeableSpot = {
  id: string;
  slug: string;
  name: string;
  status: string;
};

export function AdminSpotMergeForm({
  spots,
  initialSourceSpotId = "",
  initialTargetSpotId = "",
  preview
}: {
  spots: MergeableSpot[];
  initialSourceSpotId?: string;
  initialTargetSpotId?: string;
  preview?: {
    source: { id: string; name: string; status: string; campus_area: string; best_time: string };
    target: { id: string; name: string; status: string; campus_area: string; best_time: string };
    sourcePhotoCount: number;
    sourceFavoriteCount: number;
    risks: string[];
  } | null;
}) {
  const router = useRouter();
  const [sourceSpotId, setSourceSpotId] = useState(initialSourceSpotId);
  const [targetSpotId, setTargetSpotId] = useState(initialTargetSpotId);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function refreshPreview(nextSource: string, nextTarget: string) {
    const search = new URLSearchParams();
    if (nextSource) search.set("source", nextSource);
    if (nextTarget) search.set("target", nextTarget);
    router.push(`/admin/spots/merge?${search.toString()}`);
  }

  async function handleMerge() {
    if (!sourceSpotId || !targetSpotId) {
      setMessage("Choose both a source duplicate spot and a target canonical spot.");
      return;
    }

    const confirmed = window.confirm("Merge this duplicate spot into the canonical spot? This will move photos and favorites.");
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/spots/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceSpotId,
          targetSpotId,
          note
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to merge spots.");
      }

      setMessage(result.message || "Spots merged.");
      router.push(`/admin/spots/${targetSpotId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to merge spots.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Source duplicate spot
            <select
              value={sourceSpotId}
              onChange={(event) => {
                const value = event.target.value;
                setSourceSpotId(value);
                refreshPreview(value, targetSpotId);
              }}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            >
              <option value="">Choose source spot</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name} ({spot.status})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Target canonical spot
            <select
              value={targetSpotId}
              onChange={(event) => {
                const value = event.target.value;
                setTargetSpotId(value);
                refreshPreview(sourceSpotId, value);
              }}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            >
              <option value="">Choose target spot</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name} ({spot.status})
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block space-y-2 text-sm font-medium text-ink">
          Merge note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Optional merge context for the admin history."
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          />
        </label>
      </section>

      {preview ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Source</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{preview.source.name}</h3>
            <p className="mt-2 text-sm text-ink/66">
              {preview.source.campus_area} / {preview.source.best_time} / {preview.source.status}
            </p>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Target</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{preview.target.name}</h3>
            <p className="mt-2 text-sm text-ink/66">
              {preview.target.campus_area} / {preview.target.best_time} / {preview.target.status}
            </p>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Impact</p>
            <p className="mt-3 text-sm text-ink/68">{preview.sourcePhotoCount} linked photos will move.</p>
            <p className="mt-1 text-sm text-ink/68">{preview.sourceFavoriteCount} favorites will be reconciled.</p>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Risks</p>
            {preview.risks.length ? (
              <div className="mt-3 grid gap-2">
                {preview.risks.map((risk) => (
                  <p key={risk} className="rounded-2xl bg-sand/55 px-4 py-3 text-sm text-ink/72">
                    {risk}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink/68">No obvious merge blockers detected.</p>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isSubmitting || !preview}
          onClick={handleMerge}
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Merging..." : "Confirm merge"}
        </button>
        {message ? <p className="text-sm text-moss">{message}</p> : null}
      </div>
    </div>
  );
}
