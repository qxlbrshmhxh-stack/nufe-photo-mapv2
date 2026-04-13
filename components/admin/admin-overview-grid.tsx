import { AdminOverviewStats } from "@/lib/types";

export function AdminOverviewGrid({ stats }: { stats: AdminOverviewStats }) {
  const cards = [
    { label: "Published spots", value: stats.publishedSpots },
    { label: "Published photos", value: stats.publishedPhotos },
    { label: "Pending spots", value: stats.pendingSpots },
    { label: "Pending photos", value: stats.pendingPhotos },
    { label: "Open reports", value: stats.openReports },
    { label: "Hidden items", value: stats.hiddenItems },
    { label: "Rejected items", value: stats.rejectedItems },
    { label: "Uploads in 7 days", value: stats.newUploadsLast7Days },
    { label: "New spots in 7 days", value: stats.newSpotsLast7Days },
    { label: "All reports", value: stats.totalReports }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">{card.label}</p>
          <p className="mt-3 font-display text-4xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
