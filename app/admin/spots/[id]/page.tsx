import { notFound } from "next/navigation";
import { AdminSpotDetail } from "@/components/admin/admin-spot-detail";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSpotModerationDetail } from "@/lib/admin";

export default async function AdminSpotDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSpotModerationDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Spot detail"
        title="Review one campus spot in depth"
        description="Use this page for duplicate cleanup, metadata edits, and status decisions."
      />
      <AdminSpotDetail {...detail} />
    </div>
  );
}
