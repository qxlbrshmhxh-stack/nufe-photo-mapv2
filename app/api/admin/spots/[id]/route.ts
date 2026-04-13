import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertCanModerate } from "@/lib/auth";
import { updateSpotModeration } from "@/lib/admin";
import { ContentStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await assertCanModerate();
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: ContentStatus;
      name?: string;
      description?: string;
      campusArea?: string;
      bestTime?: string;
      latitude?: number;
      longitude?: number;
      canonicalSpotId?: string | null;
      duplicateOf?: string | null;
      isDuplicate?: boolean;
      note?: string | null;
      moderationNote?: string | null;
      rejectionReason?: string | null;
      hideReason?: string | null;
      isFeatured?: boolean;
    };

    if (!body.status) {
      throw new Error("Status is required.");
    }

    await updateSpotModeration(id, {
      status: body.status,
      adminUserId: user.id,
      name: body.name,
      description: body.description,
      campusArea: body.campusArea,
      bestTime: body.bestTime,
      latitude: body.latitude,
      longitude: body.longitude,
      canonicalSpotId: body.canonicalSpotId,
      duplicateOf: body.duplicateOf,
      isDuplicate: body.isDuplicate,
      note: body.note,
      moderationNote: body.moderationNote,
      rejectionReason: body.rejectionReason,
      hideReason: body.hideReason,
      isFeatured: body.isFeatured
    });

    revalidatePath("/admin");
    revalidatePath("/admin/spots");
    revalidatePath(`/admin/spots/${id}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update spot."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
