"use client";

import { useState } from "react";
import { ProfileEditor } from "@/components/user/profile-editor";
import { SavedSpots } from "@/components/user/saved-spots";
import { UploadedPhotos } from "@/components/user/uploaded-photos";
import { ProfileHeader } from "@/components/user/profile-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site-config";
import { Photo, Profile, Spot } from "@/lib/types";

export function UserDashboard({
  initialProfile,
  initialFavoriteSpotIds,
  initialSavedSpots,
  initialUploadedPhotos
}: {
  initialProfile: Profile;
  initialFavoriteSpotIds: string[];
  initialSavedSpots: Spot[];
  initialUploadedPhotos: Photo[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState("");
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<string[]>(initialFavoriteSpotIds);
  const [savedSpots, setSavedSpots] = useState<Spot[]>(initialSavedSpots);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>(initialUploadedPhotos);

  async function handleToggleFavorite(spotId: string) {
    const isActive = favoriteSpotIds.includes(spotId);
    setFavoriteSpotIds((current) =>
      isActive ? current.filter((item) => item !== spotId) : [...current, spotId]
    );
    setSavedSpots((current) =>
      isActive ? current.filter((spot) => spot.id !== spotId) : current
    );

    try {
      const response = await fetch("/api/favorites", {
        method: isActive ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          spotId
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update favorite.");
      }
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update favorite.");
      setFavoriteSpotIds(initialFavoriteSpotIds);
      setSavedSpots(initialSavedSpots);
    }
  }

  return (
    <div className="space-y-8">
      <ProfileHeader
        profile={profile}
        uploadsCount={uploadedPhotos.length}
        favoritesCount={savedSpots.length}
      />

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <ProfileEditor profile={profile} onProfileSaved={setProfile} />

      <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeading eyebrow="Uploaded photos" title={siteConfig.user.uploadedTitle} />
          <UploadedPhotos
            photos={uploadedPhotos}
            onPhotoUpdated={(photoId, updates) =>
              setUploadedPhotos((current) =>
                current.map((photo) => (photo.id === photoId ? { ...photo, ...updates } : photo))
              )
            }
            onPhotoDeleted={(photoId) =>
              setUploadedPhotos((current) => current.filter((photo) => photo.id !== photoId))
            }
            onError={setError}
          />
        </div>

        <aside className="space-y-4">
          <SectionHeading eyebrow="Saved spots" title={siteConfig.user.savedTitle} />
          <SavedSpots
            spots={savedSpots}
            favoriteSpotIds={favoriteSpotIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </aside>
      </section>
    </div>
  );
}
