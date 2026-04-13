import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getAccountFavoriteSpotIds,
  removeAccountFavorite,
  saveAccountFavorite
} from "@/lib/favorites";
import { assertAccountCanAct } from "@/lib/permissions";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";

async function requireAuthenticatedUser() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!user) {
    throw new Error("Please sign in to manage favorites.");
  }

  assertAccountCanAct(profile, "favorite");

  return user;
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const favoriteSpotIds = await getAccountFavoriteSpotIds(user.id);

    return NextResponse.json({
      success: true,
      favoriteSpotIds
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load favorites.";
    return NextResponse.json(
      {
        success: false,
        message
      },
      { status: message.includes("sign in") ? 401 : 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      spotId?: string;
    };

    if (!body.spotId) {
      throw new Error("Missing spotId.");
    }

    await saveAccountFavorite(user.id, body.spotId);
    revalidatePath("/");
    revalidatePath("/user");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save favorite.";
    return NextResponse.json(
      {
        success: false,
        message
      },
      { status: message.includes("sign in") ? 401 : 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      spotId?: string;
    };

    if (!body.spotId) {
      throw new Error("Missing spotId.");
    }

    await removeAccountFavorite(user.id, body.spotId);
    revalidatePath("/");
    revalidatePath("/user");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove favorite.";
    return NextResponse.json(
      {
        success: false,
        message
      },
      { status: message.includes("sign in") ? 401 : 400 }
    );
  }
}
