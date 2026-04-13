import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertCanModerate } from "@/lib/auth";
import { updateReportModeration } from "@/lib/admin";
import { ReportStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await assertCanModerate();
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: ReportStatus;
      resolutionNote?: string | null;
      internalNote?: string | null;
    };

    if (!body.status) {
      throw new Error("Status is required.");
    }

    await updateReportModeration(id, {
      status: body.status,
      adminUserId: user.id,
      resolutionNote: body.resolutionNote,
      internalNote: body.internalNote
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reports");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update report."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
