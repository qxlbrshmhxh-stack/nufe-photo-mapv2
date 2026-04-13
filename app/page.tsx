import { FeaturedSpots } from "@/components/home/featured-spots";
import { HomeExplorer } from "@/components/home/home-explorer";
import { HeroSection } from "@/components/home/hero-section";
import { RecentPublishedPhotos } from "@/components/home/recent-published-photos";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedSpots, getRecentPublishedPhotos, getSpots } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const [spots, featuredSpots, recentPhotos] = await Promise.all([
    getSpots(),
    getFeaturedSpots(4),
    getRecentPublishedPhotos(6)
  ]);

  return (
    <div className="space-y-10">
      <HeroSection />

      <section id="campus-map" className="space-y-4">
        <SectionHeading
          eyebrow={siteConfig.home.mapEyebrow}
          title={siteConfig.home.mapTitle}
          description={siteConfig.home.mapDescription}
        />
        <HomeExplorer spots={spots} />
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow={siteConfig.home.featuredEyebrow}
          title={siteConfig.home.featuredTitle}
          description={siteConfig.home.featuredDescription}
        />
        {featuredSpots.length ? (
          <FeaturedSpots spots={featuredSpots} />
        ) : (
          <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
            {siteConfig.home.featuredEmpty}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow={siteConfig.home.recentEyebrow}
          title={siteConfig.home.recentTitle}
          description={siteConfig.home.recentDescription}
        />
        <RecentPublishedPhotos items={recentPhotos} />
      </section>
    </div>
  );
}
