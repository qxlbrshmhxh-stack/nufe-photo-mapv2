"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ReportReason, ReportTargetType } from "@/lib/types";

const reasons: ReportReason[] = [
  "wrong location",
  "inappropriate image",
  "spam",
  "duplicate",
  "other"
];

export function ReportButton({
  targetType,
  targetId,
  compact = false
}: {
  targetType: ReportTargetType;
  targetId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("wrong location");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          note
        })
      });

      const result = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit report.");
      }

      setMessage("Report submitted.");
      setNote("");
      setIsOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-coral/35 hover:text-coral ${compact ? "px-3 py-1.5 text-xs" : ""}`}
      >
        <Flag className="h-4 w-4" />
        Report
      </button>

      {isOpen ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft">
          <label className="block space-y-2 text-sm font-medium text-ink">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as ReportReason)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            >
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block space-y-2 text-sm font-medium text-ink">
            Note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Optional details for the admin team."
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm text-moss">{message}</p> : null}
    </div>
  );
}
