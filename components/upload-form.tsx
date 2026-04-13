"use client";

import { FormEvent, useMemo, useState } from "react";
import { ImageUp, Info } from "lucide-react";
import { Spot } from "@/lib/types";

type UploadFormProps = {
  spots: Spot[];
  isSupabaseEnabled: boolean;
};

export function UploadForm({ spots, isSupabaseEnabled }: UploadFormProps) {
  const [selectedSpot, setSelectedSpot] = useState(spots[0]?.id ?? "");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draftUpload, setDraftUpload] = useState<{
    title: string;
    photographer: string;
    caption: string;
    shotTime: string;
  } | null>(null);
  const selectedSpotData = useMemo(() => spots.find((spot) => spot.id === selectedSpot), [selectedSpot, spots]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setDraftUpload({
      title: String(formData.get("title") ?? "Untitled campus shot"),
      photographer: String(formData.get("photographer") ?? "Anonymous"),
      caption: String(formData.get("caption") ?? ""),
      shotTime: String(formData.get("shotTime") ?? "")
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Upload to a spot</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Share your campus photo</h1>
          <p className="max-w-2xl text-sm leading-6 text-ink/70">
            This MVP form is ready for Supabase Storage. When env vars are configured, wire it to an API route or server
            action to save the image URL and photo metadata.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Photo title
            <input
              name="title"
              type="text"
              placeholder="Sunset at Moon Lake"
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none ring-0 transition focus:border-moss"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-ink">
            Your name
            <input
              name="photographer"
              type="text"
              placeholder="Photographer name"
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none ring-0 transition focus:border-moss"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-ink">
          Caption
          <textarea
            name="caption"
            rows={4}
            placeholder="What angle worked best? Any lighting notes?"
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Link to spot
            <select
              value={selectedSpot}
              onChange={(event) => setSelectedSpot(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
            >
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-ink">
            Shot time
            <input
              name="shotTime"
              type="datetime-local"
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
            />
          </label>
        </div>

        <label className="block rounded-[28px] border border-dashed border-fern/40 bg-mist p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-moss shadow-sm">
              <ImageUp className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink">Choose a photo file</p>
              <p className="text-sm text-ink/60">{selectedFileName}</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="mt-4 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-semibold file:text-white"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setSelectedFileName(file?.name ?? "No file selected");
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>

        <button
          type="submit"
          className="inline-flex rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Submit MVP Upload
        </button>
      </form>

      <aside className="space-y-5">
        <div className="rounded-[32px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/80">Selected spot</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">{selectedSpotData?.name}</h2>
          <p className="mt-4 text-sm leading-6 text-white/75">{selectedSpotData?.description}</p>
          <div className="mt-6 space-y-2 text-sm text-white/80">
            <p>Area: {selectedSpotData?.campusArea}</p>
            <p>Best time: {selectedSpotData?.bestTime}</p>
          </div>
        </div>

        {draftUpload ? (
          <div className="overflow-hidden rounded-[32px] border border-ink/10 bg-white shadow-soft">
            <div
              className="h-52 bg-cover bg-center"
              style={{
                backgroundImage: previewUrl
                  ? `linear-gradient(180deg, rgba(18,33,23,0.1), rgba(18,33,23,0.28)), url(${previewUrl})`
                  : "linear-gradient(180deg, rgba(18,33,23,0.08), rgba(18,33,23,0.24)), linear-gradient(135deg, #F4E6CC, #EEF4EB)"
              }}
            />
            <div className="space-y-3 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Draft submission</p>
              <h3 className="font-display text-2xl font-semibold">{draftUpload.title}</h3>
              <p className="text-sm leading-6 text-ink/70">{draftUpload.caption || "Your caption preview will appear here after submission."}</p>
              <div className="flex flex-wrap gap-3 text-sm text-ink/60">
                <span>By {draftUpload.photographer}</span>
                <span>{draftUpload.shotTime || "No shot time selected"}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-moss" />
            <div className="space-y-2 text-sm leading-6 text-ink/70">
              <p>{isSupabaseEnabled ? "Supabase is configured. You can connect this form to a storage upload route." : "Supabase env vars are missing, so the MVP currently runs in mock mode."}</p>
              <p>Recommended next step: add authentication, create a signed upload route, and save the final public URL to the `photos` table.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
