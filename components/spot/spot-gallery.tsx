export function SpotGallery({ images }: { images: string[] }) {
  if (!images.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No photos have been uploaded for this spot yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`rounded-[28px] bg-cover bg-center shadow-soft ${index === 0 ? "sm:col-span-2 sm:h-[360px]" : "h-[220px] sm:h-[172px]"}`}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(18,33,23,0.06), rgba(18,33,23,0.24)), url(${image})`
          }}
        />
      ))}
    </div>
  );
}
