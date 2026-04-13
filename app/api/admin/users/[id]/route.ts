import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertStaffSession } from "@/lib/auth";
import { updateUserGovernance } from "@/lib/profiles";
import { UserRole, UserStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await assertStaffSession();
    const { id } = await context.params;
    const body = (await request.json()) as {
      role?: UserRole;
      status?: UserStatus;
      restrictedUntil?: string | null;
      moderationNote?: string | null;
    };

    await updateUserGovernance({
      actorRole: profile.role,
      targetUserId: id,
      role: body.role,
      status: body.status,
      restrictedUntil: body.restrictedUntil,
      moderationNote: body.moderationNote
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update user governance."
      },
      { status: error instanceof Error && error.message.includes("access") ? 403 : 400 }
    );
  }
}
