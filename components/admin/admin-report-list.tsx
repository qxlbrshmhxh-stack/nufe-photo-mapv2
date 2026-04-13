"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Report, ReportStatus } from "@/lib/types";

const reportStatuses: ReportStatus[] = ["reviewing", "resolved", "dismissed"];

export function AdminReportList({
  items,
  statusCounts
}: {
  items: {
    report: Report;
    reporterName: string;
    targetLabel: string;
    targetStatus: string;
    targetHref: string;
    reportCountForTarget: number;
  }[];
  statusCounts: Record<string, number>;
}) {
  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/20 bg-white/80 p-10 text-center text-sm text-ink/65">
        No reports match the current admin filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            ["open", statusCounts.open ?? 0],
            ["reviewing", statusCounts.reviewing ?? 0],
            ["resolved", statusCounts.resolved ?? 0],
            ["dismissed", statusCounts.dismissed ?? 0]
          ].map(([label, count]) => (
            <div key={label} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-ink">
              {label}: {count}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        {items.map((item) => (
          <AdminReportCard key={item.report.id} {...item} />
        ))}
      </div>
    </div>
  );
}

function AdminReportCard({
  report,
  reporterName,
  targetLabel,
  targetStatus,
  targetHref,
  reportCountForTarget
}: {
  report: Report;
  reporterName: string;
  targetLabel: string;
  targetStatus: string;
  targetHref: string;
  reportCountForTarget: number;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [resolutionNote, setResolutionNote] = useState(report.resolution_note ?? "");
  const [internalNote, setInternalNote] = useState(report.internal_note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(nextStatus: ReportStatus) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus,
          resolutionNote,
          internalNote
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update report.");
      }

      setStatus(nextStatus);
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update report.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-[28px] border border-ink/10 bg-white/90 p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">{report.target_type}</p>
            <StatusBadge status={status} />
            {reportCountForTarget > 1 ? (
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                {reportCountForTarget} reports on target
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-2xl font-semibold capitalize">{report.reason}</h3>
          <p className="text-sm text-ink/62">Reporter: {reporterName}</p>
          <p className="text-sm text-ink/62">Target: {targetLabel}</p>
          <p className="text-sm text-ink/62">Target status: {targetStatus}</p>
          <Link href={targetHref} className="inline-flex text-sm font-semibold text-coral">
            Open linked moderation target
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {reportStatuses.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(nextStatus)}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/35 hover:text-moss disabled:opacity-60"
            >
              {nextStatus}
            </button>
          ))}
        </div>
      </div>
      {report.note ? <div className="mt-4 rounded-2xl bg-mist p-4 text-sm leading-6 text-ink/72">{report.note}</div> : null}
      <label className="mt-4 block space-y-2 text-sm font-medium text-ink">
        Internal review note
        <textarea
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="Private context for staff handling this report."
        />
      </label>
      <label className="mt-4 block space-y-2 text-sm font-medium text-ink">
        Resolution note
        <textarea
          value={resolutionNote}
          onChange={(event) => setResolutionNote(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
          placeholder="Add context for why this report was resolved or dismissed."
        />
      </label>
      {message ? <p className="mt-4 text-sm text-moss">{message}</p> : null}
    </article>
  );
}
