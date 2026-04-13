import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/profiles";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient, getStorageBucketName } from "@/lib/supabase-server";

function getStorageObjectPath(imageUrl: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

type LinkedSpot = {
  id: string;
  slug: string;
  created_by: string | null;
};

type OwnedPhoto = {
  id: string;
  user_id: string;
  spot_id: string;
  image_url: string;
  title: string;
  caption: string | null;
  spots?: LinkedSpot[] | null;
};

async function getOwnedPhoto(photoId: string, userId: string): Promise<OwnedPhoto> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, user_id, spot_id, image_url, title, caption, spots(id, slug, created_by)")
    .eq("id", photoId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load photo: ${error.message}`);
  }

  if (!data || data.user_id !== userId) {
    throw new Error("You can only manage your own uploaded photos.");
  }

  return data as OwnedPhoto;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Please sign in to manage your uploads.");
    }

    const { id } = await context.params;
    const payload = (await request.json()) as { title?: string; caption?: string };
    const title = payload.title?.trim() ?? "";
    const caption = payload.caption?.trim() ?? "";

    if (!title) {
      throw new Error("Photo title cannot be empty.");
    }

    const ownedPhoto = await getOwnedPhoto(id, user.id);
    const linkedSpot = ownedPhoto.spots?.[0] ?? null;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("photos")
      .update({
        title,
        caption: caption || null
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(`Failed to update photo: ${error.message}`);
    }

    revalidatePath("/user");
    revalidatePath("/");
    if (linkedSpot?.slug) {
      revalidatePath(`/spots/${linkedSpot.slug}`);
    }

    return NextResponse.json({
      success: true,
      photo: {
        id,
        title,
        caption
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update photo."
      },
      { status: error instanceof Error && error.message.includes("sign in") ? 401 : 400 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Please sign in to manage your uploads.");
    }

    const { id } = await context.params;
    const ownedPhoto = await getOwnedPhoto(id, user.id);
    const linkedSpot = ownedPhoto.spots?.[0] ?? null;

    const supabase = createSupabaseAdminClient();
    const bucket = getStorageBucketName();
    const objectPath = getStorageObjectPath(ownedPhoto.image_url, bucket);

    const { error: photoDeleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (photoDeleteError) {
      throw new Error(`Failed to delete photo: ${photoDeleteError.message}`);
    }

    if (objectPath) {
      const { error: storageDeleteError } = await supabase.storage.from(bucket).remove([objectPath]);

      if (storageDeleteError) {
        throw new Error(`Photo record was removed, but image cleanup failed: ${storageDeleteError.message}`);
      }
    }

    let deletedOwnedSpot = false;
    if (linkedSpot?.id && linkedSpot.created_by === user.id) {
      const { count: remainingPhotoCount, error: countError } = await supabase
        .from("photos")
        .select("id", { count: "exact", head: true })
        .eq("spot_id", ownedPhoto.spot_id);

      if (countError) {
        throw new Error(`Photo deleted, but failed to verify linked spot usage: ${countError.message}`);
      }

      if ((remainingPhotoCount ?? 0) === 0) {
        const { error: spotDeleteError } = await supabase
          .from("spots")
          .delete()
          .eq("id", linkedSpot.id)
          .eq("created_by", user.id);

        if (spotDeleteError) {
          throw new Error(`Photo deleted, but failed to remove the now-empty spot: ${spotDeleteError.message}`);
        }

        deletedOwnedSpot = true;
      }
    }

    revalidatePath("/user");
    revalidatePath("/");
    if (linkedSpot?.slug) {
      revalidatePath(`/spots/${linkedSpot.slug}`);
    }
    revalidatePath("/upload");

    return NextResponse.json({
      success: true,
      deletedOwnedSpot
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete photo."
      },
      { status: error instanceof Error && error.message.includes("sign in") ? 401 : 400 }
    );
  }
}