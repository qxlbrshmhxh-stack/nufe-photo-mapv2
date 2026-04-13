import { AdminUserList } from "@/components/admin/admin-user-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminUsers } from "@/lib/profiles";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; role?: string; query?: string }>;
}) {
  const { status = "all", role = "all", query = "" } = await searchParams;
  const { items } = await getAdminUsers({ status, role, query });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Users"
        title="Inspect account governance and staff roles"
        description="Search by nickname or email, inspect upload/report activity, and open the user detail page for governance changes."
      />

      <form className="grid gap-4 rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft md:grid-cols-[220px_220px_1fr_auto]">
        <select name="status" defaultValue={status} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="banned">Banned</option>
        </select>
        <select name="role" defaultValue={role} className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <input name="query" defaultValue={query} placeholder="Search nickname or email" className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Apply filters
        </button>
      </form>

      <AdminUserList items={items} />
    </div>
  );
}
