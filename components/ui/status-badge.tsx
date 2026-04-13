import { ContentStatus, ReportStatus, SpotLifecycleStatus } from "@/lib/types";

type StatusValue = ContentStatus | SpotLifecycleStatus | ReportStatus;

const statusStyles: Record<StatusValue, string> = {
  pending: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  hidden: "bg-slate-100 text-slate-700",
  rejected: "bg-rose-50 text-rose-700",
  merged: "bg-sky-50 text-sky-700",
  open: "bg-coral/10 text-coral",
  reviewing: "bg-sky-50 text-sky-700",
  resolved: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-700"
};

export function StatusBadge({ status }: { status: StatusValue }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
