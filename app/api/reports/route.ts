import { NextResponse } from "next/server";
import { REPORT_COOLDOWN_HOURS } from "@/lib/moderation-rules";
import { assertAccountCanAct } from "@/lib/permissions";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ReportReason, ReportTargetType } from "@/lib/types";

const validReasons: ReportReason[] = [
  "wrong location",
  "inappropriate image",
  "spam",
  "duplicate",
  "other"
];

export async function POST(request: Request) {
  try {
    const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

    if (!user) {
      throw new Error("Please sign in to submit a report.");
    }

    assertAccountCanAct(profile, "report");

    const body = (await request.json()) as {
      targetType?: ReportTargetType;
      targetId?: string;
      reason?: ReportReason;
      note?: string;
    };

    if (!body.targetType || !body.targetId || !body.reason) {
      throw new Error("Missing targetType, targetId, or reason.");
    }

    if (!["spot", "photo"].includes(body.targetType)) {
      throw new Error("Invalid report target.");
    }

    if (!validReasons.includes(body.reason)) {
      throw new Error("Invalid report reason.");
    }

    const supabase = await createSupabaseServerClient();
    const cooldownSince = new Date(Date.now() - REPORT_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    const { data: existingRecentReport, error: recentReportError } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_user_id", user.id)
      .eq("target_type", body.targetType)
      .eq("target_id", body.targetId)
      .in("status", ["open", "reviewing"])
      .gte("created_at", cooldownSince)
      .maybeSingle();

    if (recentReportError) {
      throw new Error(`Failed to validate report cooldown: ${recentReportError.message}`);
    }

    if (existingRecentReport) {
      throw new Error("You already reported this item recently. Please wait before submitting again.");
    }

    const { error } = await supabase.from("reports").insert({
      reporter_user_id: user.id,
      target_type: body.targetType,
      target_id: body.targetId,
      reason: body.reason,
      note: body.note?.trim() || null
    });

    if (error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit report.";

    return NextResponse.json(
      {
        success: false,
        message
      },
      {
        status: message.includes("sign in") ? 401 : 400
      }
    );
  }
}
