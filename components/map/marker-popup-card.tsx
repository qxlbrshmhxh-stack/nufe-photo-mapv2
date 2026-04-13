import Link from "next/link";
import { Spot } from "@/lib/types";

export function MarkerPopupCard({ spot }: { spot: Spot }) {
  return (
    <div className="w-[220px] space-y-3">
      <div
        className="h-28 rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: spot.previewImage
            ? `linear-gradient(180deg, rgba(18,33,23,0.04), rgba(18,33,23,0.2)), url(${spot.previewImage})`
            : "linear-gradient(135deg, #F4E6CC, #EEF4EB)"
        }}
      />
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{spot.name}</h3>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-moss">{spot.campusArea}</p>
      </div>
      <p className="text-sm leading-5 text-slate-700">{spot.description}</p>
      <Link href={`/spots/${spot.slug}`} className="inline-flex text-sm font-semibold text-moss">
        View spot details
      </Link>
    </div>
  );
}
