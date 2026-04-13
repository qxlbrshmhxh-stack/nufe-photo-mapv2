"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { FavoriteButton } from "@/components/favorites/favorite-button";

export function SpotFavoriteToggle({ spotId }: { spotId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setIsFavorite(false);
      return;
    }

    async function loadFavoriteState() {
      const response = await fetch("/api/favorites");
      const result = (await response.json()) as {
        success: boolean;
        favoriteSpotIds?: string[];
      };

      if (response.ok && result.success) {
        setIsFavorite((result.favoriteSpotIds ?? []).includes(spotId));
      }
    }

    loadFavoriteState();
  }, [isAuthLoading, spotId, user]);

  async function handleToggle() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname || `/spots/${spotId}`)}`);
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    setIsLoading(true);

    try {
      const response = await fetch("/api/favorites", {
        method: nextValue ? "POST" : "DELETE",
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
    } catch {
      setIsFavorite(!nextValue);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FavoriteButton
      active={isFavorite}
      loading={isLoading}
      onToggle={handleToggle}
      label={!user && !isAuthLoading ? "Sign in to save" : isFavorite ? "Saved" : "Save spot"}
    />
  );
}
