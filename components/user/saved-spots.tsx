import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Spot } from "@/lib/types";

export function SavedSpots({
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
  if (!spots.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No saved spots yet. Favorite a spot from the homepage or detail page to see it here.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {spots.map((spot) => (
        <article key={spot.id} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">{spot.campusArea}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{spot.name}</h3>
            </div>
            {onToggleFavorite ? (
              <FavoriteButton
                active={favoriteSpotIds.includes(spot.id)}
                loading={favoriteLoading}
                onToggle={() => onToggleFavorite(spot.id)}
                compact
              />
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/70">{spot.description}</p>
          <Link href={`/spots/${spot.slug}`} className="mt-4 inline-flex text-sm font-semibold text-coral">
            Open spot detail
          </Link>
        </article>
      ))}
    </div>
  );
}
