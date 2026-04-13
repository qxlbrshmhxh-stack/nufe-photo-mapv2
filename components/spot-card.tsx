import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";
import { Spot } from "@/lib/types";

type SpotCardProps = {
  spot: Spot;
};

export function SpotCard({ spot }: SpotCardProps) {
  return (
    <article className="rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1">
      <div
        className="mb-4 h-44 rounded-[22px] bg-cover bg-center"
        style={{
          backgroundImage: spot.previewImage
            ? `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.28)), url(${spot.previewImage})`
            : "linear-gradient(135deg, #F4E6CC, #EEF4EB)"
        }}
      />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">{spot.name}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink/65">
              <MapPin className="h-4 w-4" />
              <span>{spot.campusArea}</span>
            </div>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{spot.bestTime}</span>
        </div>
        <p className="text-sm leading-6 text-ink/75">{spot.description}</p>
        <div className="flex items-center gap-2 text-sm text-moss">
          <Clock3 className="h-4 w-4" />
          Best shooting time: {spot.bestTime}
        </div>
        <Link
          href={`/spots/${spot.slug}`}
          className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
        >
          Open spot page
        </Link>
      </div>
    </article>
  );
}
