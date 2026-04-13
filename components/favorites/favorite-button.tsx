"use client";

import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  active: boolean;
  loading?: boolean;
  onToggle: () => void;
  label?: string;
  compact?: boolean;
};

export function FavoriteButton({
  active,
  loading = false,
  onToggle,
  label = "Save spot",
  compact = false
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full border transition ${
        active
          ? "border-coral/30 bg-coral/10 text-coral"
          : "border-ink/10 bg-white text-ink hover:border-moss/35"
      } ${compact ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-sm font-semibold"} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {compact ? null : loading ? "Saving..." : label}
    </button>
  );
}
