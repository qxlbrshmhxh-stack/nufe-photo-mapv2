import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertCanMergeSpots } from "@/lib/auth";
import { mergeSpots } from "@/lib/maintenance";

export async function POST(request: Request) {
  try {
    const { user } = await assertCanMergeSpots();
    const body = (await request.json()) as {
      sourceSpotId?: string;
      targetSpotId?: string;
      note?: string | null;
    };

    if (!body.sourceSpotId || !body.targetSpotId) {
      throw new Error("Source and target spot ids are required.");
    }

    const result = await mergeSpots({
      sourceSpotId: body.sourceSpotId,
      targetSpotId: body.targetSpotId,
      adminUserId: user.id,
      note: body.note
    });

    revalidatePath("/admin");
    revalidatePath("/admin/spots");
    revalidatePath(`/admin/spots/${body.sourceSpotId}`);
    revalidatePath(`/admin/spots/${body.targetSpotId}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Merged ${result.source.name} into ${result.target.name}.`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to merge spots."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
