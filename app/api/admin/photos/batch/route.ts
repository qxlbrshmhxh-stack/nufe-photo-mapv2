import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { batchUpdatePhotos } from "@/lib/admin";
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

    await batchUpdatePhotos({
      ids: body.ids,
      status: body.status,
      adminUserId: user.id,
      note: body.note
    });

    revalidatePath("/admin");
    revalidatePath("/admin/photos");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to batch update photos."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
