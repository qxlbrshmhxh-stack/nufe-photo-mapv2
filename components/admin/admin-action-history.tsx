import { ModerationAction } from "@/lib/types";
import { formatDateTimeLabel } from "@/lib/utils";

export function AdminActionHistory({ actions }: { actions: ModerationAction[] }) {
  if (!actions.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-ink/20 bg-white/80 p-6 text-sm text-ink/60">
        No admin actions have been recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
      <h3 className="font-display text-2xl font-semibold">Recent moderation actions</h3>
      <div className="mt-4 grid gap-3">
        {actions.map((action) => (
          <div key={action.id} className="rounded-2xl bg-mist px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {action.action.replace(/_/g, " ")} on {action.target_type}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-moss">
                {formatDateTimeLabel(action.created_at)}
              </p>
            </div>
            <p className="mt-1 text-sm text-ink/66">
              {action.previous_status || action.new_status
                ? `${action.previous_status ?? "none"} to ${action.new_status ?? "none"}`
                : `target ${action.target_id}`}
            </p>
            {action.note ? <p className="mt-2 text-sm leading-6 text-ink/72">{action.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
