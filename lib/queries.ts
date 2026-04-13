import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPublicPhotoQueryStatuses, getPublicSpotQueryStatuses, isMergedSpotStatus } from "@/lib/moderation-rules";
import { Photo, RecentPhotoItem, Spot, SpotWithPhotos } from "@/lib/types";

type SpotRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campus_area: string;
  best_time: string;
  status: "published" | "pending" | "hidden" | "rejected" | "merged";
  tips: string[] | null;
  tags: string[] | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  canonical_spot_id: string | null;
  duplicate_of: string | null;
  is_duplicate: boolean;
  merged_into_spot_id: string | null;
  merged_at: string | null;
  merged_by: string | null;
  moderation_note: string | null;
  rejection_reason: string | null;
  hide_reason: string | null;
  is_featured: boolean;
  featured_at: string | null;
  created_at: string;
};

type PhotoRow = {
  id: string;
  spot_id: string;
  user_id: string | null;
  image_url: string;
  title: string;
  caption: string | null;
  photographer_name: string;
  visitor_id: string | null;
  shot_time: string | null;
  status: "published" | "pending" | "hidden" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  moderation_note: string | null;
  rejection_reason: string | null;
  hide_reason: string | null;
  is_featured: boolean;
  featured_at: string | null;
  created_at: string;
};

function mapPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    spot_id: row.spot_id,
    user_id: row.user_id,
    image_url: row.image_url,
    title: row.title,
    caption: row.caption ?? "",
    photographer_name: row.photographer_name,
    visitor_id: row.visitor_id,
    shot_time: row.shot_time ?? "",
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    moderation_note: row.moderation_note,
    rejection_reason: row.rejection_reason,
    hide_reason: row.hide_reason,
    is_featured: row.is_featured,
    featured_at: row.featured_at,
    created_at: row.created_at
  };
}

function mapSpot(row: SpotRow, previewImage: string | null, photoCount = 0): Spot {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    campusArea: row.campus_area,
    bestTime: row.best_time,
    previewImage,
    tags: row.tags ?? [],
    tips: row.tips ?? [],
    status: row.status,
    createdBy: row.created_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    canonicalSpotId: row.canonical_spot_id,
    duplicateOf: row.duplicate_of,
    isDuplicate: row.is_duplicate,
    mergedIntoSpotId: row.merged_into_spot_id,
    mergedAt: row.merged_at,
    mergedBy: row.merged_by,
    moderationNote: row.moderation_note,
    rejectionReason: row.rejection_reason,
    hideReason: row.hide_reason,
    isFeatured: row.is_featured,
    featuredAt: row.featured_at,
    photoCount,
    createdAt: row.created_at
  };
}

async function getBannedUserIds() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id").eq("status", "banned");

  if (error) {
    throw new Error(`Failed to load banned users: ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.id));
}

async function getSpotPreviewMap(spotIds: string[]) {
  if (!spotIds.length) {
    return {
      previewMap: new Map<string, string>(),
      countMap: new Map<string, number>()
    };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data, error }, bannedUserIds] = await Promise.all([
    supabase
    .from("photos")
    .select("spot_id, image_url, created_at, user_id")
    .in("status", getPublicPhotoQueryStatuses())
    .in("spot_id", spotIds)
    .order("created_at", { ascending: false }),
    getBannedUserIds()
  ]);

  if (error) {
    throw new Error(`Failed to load spot previews: ${error.message}`);
  }

  const previewMap = new Map<string, string>();
  const countMap = new Map<string, number>();
  for (const row of (data ?? []).filter((item) => !item.user_id || !bannedUserIds.has(item.user_id))) {
    countMap.set(row.spot_id, (countMap.get(row.spot_id) ?? 0) + 1);
    if (!previewMap.has(row.spot_id)) {
      previewMap.set(row.spot_id, row.image_url);
    }
  }

  return { previewMap, countMap };
}

export async function getSpots(): Promise<Spot[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .in("status", getPublicSpotQueryStatuses())
    .order("is_featured", { ascending: false })
    .order("featured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load spots: ${error.message}`);
  }

  const rows = (data ?? []) as SpotRow[];
  const { previewMap, countMap } = await getSpotPreviewMap(rows.map((row) => row.id));

  return rows.map((row) => mapSpot(row, previewMap.get(row.id) ?? null, countMap.get(row.id) ?? 0));
}

export async function getFeaturedSpots(limit = 4): Promise<Spot[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("is_featured", true)
    .in("status", getPublicSpotQueryStatuses())
    .order("featured_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load featured spots: ${error.message}`);
  }

  const rows = (data ?? []) as SpotRow[];
  const { previewMap, countMap } = await getSpotPreviewMap(rows.map((row) => row.id));
  return rows.map((row) => mapSpot(row, previewMap.get(row.id) ?? null, countMap.get(row.id) ?? 0));
}

export async function getSpotBySlug(slug: string): Promise<{ spot: SpotWithPhotos | null; redirectSlug: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("spots").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`Failed to load spot: ${error.message}`);
  }

  if (!data) {
    return { spot: null, redirectSlug: null };
  }

  const row = data as SpotRow;

  if (isMergedSpotStatus(row.status) && row.merged_into_spot_id) {
    const { data: mergedTarget, error: mergedTargetError } = await supabase
      .from("spots")
      .select("slug")
      .eq("id", row.merged_into_spot_id)
      .maybeSingle();

    if (mergedTargetError) {
      throw new Error(`Failed to load merged target: ${mergedTargetError.message}`);
    }

    return {
      spot: null,
      redirectSlug: mergedTarget?.slug ?? null
    };
  }

  if (!getPublicSpotQueryStatuses().includes(row.status)) {
    return { spot: null, redirectSlug: null };
  }

  const photos = await getPhotosBySpotId(row.id);
  return {
    redirectSlug: null,
    spot: {
      ...mapSpot(row, photos[0]?.image_url ?? null, photos.length),
      gallery: photos.map((photo) => photo.image_url),
      photos
    }
  };
}

export async function getPhotosBySpotId(spotId: string): Promise<Photo[]> {
  const supabase = await createSupabaseServerClient();
  const { data: spotRow, error: spotError } = await supabase.from("spots").select("status").eq("id", spotId).maybeSingle();

  if (spotError) {
    throw new Error(`Failed to validate spot for photos: ${spotError.message}`);
  }

  if (!spotRow || !getPublicSpotQueryStatuses().includes(spotRow.status)) {
    return [];
  }

  const [{ data, error }, bannedUserIds] = await Promise.all([
    supabase
      .from("photos")
      .select("*")
      .eq("spot_id", spotId)
      .in("status", getPublicPhotoQueryStatuses())
      .order("created_at", { ascending: false }),
    getBannedUserIds()
  ]);

  if (error) {
    throw new Error(`Failed to load spot photos: ${error.message}`);
  }

  return ((data ?? []) as PhotoRow[])
    .filter((row) => !row.user_id || !bannedUserIds.has(row.user_id))
    .map(mapPhoto);
}

export async function getRelatedSpots(currentSpot: Spot, limit = 4): Promise<Spot[]> {
  const spots = await getSpots();

  return spots
    .filter((spot) => spot.id !== currentSpot.id && spot.campusArea === currentSpot.campusArea)
    .slice(0, limit);
}

export async function getRecentPublishedPhotos(limit = 6): Promise<RecentPhotoItem[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data, error }, bannedUserIds] = await Promise.all([
    supabase
      .from("photos")
      .select("*, spots(id, slug, name, campus_area, status)")
      .in("status", getPublicPhotoQueryStatuses())
      .order("is_featured", { ascending: false })
      .order("featured_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit),
    getBannedUserIds()
  ]);

  if (error) {
    throw new Error(`Failed to load recent published photos: ${error.message}`);
  }

  return ((data ?? []) as (PhotoRow & {
    spots?: { id: string; slug: string; name: string; campus_area: string; status: string } | null;
  })[])
    .filter((row) => row.spots?.status === "published")
    .filter((row) => !row.user_id || !bannedUserIds.has(row.user_id))
    .map((row) => ({
      photo: mapPhoto(row),
      spot: {
        id: row.spots!.id,
        slug: row.spots!.slug,
        name: row.spots!.name,
        campusArea: row.spots!.campus_area
      }
    }));
}
