import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/profiles";

export async function GET() {
  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in first."
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load profile."
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      nickname?: string;
      avatarUrl?: string;
      bio?: string;
    };

    if (!body.nickname?.trim()) {
      throw new Error("Nickname is required.");
    }

    const profile = await updateCurrentProfile({
      nickname: body.nickname,
      avatarUrl: body.avatarUrl ?? "",
      bio: body.bio ?? ""
    });

    revalidatePath("/user");

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile.";
    const status = message.includes("sign in") ? 401 : 400;

    return NextResponse.json(
      {
        success: false,
        message
      },
      { status }
    );
  }
}
