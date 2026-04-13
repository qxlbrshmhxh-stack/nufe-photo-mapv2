import { AdminMaintenancePanel } from "@/components/admin/admin-maintenance-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireStaff } from "@/lib/auth";
import { canRunMaintenanceRepairs } from "@/lib/permissions";
import { getMaintenanceIssues } from "@/lib/maintenance";

export default async function AdminMaintenancePage() {
  const { profile } = await requireStaff("/");
  const issues = await getMaintenanceIssues();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Maintenance"
        title="Inspect integrity issues and run safe repairs"
        description="This page surfaces common operational problems and gives admins explicit repair actions."
      />
      <AdminMaintenancePanel issues={issues} canRepair={canRunMaintenanceRepairs(profile.role)} />
    </div>
  );
}
