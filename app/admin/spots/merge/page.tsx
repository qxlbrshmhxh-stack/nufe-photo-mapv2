import { AdminSpotMergeForm } from "@/components/admin/admin-spot-merge-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireAdmin } from "@/lib/auth";
import { getMergeableSpots, getSpotMergePreview } from "@/lib/maintenance";

export default async function AdminSpotMergePage({
  searchParams
}: {
  searchParams: Promise<{ source?: string; target?: string }>;
}) {
  await requireAdmin("/");
  const { source = "", target = "" } = await searchParams;
  const spots = await getMergeableSpots();
  const preview = source && target ? await getSpotMergePreview(source, target) : null;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Spot merge"
        title="Merge duplicate spots into a canonical record"
        description="Move linked photos and favorites, keep traceability, and hide the duplicate from public browsing."
      />
      <AdminSpotMergeForm
        spots={spots.map((spot) => ({ id: spot.id, slug: spot.slug, name: spot.name, status: spot.status }))}
        initialSourceSpotId={source}
        initialTargetSpotId={target}
        preview={preview}
      />
    </div>
  );
}
