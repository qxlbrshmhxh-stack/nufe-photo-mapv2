import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { batchUpdateSpots } from "@/lib/admin";
import { assertCanModerate } from "@/lib/auth";
import { ContentStatus } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const { user } = await assertCanModerate();
    const body = (await request.json()) as {
      ids?: string[];
      status?: ContentStatus;
      note?: string | null;
    };

    if (!body.ids?.length || !body.status) {
      throw new Error("Selected ids and status are required.");
    }

    await batchUpdateSpots({
      ids: body.ids,
      status: body.status,
      adminUserId: user.id,
      note: body.note
    });

    revalidatePath("/admin");
    revalidatePath("/admin/spots");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to batch update spots."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
