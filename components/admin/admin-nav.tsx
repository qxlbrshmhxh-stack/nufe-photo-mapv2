import Link from "next/link";
import { canManageRoles, canMergeSpots, canRunMaintenanceRepairs } from "@/lib/permissions";
import { UserRole } from "@/lib/types";

export function AdminNav({ role }: { role: UserRole }) {
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/spots", label: "Spots" },
    ...(canMergeSpots(role) ? [{ href: "/admin/spots/merge", label: "Merge" }] : []),
    { href: "/admin/photos", label: "Photos" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/maintenance", label: canRunMaintenanceRepairs(role) ? "Maintenance" : "Issues" },
    ...(canManageRoles(role) ? [{ href: "/admin/setup", label: "Setup" }] : [])
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/35 hover:text-moss"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
