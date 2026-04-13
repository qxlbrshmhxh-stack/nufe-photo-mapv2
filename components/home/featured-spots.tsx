"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { TagChip } from "@/components/ui/tag-chip";
import { Spot } from "@/lib/types";
import { formatCoordinatePair } from "@/lib/utils";

export function FeaturedSpots({
  spots,
  favoriteSpotIds = [],
  favoriteLoading = false,
  onToggleFavorite
}: {
  spots: Spot[];
  favoriteSpotIds?: string[];
  favoriteLoading?: boolean;
  onToggleFavorite?: (spotId: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {spots.map((spot) => (
        <article key={spot.id} className="overflow-hidden rounded-[30px] border border-ink/10 bg-white shadow-soft">
          <div
            className="h-52 bg-cover bg-center"
            style={{
              backgroundImage: spot.previewImage
                ? `linear-gradient(180deg, rgba(18,33,23,0.08), rgba(18,33,23,0.26)), url(${spot.previewImage})`
                : "linear-gradient(135deg, #F4E6CC, #EEF4EB)"
            }}
          />
          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">{spot.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-ink/60">
                  <MapPin className="h-4 w-4" />
                  <span>{spot.campusArea} / {formatCoordinatePair(spot.latitude, spot.longitude)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {spot.isFeatured ? (
                  <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">featured</span>
                ) : null}
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{spot.bestTime}</span>
                {onToggleFavorite ? (
                  <FavoriteButton
                    active={favoriteSpotIds.includes(spot.id)}
                    loading={favoriteLoading}
                    onToggle={() => onToggleFavorite(spot.id)}
                    compact
                  />
                ) : null}
              </div>
            </div>
            <p className="text-sm leading-6 text-ink/70">{spot.description}</p>
            <div className="flex flex-wrap gap-2">
              {(spot.tags.length ? spot.tags : [spot.campusArea]).map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </div>
            <Link href={`/spots/${spot.slug}`} className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss">
              Open detail page
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
