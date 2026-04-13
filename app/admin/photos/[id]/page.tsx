import { notFound } from "next/navigation";
import { AdminPhotoDetail } from "@/components/admin/admin-photo-detail";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPhotoModerationDetail } from "@/lib/admin";

export default async function AdminPhotoDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPhotoModerationDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Photo detail"
        title="Review one uploaded photo in depth"
        description="Use this page for image inspection, title/caption edits, and moderation decisions."
      />
      <AdminPhotoDetail {...detail} />
    </div>
  );
}
