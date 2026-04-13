"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ImageUp, MapPin, Search } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { siteConfig } from "@/lib/site-config";
import { Spot } from "@/lib/types";
import { savePhotographerName } from "@/lib/visitor";

const SpotLocationPicker = dynamic(
  () => import("@/components/upload/spot-location-picker").then((module) => module.SpotLocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-[280px] rounded-[24px] border border-ink/10 bg-white shadow-sm" />
  }
);

type LocationPoint = {
  latitude: number;
  longitude: number;
};

function buildDefaultTitle(fileName: string, spotName: string) {
  const fileStem = fileName.replace(/\.[^.]+$/, "").trim();
  if (fileStem) {
    return fileStem;
  }

  if (spotName.trim()) {
    return `${spotName.trim()} photo`;
  }

  return siteConfig.upload.defaultPhotoTitle;
}

export function UploadForm({
  spots,
  initialPhotographerName
}: {
  spots: Spot[];
  initialPhotographerName: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [spotMode, setSpotMode] = useState<"existing" | "new">(spots.length ? "existing" : "new");
  const [selectedSpot, setSelectedSpot] = useState(spots[0]?.id ?? "");
  const [spotQuery, setSpotQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; publicSpotSlug?: string | null } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState(siteConfig.upload.noFileSelected);
  const [photographerName, setPhotographerName] = useState(initialPhotographerName);
  const [caption, setCaption] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [shotTime, setShotTime] = useState("");
  const [newSpotName, setNewSpotName] = useState("");
  const [newSpotDescription, setNewSpotDescription] = useState("");
  const [newSpotCampusArea, setNewSpotCampusArea] = useState("");
  const [newSpotBestTime, setNewSpotBestTime] = useState("");
  const [newSpotTags, setNewSpotTags] = useState("");
  const [newSpotTips, setNewSpotTips] = useState("");
  const [pickedLocation, setPickedLocation] = useState<LocationPoint | null>(null);

  const filteredSpots = useMemo(() => {
    const keyword = spotQuery.trim().toLowerCase();
    if (!keyword) {
      return spots;
    }

    return spots.filter((spot) => {
      const haystack = `${spot.name} ${spot.campusArea} ${spot.description}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [spotQuery, spots]);

  const selectedSpotData = useMemo(
    () => spots.find((spot) => spot.id === selectedSpot) ?? null,
    [selectedSpot, spots]
  );

  useEffect(() => {
    setPhotographerName(initialPhotographerName);
  }, [initialPhotographerName]);

  useEffect(() => {
    if (!filteredSpots.length) {
      return;
    }

    if (!filteredSpots.some((spot) => spot.id === selectedSpot)) {
      setSelectedSpot(filteredSpots[0].id);
    }
  }, [filteredSpots, selectedSpot]);

  function resetLocalFields() {
    setSelectedFileName("No file selected");
    setCaption("");
    setCustomTitle("");
    setShotTime("");
    setShowAdvanced(false);
    setNewSpotName("");
    setNewSpotDescription("");
    setNewSpotCampusArea("");
    setNewSpotBestTime("");
    setNewSpotTags("");
    setNewSpotTips("");
    setPickedLocation(null);
    setSpotQuery("");
    if (spots.length) {
      setSpotMode("existing");
      setSelectedSpot(spots[0].id);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      router.push("/login?next=/upload");
      return;
    }

    if (spotMode === "existing" && !selectedSpot) {
      setMessage({
        type: "error",
        text: siteConfig.upload.existingFallback
      });
      return;
    }

    if (spotMode === "new" && !newSpotName.trim()) {
      setMessage({
        type: "error",
        text: siteConfig.upload.newSpotMissingName
      });
      return;
    }

    if (spotMode === "new" && !pickedLocation) {
      setMessage({
        type: "error",
        text: siteConfig.upload.newSpotMissingLocation
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const effectiveSpotName =
      spotMode === "existing" ? selectedSpotData?.name ?? siteConfig.upload.defaultPhotoTitle : newSpotName.trim();

    formData.set("title", customTitle.trim() || buildDefaultTitle(selectedFileName, effectiveSpotName));
    formData.set("photographerName", photographerName.trim() || initialPhotographerName || "NUFE Explorer");
    formData.set("caption", caption.trim());
    formData.set("shotTime", shotTime);
    formData.set("spotMode", spotMode);

    if (spotMode === "existing") {
      formData.set("existingSpotId", selectedSpot);
    } else if (pickedLocation) {
      formData.set("newSpotName", newSpotName.trim());
      formData.set(
        "newSpotDescription",
        newSpotDescription.trim() || caption.trim() || `${newSpotName.trim()} ${siteConfig.upload.defaultSpotDescriptionSuffix}`
      );
      formData.set("newSpotLatitude", pickedLocation.latitude.toString());
      formData.set("newSpotLongitude", pickedLocation.longitude.toString());
      formData.set("newSpotCampusArea", newSpotCampusArea.trim() || siteConfig.upload.defaultCampusArea);
      formData.set("newSpotBestTime", newSpotBestTime.trim() || siteConfig.upload.defaultBestTime);
      formData.set("newSpotTags", newSpotTags.trim());
      formData.set("newSpotTips", newSpotTips.trim());
    }

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
        publicSpotSlug?: string | null;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage({
        type: "success",
        text: result.message,
        publicSpotSlug: result.publicSpotSlug
      });
      savePhotographerName(photographerName);
      formRef.current?.reset();
      resetLocalFields();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-ink/10 bg-white/90 p-6 shadow-soft sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">{siteConfig.upload.eyebrow}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{siteConfig.upload.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-ink/68">
            {siteConfig.upload.description}
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/45">{siteConfig.upload.boundaryHint}</p>
        </div>

        <label className="block rounded-[28px] border border-dashed border-fern/40 bg-mist p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-moss shadow-sm">
              <ImageUp className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink">Upload photo</p>
              <p className="text-sm text-ink/60">{selectedFileName}</p>
            </div>
          </div>
          <input
            name="image"
            type="file"
            accept="image/*"
            required
            className="mt-4 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-semibold file:text-white"
            onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? siteConfig.upload.noFileSelected)}
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Choose a spot</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-mist p-1">
              <button
                type="button"
                onClick={() => setSpotMode("existing")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${spotMode === "existing" ? "bg-white text-ink shadow-sm" : "text-ink/60"}`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setSpotMode("new")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${spotMode === "new" ? "bg-white text-ink shadow-sm" : "text-ink/60"}`}
              >
                New spot
              </button>
            </div>
          </div>

          {spotMode === "existing" ? (
            <div className="space-y-4 rounded-[28px] border border-ink/10 bg-mist p-5">
              <label className="block space-y-2 text-sm font-medium text-ink">
                {siteConfig.upload.searchLabel}
                <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-ink/45" />
                  <input
                    type="text"
                    value={spotQuery}
                    onChange={(event) => setSpotQuery(event.target.value)}
                    placeholder={siteConfig.upload.searchPlaceholder}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm font-medium text-ink">
                {siteConfig.upload.selectLabel}
                <select
                  name="existingSpotId"
                  value={selectedSpot}
                  onChange={(event) => setSelectedSpot(event.target.value)}
                  disabled={!filteredSpots.length}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-moss disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {filteredSpots.length ? (
                    filteredSpots.map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        {spot.name} · {spot.campusArea}
                      </option>
                    ))
                  ) : (
                    <option value="">{siteConfig.upload.noMatches}</option>
                  )}
                </select>
              </label>
            </div>
          ) : (
            <div className="space-y-4 rounded-[28px] border border-ink/10 bg-mist p-5">
              <label className="block space-y-2 text-sm font-medium text-ink">
                Spot name
                <input
                  type="text"
                  value={newSpotName}
                  onChange={(event) => setNewSpotName(event.target.value)}
                  placeholder="Moon Bridge Corner"
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-moss"
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">Pick location on map</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/60">
                    {siteConfig.upload.locationHint}
                  </span>
                </div>
                <SpotLocationPicker value={pickedLocation} onChange={setPickedLocation} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Latitude</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {pickedLocation ? pickedLocation.latitude.toFixed(6) : "Select on map"}
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Longitude</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {pickedLocation ? pickedLocation.longitude.toFixed(6) : "Select on map"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <label className="block space-y-2 text-sm font-medium text-ink">
          Short caption
          <textarea
            name="caption"
            rows={4}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder={siteConfig.upload.captionPlaceholder}
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>

        <div className="rounded-[28px] border border-ink/10 bg-white">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{siteConfig.upload.advancedTitle}</p>
              <p className="text-xs text-ink/55">{siteConfig.upload.advancedDescription}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-ink/55 transition ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {showAdvanced ? (
            <div className="grid gap-4 border-t border-ink/10 px-5 py-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink">
                Custom photo title
                <input
                  type="text"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="Optional title override"
                  className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-ink">
                Photographer name
                <input
                  type="text"
                  value={photographerName}
                  onChange={(event) => setPhotographerName(event.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-ink md:col-span-2">
                Shot time
                <input
                  type="datetime-local"
                  value={shotTime}
                  onChange={(event) => setShotTime(event.target.value)}
                  className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                />
              </label>

              {spotMode === "new" ? (
                <>
                  <label className="space-y-2 text-sm font-medium text-ink">
                    Campus area
                    <input
                      type="text"
                      value={newSpotCampusArea}
                      onChange={(event) => setNewSpotCampusArea(event.target.value)}
                      placeholder={`Optional ${siteConfig.campusDisplayName} area`}
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink">
                    Best shooting time
                    <input
                      type="text"
                      value={newSpotBestTime}
                      onChange={(event) => setNewSpotBestTime(event.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink md:col-span-2">
                    Spot description
                    <textarea
                      rows={3}
                      value={newSpotDescription}
                      onChange={(event) => setNewSpotDescription(event.target.value)}
                      placeholder="Optional short description"
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink">
                    Tags
                    <input
                      type="text"
                      value={newSpotTags}
                      onChange={(event) => setNewSpotTags(event.target.value)}
                      placeholder="sunset, portrait, lake"
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink">
                    Shooting tips
                    <textarea
                      rows={3}
                      value={newSpotTips}
                      onChange={(event) => setNewSpotTips(event.target.value)}
                      placeholder="Optional tips, one per line"
                      className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
                    />
                  </label>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            <p>{message.text}</p>
            {message.type === "success" && message.publicSpotSlug ? (
              <Link href={`/spots/${message.publicSpotSlug}`} className="mt-2 inline-flex font-semibold text-emerald-800">
                Open spot detail
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Uploading..." : "Submit"}
        </button>
      </form>

      <aside className="rounded-[32px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/85">
          {spotMode === "existing" ? "Selected spot" : "New spot preview"}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold">
          {spotMode === "existing" ? selectedSpotData?.name ?? "Choose a spot" : newSpotName.trim() || "Create a new location"}
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/75">
          {spotMode === "existing"
            ? selectedSpotData?.description ?? siteConfig.upload.selectedSpotFallback
            : siteConfig.upload.newSpotHelper}
        </p>

        <div className="mt-6 space-y-4 rounded-[28px] bg-white/10 p-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-sand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Location</p>
              <p className="mt-1 text-sm text-white/80">
                {spotMode === "existing"
                  ? selectedSpotData
                    ? `${selectedSpotData.campusArea} · ${selectedSpotData.latitude.toFixed(4)}, ${selectedSpotData.longitude.toFixed(4)}`
                    : "Choose an existing spot"
                  : pickedLocation
                    ? `${pickedLocation.latitude.toFixed(4)}, ${pickedLocation.longitude.toFixed(4)}`
                    : "Pick a point on the map"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Submission summary</p>
            <ul className="mt-2 space-y-2 text-sm text-white/80">
              <li>Photo file: {selectedFileName}</li>
              <li>Caption: {caption.trim() ? "Added" : "Optional"}</li>
              <li>{spotMode === "existing" ? "Using an existing campus spot" : "Creating a new spot with map picker"}</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
