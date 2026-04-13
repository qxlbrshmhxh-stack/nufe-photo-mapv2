import Link from "next/link";
import { ArrowRight, Camera, MapPinned } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function HeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[36px] border border-ink/10 bg-[length:34px_34px] bg-grid bg-white/75 p-8 shadow-soft sm:p-10">
        <div className="inline-flex rounded-full border border-moss/15 bg-moss/10 px-4 py-2 text-sm font-semibold text-moss">
          {siteConfig.home.heroEyebrow}
        </div>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {siteConfig.home.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70">
          {siteConfig.home.heroDescription}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#campus-map" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss">
            {siteConfig.home.heroPrimaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/upload" className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-moss/35">
            {siteConfig.home.heroSecondaryCta}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <FeatureCard
          icon={MapPinned}
          title="Interactive campus map"
          description="Each mock marker opens a preview card with the spot name, image, and a detail link."
        />
        <FeatureCard
          icon={Camera}
          title="Mock-first, Supabase-ready"
          description="The UI runs from local mock data now, with clear points where real Supabase queries will be added next."
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description
}: {
  icon: typeof Camera;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[30px] border border-ink/10 bg-white/85 p-6 shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-coral">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/68">{description}</p>
    </article>
  );
}
