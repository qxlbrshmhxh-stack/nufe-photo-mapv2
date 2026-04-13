import { Camera } from "lucide-react";
import { Photo } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

type PhotoGridProps = {
  photos: Photo[];
  emptyLabel?: string;
};

export function PhotoGrid({ photos, emptyLabel = "No photos yet. Be the first to upload one." }: PhotoGridProps) {
  if (!photos.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/70 p-10 text-center">
        <Camera className="mx-auto mb-3 h-8 w-8 text-ink/50" />
        <p className="text-sm text-ink/65">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {photos.map((photo) => (
        <article key={photo.id} className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-soft">
          <div
            className="h-56 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.08), rgba(18,33,23,0.22)), url(${photo.image_url})`
            }}
          />
          <div className="space-y-2 p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold">{photo.title}</h3>
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-moss">
                {formatDateLabel(photo.created_at)}
              </span>
            </div>
            <p className="text-sm leading-6 text-ink/70">{photo.caption}</p>
            <div className="flex items-center justify-between text-sm text-ink/55">
              <span>{photo.photographer_name}</span>
              <span>{photo.shot_time}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
