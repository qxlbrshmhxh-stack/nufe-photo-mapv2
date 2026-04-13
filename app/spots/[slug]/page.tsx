import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReportButton } from "@/components/reports/report-button";
import { RelatedSpots } from "@/components/spot/related-spots";
import { SpotFavoriteToggle } from "@/components/spot/spot-favorite-toggle";
import { SpotGallery } from "@/components/spot/spot-gallery";
import { SpotMeta } from "@/components/spot/spot-meta";
import { SectionHeading } from "@/components/ui/section-heading";
import { TagChip } from "@/components/ui/tag-chip";
import { getRelatedSpots, getSpotBySlug } from "@/lib/queries";

export default async function SpotDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSpotBySlug(slug);

  if (result.redirectSlug) {
    redirect(`/spots/${result.redirectSlug}`);
  }

  const spot = result.spot;

  if (!spot) {
    notFound();
  }

  const relatedSpots = await getRelatedSpots(spot, 4);

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-moss">
        <ArrowLeft className="h-4 w-4" />
        Back to map
      </Link>

      <section className="space-y-4 rounded-[36px] border border-ink/10 bg-white/90 p-8 shadow-soft sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">{spot.campusArea}</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{spot.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SpotFavoriteToggle spotId={spot.id} />
            <ReportButton targetType="spot" targetId={spot.id} />
          </div>
        </div>
        <p className="max-w-3xl text-base leading-7 text-ink/70">{spot.description}</p>
        <div className="flex flex-wrap gap-2">
          {(spot.tags.length ? spot.tags : [spot.campusArea, spot.bestTime]).map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      </section>

      <SpotGallery images={spot.photos.map((photo) => photo.image_url)} />
      <SpotMeta spot={spot} />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <SectionHeading eyebrow="Shooting tips" title="How to get a strong result here" />
          <div className="mt-5 grid gap-3">
            {(spot.tips.length
              ? spot.tips
              : [
                  "Try a wide establishing shot first to capture the full scene.",
                  "Come during the listed best time for softer campus light.",
                  "Upload a sample image after your shoot to help the next visitor."
                ]).map((tip) => (
              <div key={tip} className="rounded-2xl bg-mist p-4 text-sm leading-6 text-ink/72">
                {tip}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[30px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <SectionHeading eyebrow="Spot gallery" title="Community photos for this location" description="These images come from the Supabase `photos` table for the selected spot." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {spot.photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-[24px] border border-ink/10 bg-white">
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${photo.image_url})` }} />
                <div className="space-y-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-ink">{photo.title}</h3>
                    <ReportButton targetType="photo" targetId={photo.id} compact />
                  </div>
                  <p className="text-sm leading-5 text-ink/68">{photo.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Related spots"
          title={`More places in ${spot.campusArea}`}
          description="If you like this area, these published spots nearby are worth checking next."
        />
        <RelatedSpots spots={relatedSpots} />
      </section>
    </div>
  );
}
