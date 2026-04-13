export function AdminTrendList({
  title,
  description,
  points
}: {
  title: string;
  description: string;
  points: { date: string; count: number }[];
}) {
  return (
    <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/66">{description}</p>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point.date} className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
            <p className="text-sm font-medium text-ink">{point.date}</p>
            <p className="text-lg font-semibold text-moss">{point.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
