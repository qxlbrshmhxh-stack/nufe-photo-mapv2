import Link from "next/link";
import { Spot } from "@/lib/types";

export function RelatedSpots({ spots }: { spots: Spot[] }) {
  if (!spots.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {spots.map((spot) => (
        <article key={spot.id} className="rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">{spot.campusArea}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{spot.name}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/68">{spot.description}</p>
          <Link href={`/spots/${spot.slug}`} className="mt-4 inline-flex text-sm font-semibold text-coral">
            Open spot
          </Link>
        </article>
      ))}
    </div>
  );
}
