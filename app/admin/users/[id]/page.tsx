import { notFound } from "next/navigation";
import { AdminUserDetail } from "@/components/admin/admin-user-detail";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireStaff } from "@/lib/auth";
import { canManageRoles } from "@/lib/permissions";
import { getAdminUserDetail } from "@/lib/profiles";

export default async function AdminUserDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireStaff("/");
  const { id } = await params;
  const detail = await getAdminUserDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="User detail"
        title="Review governance state and account activity"
        description="Moderators can manage account status and internal notes. Only admins can change roles."
      />
      <AdminUserDetail detail={detail} canManageRoles={canManageRoles(profile.role)} />
    </div>
  );
}
