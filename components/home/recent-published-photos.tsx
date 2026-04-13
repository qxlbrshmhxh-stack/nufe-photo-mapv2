"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { RecentPhotoItem } from "@/lib/types";

export function RecentPublishedPhotos({ items }: { items: RecentPhotoItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        {siteConfig.home.recentEmpty}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.photo.id} className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-soft">
          <div
            className="h-56 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.08), rgba(18,33,23,0.24)), url(${item.photo.image_url})`
            }}
          />
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl font-semibold text-ink">{item.photo.title}</h3>
              {item.photo.is_featured ? (
                <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                  featured
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-ink/68">{item.photo.caption || siteConfig.home.recentFallbackCaption}</p>
            <div className="flex items-center justify-between gap-3 text-sm text-ink/60">
              <span>{item.spot.name}</span>
              <span>{item.spot.campusArea}</span>
            </div>
            <Link
              href={`/spots/${item.spot.slug}`}
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
            >
              View spot
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
