import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertCanModerate } from "@/lib/auth";
import { updatePhotoModeration } from "@/lib/admin";
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
      title?: string;
      caption?: string;
      note?: string | null;
      moderationNote?: string | null;
      rejectionReason?: string | null;
      hideReason?: string | null;
      isFeatured?: boolean;
    };

    if (!body.status) {
      throw new Error("Status is required.");
    }

    await updatePhotoModeration(id, {
      status: body.status,
      adminUserId: user.id,
      title: body.title,
      caption: body.caption,
      note: body.note,
      moderationNote: body.moderationNote,
      rejectionReason: body.rejectionReason,
      hideReason: body.hideReason,
      isFeatured: body.isFeatured
    });

    revalidatePath("/admin");
    revalidatePath("/admin/photos");
    revalidatePath(`/admin/photos/${id}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update photo."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
