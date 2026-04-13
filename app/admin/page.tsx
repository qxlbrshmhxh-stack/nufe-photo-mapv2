import Link from "next/link";
import { AdminActionHistory } from "@/components/admin/admin-action-history";
import { AdminOverviewGrid } from "@/components/admin/admin-overview-grid";
import { AdminTrendList } from "@/components/admin/admin-trend-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminOverview } from "@/lib/admin";

export default async function AdminPage() {
  const stats = await getAdminOverview();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Overview"
          title="Admin dashboard"
          description="A lightweight operations snapshot for moderation throughput, recent actions, and short-term trends."
        />
        <AdminOverviewGrid stats={stats} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/admin/spots",
            title: "Review spots",
            description: "Approve, hide, reject, or edit spot records."
          },
          {
            href: "/admin/photos",
            title: "Review photos",
            description: "Moderate uploads and adjust titles or captions."
          },
          {
            href: "/admin/reports",
            title: "Review reports",
            description: "Handle user-submitted issues and close the loop."
          },
          {
            href: "/admin/users",
            title: "Manage users",
            description: "Inspect account state, moderation notes, and governance actions."
          },
          {
            href: "/admin/maintenance",
            title: "Maintenance",
            description: "Inspect integrity issues and run safe repair actions."
          }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AdminTrendList
          title="Uploads in the last 7 days"
          description="A quick daily count of new photo submissions."
          points={stats.uploadTrend}
        />
        <AdminTrendList
          title="Reports in the last 7 days"
          description="A quick daily count of user reports reaching the moderation queue."
          points={stats.reportTrend}
        />
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Action history"
          title="Recent admin activity"
          description="A short audit-lite view of the most recent moderation actions."
        />
        <AdminActionHistory actions={stats.recentActions} />
      </section>
    </div>
  );
}
