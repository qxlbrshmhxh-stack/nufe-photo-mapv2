import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Favorite, Photo, Spot } from "@/lib/types";

type SpotRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campus_area: string;
  best_time: string;
  status: "published" | "pending" | "hidden";
  tips: string[] | null;
  tags: string[] | null;
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
  status: "published" | "pending" | "hidden";
  created_at: string;
  spots?: {
    id: string;
    slug: string;
    name: string;
    campus_area: string;
  } | null;
};

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
    photoCount,
    createdAt: row.created_at
  };
}

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
    linkedSpot: row.spots
      ? {
          id: row.spots.id,
          slug: row.spots.slug,
          name: row.spots.name,
          campusArea: row.spots.campus_area
        }
      : null,
    created_at: row.created_at
  };
}

async function getPublishedSpotPreviewMap(spotIds: string[]) {
  if (!spotIds.length) {
    return {
      previewMap: new Map<string, string>(),
      countMap: new Map<string, number>()
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("photos")
    .select("spot_id, image_url, created_at")
    .eq("status", "published")
    .in("spot_id", spotIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load favorite previews: ${error.message}`);
  }

  const previewMap = new Map<string, string>();
  const countMap = new Map<string, number>();
  for (const row of data ?? []) {
    countMap.set(row.spot_id, (countMap.get(row.spot_id) ?? 0) + 1);
    if (!previewMap.has(row.spot_id)) {
      previewMap.set(row.spot_id, row.image_url);
    }
  }

  return { previewMap, countMap };
}

export async function getAccountFavoriteSpotIds(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("favorites").select("spot_id").eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to load favorites: ${error.message}`);
  }

  return (data ?? []).map((row) => row.spot_id as string);
}

export async function saveAccountFavorite(userId: string, spotId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: userId,
      spot_id: spotId
    },
    {
      onConflict: "user_id,spot_id"
    }
  );

  if (error) {
    throw new Error(`Failed to save favorite: ${error.message}`);
  }
}

export async function removeAccountFavorite(userId: string, spotId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("spot_id", spotId);

  if (error) {
    throw new Error(`Failed to remove favorite: ${error.message}`);
  }
}

export async function getAccountDashboardData(userId: string) {
  const supabase = await createSupabaseServerClient();
  const [favoritesResponse, uploadsResponse] = await Promise.all([
    supabase.from("favorites").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase
      .from("photos")
      .select("*, spots(id, slug, name, campus_area)")
      .eq("user_id", userId)
      .in("status", ["published", "pending"])
      .order("created_at", { ascending: false })
  ]);

  if (favoritesResponse.error) {
    throw new Error(`Failed to load saved spots: ${favoritesResponse.error.message}`);
  }

  if (uploadsResponse.error) {
    throw new Error(`Failed to load your uploads: ${uploadsResponse.error.message}`);
  }

  const favoriteRows = (favoritesResponse.data ?? []) as Favorite[];
  const favoriteSpotIds = favoriteRows.map((favorite) => favorite.spot_id);

  let savedSpots: Spot[] = [];
  if (favoriteSpotIds.length) {
    const { data: spotRows, error: spotsError } = await supabase
      .from("spots")
      .select("*")
      .in("id", favoriteSpotIds)
      .eq("status", "published");

    if (spotsError) {
      throw new Error(`Failed to load favorite spots: ${spotsError.message}`);
    }

    const { previewMap, countMap } = await getPublishedSpotPreviewMap(favoriteSpotIds);
    savedSpots = ((spotRows ?? []) as SpotRow[]).map((row) =>
      mapSpot(row, previewMap.get(row.id) ?? null, countMap.get(row.id) ?? 0)
    );
  }

  return {
    favoriteSpotIds,
    savedSpots,
    uploadedPhotos: ((uploadsResponse.data ?? []) as PhotoRow[]).map(mapPhoto)
  };
}
