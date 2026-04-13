import { Clock3, MapPin } from "lucide-react";
import { TagChip } from "@/components/ui/tag-chip";
import { Spot } from "@/lib/types";
import { formatCoordinatePair } from "@/lib/utils";

export function SpotMeta({ spot }: { spot: Spot }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[30px] border border-ink/10 bg-white/90 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Spot info</p>
        <div className="mt-5 space-y-4 text-sm text-ink/70">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-coral" />
            <div>
              <p className="font-semibold text-ink">{spot.campusArea}</p>
              <p>{formatCoordinatePair(spot.latitude, spot.longitude)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-coral" />
            <div>
              <p className="font-semibold text-ink">Best shooting time</p>
              <p>{spot.bestTime}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-coral/15" />
            <div>
              <p className="font-semibold text-ink">Photo count</p>
              <p>{spot.photoCount ?? 0} published photo{spot.photoCount === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[30px] border border-ink/10 bg-white/90 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Tags</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(spot.tags.length ? spot.tags : [spot.campusArea, spot.bestTime]).map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-ink/68">{spot.description}</p>
      </div>
    </div>
  );
}
