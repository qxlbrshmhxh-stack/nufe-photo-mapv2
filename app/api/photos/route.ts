import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { validateSpotDraft, validateUploadFile } from "@/lib/moderation-rules";
import { assertAccountCanAct } from "@/lib/permissions";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";
import { createSupabaseServerClient, getStorageBucketName } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

async function createUniqueSpotSlug(baseName: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(baseName) || "campus-spot";
  let slug = baseSlug;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase.from("spots").select("id").eq("slug", slug).maybeSingle();

    if (error) {
      throw new Error(`Failed to validate spot slug: ${error.message}`);
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

function parseRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function parseOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function parseRequiredNumber(formData: FormData, key: string) {
  const value = Number(parseRequiredString(formData, key));

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number field: ${key}`);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const supabase = await createSupabaseServerClient();
    const bucket = getStorageBucketName();
    const user = await getCurrentUser();
    const profile = await getCurrentProfile();

    if (!user) {
      throw new Error("Please sign in to upload a photo.");
    }

    assertAccountCanAct(profile, "upload");

    const spotMode = parseRequiredString(formData, "spotMode");
    const title = parseRequiredString(formData, "title");
    const photographerName = parseRequiredString(formData, "photographerName");
    const caption = parseOptionalString(formData, "caption");
    const shotTime = parseOptionalString(formData, "shotTime");
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Please select an image file before submitting.");
    }

    validateUploadFile(file);

    let spotId = "";
    let spotSlug = "";
    let publicSpotSlug: string | null = null;
    let photoStatus: "published" | "pending" = "published";

    if (spotMode === "existing") {
      spotId = parseRequiredString(formData, "existingSpotId");

      const { data: existingSpot, error: existingSpotError } = await supabase
        .from("spots")
        .select("id, slug, status")
        .eq("id", spotId)
        .maybeSingle();

      if (existingSpotError) {
        throw new Error(`Failed to validate selected spot: ${existingSpotError.message}`);
      }

      if (!existingSpot) {
        throw new Error("The selected spot could not be found.");
      }

      if (existingSpot.status !== "published") {
        throw new Error("You can only upload to a published campus spot.");
      }

      spotSlug = existingSpot.slug;
      publicSpotSlug = existingSpot.slug;
    } else if (spotMode === "new") {
      const name = parseRequiredString(formData, "newSpotName");
      const description = parseRequiredString(formData, "newSpotDescription");
      const latitude = parseRequiredNumber(formData, "newSpotLatitude");
      const longitude = parseRequiredNumber(formData, "newSpotLongitude");
      const campusArea = parseRequiredString(formData, "newSpotCampusArea");
      const bestTime = parseRequiredString(formData, "newSpotBestTime");
      validateSpotDraft({
        name,
        description,
        latitude,
        longitude,
        campusArea,
        bestTime
      });
      const tips = parseOptionalString(formData, "newSpotTips")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const tags = parseOptionalString(formData, "newSpotTags")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      spotSlug = await createUniqueSpotSlug(name);

      const { data: createdSpot, error: createdSpotError } = await supabase
        .from("spots")
        .insert({
          id: randomUUID(),
          slug: spotSlug,
          name,
          description,
          latitude,
          longitude,
          campus_area: campusArea,
          best_time: bestTime,
          created_by: user.id,
          status: "published",
          tags,
          tips
        })
        .select("id, slug")
        .single();

      if (createdSpotError || !createdSpot) {
        throw new Error(`Failed to create new spot: ${createdSpotError?.message ?? "Unknown error"}`);
      }

      spotId = createdSpot.id;
      spotSlug = createdSpot.slug;
      photoStatus = "published";
    } else {
      throw new Error("Invalid spot mode.");
    }

    const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `photos/${spotId}/${Date.now()}-${randomUUID()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: storageError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false
    });

    if (storageError) {
      throw new Error(`Failed to upload image: ${storageError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    const { error: photoInsertError } = await supabase.from("photos").insert({
      spot_id: spotId,
      user_id: user.id,
      image_url: publicUrlData.publicUrl,
      title,
      caption,
      photographer_name: photographerName || profile?.nickname || user.email?.split("@")[0] || "NUFE Explorer",
      visitor_id: null,
      shot_time: shotTime || null,
      status: photoStatus
    });

    if (photoInsertError) {
      await supabase.storage.from(bucket).remove([filePath]);
      throw new Error(`Failed to save photo record: ${photoInsertError.message}`);
    }

    revalidatePath("/");
    revalidatePath("/upload");
    revalidatePath(`/spots/${spotSlug}`);
    revalidatePath("/user");

    return NextResponse.json({
      success: true,
      spotSlug,
      publicSpotSlug,
      message:
        spotMode === "new"
          ? "Spot created and photo published for prototype testing."
          : "Photo uploaded and published for prototype testing."
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected upload error."
      },
      {
        status: error instanceof Error && error.message.includes("sign in") ? 401 : 400
      }
    );
  }
}
