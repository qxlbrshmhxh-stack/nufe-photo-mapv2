"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaintenanceIssue } from "@/lib/types";

export function AdminMaintenancePanel({
  issues,
  canRepair
}: {
  issues: MaintenanceIssue[];
  canRepair: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState("restore_photo");
  const [targetId, setTargetId] = useState("");
  const [relatedId, setRelatedId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRepair() {
    if (!targetId.trim()) {
      setMessage("Target id is required.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          targetId,
          relatedId: relatedId || undefined,
          note
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to run maintenance action.");
      }

      setMessage("Maintenance action completed.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to run maintenance action.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        {issues.map((issue) => (
          <div key={issue.key} className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold">{issue.title}</h3>
              <span className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-ink">{issue.count}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/66">{issue.description}</p>
            <div className="mt-4 grid gap-2">
              {issue.items.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-2xl bg-mist px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-coral">
                        Inspect
                      </a>
                    ) : null}
                  </div>
                  {item.detail ? <p className="mt-1 text-sm text-ink/66">{item.detail}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Repair action</h3>
        <p className="mt-2 text-sm leading-6 text-ink/66">
          Use this for explicit safe repairs like restore, reassign, dismiss, or fixing a broken merge link.
        </p>
        {!canRepair ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-mist/70 px-4 py-3 text-sm text-ink/65">
            Moderators can inspect these issues, but only admins can run repair actions.
          </div>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink">
            Action
            <select value={action} onChange={(event) => setAction(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none">
              <option value="reassign_photo">Reassign photo</option>
              <option value="hide_photo">Hide photo</option>
              <option value="restore_spot">Restore spot</option>
              <option value="restore_photo">Restore photo</option>
              <option value="dismiss_report">Dismiss report</option>
              <option value="fix_merge_reference">Fix merge reference</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Target id
            <input value={targetId} onChange={(event) => setTargetId(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Related id
            <input
              value={relatedId}
              onChange={(event) => setRelatedId(event.target.value)}
              placeholder="Needed for photo reassignment or fixing merge reference"
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink">
            Note
            <input value={note} onChange={(event) => setNote(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting || !canRepair}
            onClick={handleRepair}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Running..." : "Run repair action"}
          </button>
          {message ? <p className="text-sm text-moss">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}
