import { AdminReportList } from "@/components/admin/admin-report-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { getModerationReports } from "@/lib/admin";

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; targetType?: string; sort?: string }>;
}) {
  const { status = "all", targetType = "all", sort = "newest" } = await searchParams;
  const { items, statusCounts } = await getModerationReports({ status, targetType, sort });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Reports"
        title="Review user reports"
        description="Track incoming issues and move them from open to resolved or dismissed."
      />

      <form className="grid gap-4 rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft md:grid-cols-[220px_220px_220px_auto]">
        <select name="status" defaultValue={status} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select name="targetType" defaultValue={targetType} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="all">All targets</option>
          <option value="spot">Spot</option>
          <option value="photo">Photo</option>
        </select>
        <select name="sort" defaultValue={sort} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="status">Status</option>
        </select>
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Apply filters
        </button>
      </form>

      <AdminReportList items={items} statusCounts={statusCounts} />
    </div>
  );
}
