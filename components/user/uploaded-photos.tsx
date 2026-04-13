"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Photo } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateLabel } from "@/lib/utils";

export function UploadedPhotos({
  photos,
  onPhotoUpdated,
  onPhotoDeleted,
  onError
}: {
  photos: Photo[];
  onPhotoUpdated: (photoId: string, updates: Pick<Photo, "title" | "caption">) => void;
  onPhotoDeleted: (photoId: string) => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftCaption, setDraftCaption] = useState("");
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);

  if (!photos.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No uploaded photos are linked to this account yet.
      </div>
    );
  }

  async function handleDelete(photoId: string) {
    const shouldDelete = window.confirm(
      "Delete this uploaded photo?\n\nThis will remove the photo record and its image file. If this photo is the only photo on a spot you created, that empty spot may also be removed."
    );
    if (!shouldDelete) {
      return;
    }

    setBusyPhotoId(photoId);
    onError("");

    try {
      const response = await fetch(`/api/my/photos/${photoId}`, {
        method: "DELETE"
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        deletedOwnedSpot?: boolean;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete photo.");
      }

      onPhotoDeleted(photoId);
      router.refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete photo.");
    } finally {
      setBusyPhotoId(null);
    }
  }

  async function handleSave(photo: Photo) {
    const nextTitle = draftTitle.trim();
    const nextCaption = draftCaption.trim();

    if (!nextTitle) {
      onError("Photo title cannot be empty.");
      return;
    }

    setBusyPhotoId(photo.id);
    onError("");

    try {
      const response = await fetch(`/api/my/photos/${photo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: nextTitle,
          caption: nextCaption
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        photo?: { title: string; caption: string };
      };

      if (!response.ok || !result.success || !result.photo) {
        throw new Error(result.message || "Failed to update photo.");
      }

      onPhotoUpdated(photo.id, result.photo);
      setEditingPhotoId(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to update photo.");
    } finally {
      setBusyPhotoId(null);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {photos.map((photo) => (
        <article key={photo.id} className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-soft">
          <div className="h-52 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${photo.image_url})` }} />
          <div className="space-y-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold">{photo.title}</h3>
              <StatusBadge status={photo.status} />
            </div>
            <p className="text-sm leading-6 text-ink/68">{photo.caption}</p>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-moss">{formatDateLabel(photo.created_at)}</p>

            {photo.linkedSpot ? (
              <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/72">
                <p className="font-semibold text-ink">{photo.linkedSpot.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{photo.linkedSpot.campusArea}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href={`/spots/${photo.linkedSpot.slug}`} className="font-semibold text-moss">
                    View linked spot
                  </Link>
                  <span className="text-ink/40">Edit spot later</span>
                </div>
              </div>
            ) : null}

            {editingPhotoId === photo.id ? (
              <div className="space-y-3 rounded-2xl border border-ink/10 bg-mist p-4">
                <label className="block space-y-2 text-sm font-medium text-ink">
                  Title
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-ink">
                  Caption
                  <textarea
                    rows={3}
                    value={draftCaption}
                    onChange={(event) => setDraftCaption(event.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busyPhotoId === photo.id}
                    onClick={() => void handleSave(photo)}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={busyPhotoId === photo.id}
                    onClick={() => setEditingPhotoId(null)}
                    className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={busyPhotoId === photo.id}
                  onClick={() => {
                    setEditingPhotoId(photo.id);
                    setDraftTitle(photo.title);
                    setDraftCaption(photo.caption);
                    onError("");
                  }}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                >
                  Edit photo
                </button>
                <button
                  type="button"
                  disabled={busyPhotoId === photo.id}
                  onClick={() => void handleDelete(photo.id)}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Delete photo
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
