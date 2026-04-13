import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertCanInspectMaintenance, assertCanRunMaintenanceRepairs } from "@/lib/auth";
import { repairMaintenanceAction } from "@/lib/maintenance";

export async function PATCH(request: Request) {
  try {
    const { user } = await assertCanRunMaintenanceRepairs();
    const body = (await request.json()) as {
      action?:
        | "reassign_photo"
        | "hide_photo"
        | "restore_spot"
        | "restore_photo"
        | "dismiss_report"
        | "fix_merge_reference";
      targetId?: string;
      relatedId?: string;
      note?: string | null;
    };

    if (!body.action || !body.targetId) {
      throw new Error("Action and target id are required.");
    }

    await repairMaintenanceAction({
      action: body.action,
      targetId: body.targetId,
      relatedId: body.relatedId,
      note: body.note,
      adminUserId: user.id
    });

    revalidatePath("/admin");
    revalidatePath("/admin/maintenance");
    revalidatePath("/admin/spots");
    revalidatePath("/admin/photos");
    revalidatePath("/admin/reports");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to run maintenance action."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}

export async function GET() {
  try {
    await assertCanInspectMaintenance();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to verify maintenance access."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
