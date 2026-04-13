"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { FilterBar } from "@/components/home/filter-bar";
import { FeaturedSpots } from "@/components/home/featured-spots";
import { siteConfig } from "@/lib/site-config";
import { defaultSpotFilters, filterSpots, getBestTimeOptions, getCampusAreaOptions } from "@/lib/spot-filters";
import { Spot, SpotFilters } from "@/lib/types";

const CampusMap = dynamic(
  () => import("@/components/map/campus-map").then((module) => module.CampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-[30px] border border-ink/10 bg-white shadow-soft sm:h-[560px]" />
    )
  }
);

export function HomeExplorer({ spots }: { spots: Spot[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [filters, setFilters] = useState<SpotFilters>(defaultSpotFilters);
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<string[]>([]);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  const visibleSpots = useMemo(() => filterSpots(spots, filters), [spots, filters]);
  const campusAreas = useMemo(() => getCampusAreaOptions(spots), [spots]);
  const bestTimes = useMemo(() => getBestTimeOptions(spots), [spots]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setFavoriteSpotIds([]);
      return;
    }

    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites");
        const result = (await response.json()) as {
          success: boolean;
          favoriteSpotIds?: string[];
          message?: string;
        };

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load favorites.");
        }

        setFavoriteSpotIds(result.favoriteSpotIds ?? []);
      } catch (error) {
        setFavoriteError(error instanceof Error ? error.message : "Failed to load favorites.");
      }
    }

    loadFavorites();
  }, [isAuthLoading, user]);

  async function handleToggleFavorite(spotId: string) {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    const isActive = favoriteSpotIds.includes(spotId);

    setFavoriteError("");
    setIsFavoriteLoading(true);
    setFavoriteSpotIds((current) =>
      isActive ? current.filter((item) => item !== spotId) : [...current, spotId]
    );

    try {
      const response = await fetch("/api/favorites", {
        method: isActive ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          spotId
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Favorite update failed.");
      }
    } catch (error) {
      setFavoriteSpotIds((current) =>
        isActive ? [...current, spotId] : current.filter((item) => item !== spotId)
      );
      setFavoriteError(error instanceof Error ? error.message : "Favorite update failed.");
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        campusAreas={campusAreas}
        bestTimes={bestTimes}
        onChange={setFilters}
        onReset={() => setFilters(defaultSpotFilters)}
      />

      {favoriteError ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{favoriteError}</div>
      ) : null}

      {!user && !isAuthLoading ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-white/80 px-4 py-3 text-sm text-ink/65">
          {siteConfig.home.signedOutSaveHint}
        </div>
      ) : null}

      <CampusMap spots={visibleSpots} />

      {visibleSpots.length ? (
        <FeaturedSpots
          spots={visibleSpots}
          favoriteSpotIds={favoriteSpotIds}
          favoriteLoading={isFavoriteLoading}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
          {siteConfig.home.filteredEmpty}
        </div>
      )}
    </div>
  );
}
