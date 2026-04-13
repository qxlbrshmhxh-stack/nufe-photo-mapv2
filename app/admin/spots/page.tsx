import { AdminSpotList } from "@/components/admin/admin-spot-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { getModerationSpots } from "@/lib/admin";

export default async function AdminSpotsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; query?: string; sort?: string }>;
}) {
  const { status = "all", query = "", sort = "newest" } = await searchParams;
  const { spots, statusCounts } = await getModerationSpots({ status, query, sort });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Spots"
        title="Moderate campus spots"
        description="Filter by status, search by name, and review possible duplicate locations."
      />

      <form className="grid gap-4 rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft md:grid-cols-[220px_1fr_220px_auto]">
        <select name="status" defaultValue={status} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
          <option value="rejected">Rejected</option>
          <option value="merged">Merged</option>
        </select>
        <input name="query" defaultValue={query} placeholder="Search spot name" className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
        <select name="sort" defaultValue={sort} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="status">Status</option>
        </select>
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Apply filters
        </button>
      </form>

      <AdminSpotList spots={spots} statusCounts={statusCounts} />
    </div>
  );
}
