import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getRestoredStatus, isMergedSpotStatus } from "@/lib/moderation-rules";
import { MaintenanceIssue } from "@/lib/types";
import { logModerationAction } from "@/lib/admin";

type SpotLiteRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  merged_into_spot_id: string | null;
  canonical_spot_id: string | null;
};

function createIssue(
  key: string,
  title: string,
  description: string,
  items: MaintenanceIssue["items"]
): MaintenanceIssue {
  return {
    key,
    title,
    description,
    count: items.length,
    items
  };
}

export async function getMergeableSpots() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spots")
    .select("id, slug, name, status, latitude, longitude, merged_into_spot_id, canonical_spot_id")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load spots for merge UI: ${error.message}`);
  }

  return (data ?? []) as SpotLiteRow[];
}

export async function getSpotMergePreview(sourceSpotId: string, targetSpotId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: source, error: sourceError }, { data: target, error: targetError }, photos, favorites] =
    await Promise.all([
      supabase.from("spots").select("id, slug, name, status, campus_area, best_time").eq("id", sourceSpotId).maybeSingle(),
      supabase.from("spots").select("id, slug, name, status, campus_area, best_time").eq("id", targetSpotId).maybeSingle(),
      supabase.from("photos").select("id", { count: "exact", head: false }).eq("spot_id", sourceSpotId),
      supabase.from("favorites").select("id", { count: "exact", head: false }).eq("spot_id", sourceSpotId)
    ]);

  if (sourceError || targetError || photos.error || favorites.error) {
    throw new Error(
      sourceError?.message || targetError?.message || photos.error?.message || favorites.error?.message || "Failed to load merge preview."
    );
  }

  if (!source || !target) {
    throw new Error("Source or target spot could not be found.");
  }

  return {
    source,
    target,
    sourcePhotoCount: photos.count ?? 0,
    sourceFavoriteCount: favorites.count ?? 0,
    risks: [
      source.status !== "published" ? "Source spot is already not public." : null,
      isMergedSpotStatus(target.status) ? "Target spot is already merged and should not be used as canonical." : null,
      source.id === target.id ? "Source and target cannot be the same spot." : null
    ].filter(Boolean) as string[]
  };
}

export async function mergeSpots(input: {
  sourceSpotId: string;
  targetSpotId: string;
  adminUserId: string;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (input.sourceSpotId === input.targetSpotId) {
    throw new Error("Source and target spots must be different.");
  }

  const { source, target } = await getSpotMergePreview(input.sourceSpotId, input.targetSpotId);

  if (isMergedSpotStatus(source.status)) {
    throw new Error("Source spot is already merged.");
  }

  if (isMergedSpotStatus(target.status)) {
    throw new Error("Target spot cannot be a merged spot.");
  }

  const [sourceFavoritesResponse, targetFavoritesResponse] = await Promise.all([
    supabase.from("favorites").select("id, user_id, visitor_id").eq("spot_id", input.sourceSpotId),
    supabase.from("favorites").select("id, user_id, visitor_id").eq("spot_id", input.targetSpotId)
  ]);

  if (sourceFavoritesResponse.error || targetFavoritesResponse.error) {
    throw new Error(
      sourceFavoritesResponse.error?.message || targetFavoritesResponse.error?.message || "Failed to reconcile favorites."
    );
  }

  const targetFavoriteKeys = new Set(
    (targetFavoritesResponse.data ?? []).map((favorite) => `${favorite.user_id ?? ""}:${favorite.visitor_id ?? ""}`)
  );

  for (const favorite of sourceFavoritesResponse.data ?? []) {
    const key = `${favorite.user_id ?? ""}:${favorite.visitor_id ?? ""}`;
    if (targetFavoriteKeys.has(key)) {
      const { error } = await supabase.from("favorites").delete().eq("id", favorite.id);
      if (error) {
        throw new Error(`Failed to remove duplicate favorite during merge: ${error.message}`);
      }
      continue;
    }

    const { error } = await supabase.from("favorites").update({ spot_id: input.targetSpotId }).eq("id", favorite.id);
    if (error) {
      throw new Error(`Failed to move favorite during merge: ${error.message}`);
    }
  }

  const { error: movePhotosError } = await supabase
    .from("photos")
    .update({ spot_id: input.targetSpotId })
    .eq("spot_id", input.sourceSpotId);

  if (movePhotosError) {
    throw new Error(`Failed to reassign photos during merge: ${movePhotosError.message}`);
  }

  const mergedAt = new Date().toISOString();
  const { error: sourceUpdateError } = await supabase
    .from("spots")
    .update({
      status: "merged",
      merged_into_spot_id: input.targetSpotId,
      merged_at: mergedAt,
      merged_by: input.adminUserId,
      duplicate_of: input.targetSpotId,
      canonical_spot_id: input.targetSpotId,
      is_duplicate: true,
      reviewed_by: input.adminUserId,
      reviewed_at: mergedAt
    })
    .eq("id", input.sourceSpotId);

  if (sourceUpdateError) {
    throw new Error(`Failed to mark source spot as merged: ${sourceUpdateError.message}`);
  }

  const { error: targetUpdateError } = await supabase
    .from("spots")
    .update({
      canonical_spot_id: null,
      is_duplicate: false
    })
    .eq("id", input.targetSpotId);

  if (targetUpdateError) {
    throw new Error(`Failed to normalize target spot after merge: ${targetUpdateError.message}`);
  }

  const { error: mergeLogError } = await supabase.from("spot_merges").insert({
    source_spot_id: input.sourceSpotId,
    target_spot_id: input.targetSpotId,
    admin_user_id: input.adminUserId,
    note: input.note ?? null
  });

  if (mergeLogError) {
    throw new Error(`Failed to save merge log: ${mergeLogError.message}`);
  }

  await logModerationAction({
    adminUserId: input.adminUserId,
    targetType: "spot",
    targetId: input.sourceSpotId,
    action: "merge_spot",
    previousStatus: source.status,
    newStatus: "merged",
    note: input.note ?? `Merged into ${target.name}`
  });

  return {
    source,
    target
  };
}

export async function getMaintenanceIssues(): Promise<MaintenanceIssue[]> {
  const supabase = createSupabaseAdminClient();
  const [photosWithSpots, allSpots, reports, favorites, allPhotos] = await Promise.all([
    supabase.from("photos").select("id, title, status, spot_id, spots(id, name, status)"),
    supabase.from("spots").select("id, name, slug, status, latitude, longitude, merged_into_spot_id, canonical_spot_id"),
    supabase.from("reports").select("id, target_id, target_type, status"),
    supabase.from("favorites").select("id, user_id, visitor_id, spot_id"),
    supabase.from("photos").select("id")
  ]);

  if (photosWithSpots.error || allSpots.error || reports.error || favorites.error || allPhotos.error) {
    throw new Error(
      photosWithSpots.error?.message ||
        allSpots.error?.message ||
        reports.error?.message ||
        favorites.error?.message ||
        allPhotos.error?.message ||
        "Failed to load maintenance issues."
    );
  }

  const spotRows = (allSpots.data ?? []) as SpotLiteRow[];
  const spotIdSet = new Set(spotRows.map((spot) => spot.id));
  const photoIdSet = new Set((allPhotos.data ?? []).map((photo) => photo.id));
  const photosOnNonPublicSpots = (photosWithSpots.data ?? [])
    .filter((photo) => !photo.spots || photo.spots.status !== "published")
    .map((photo) => ({
      id: photo.id,
      label: photo.title,
      href: `/admin/photos/${photo.id}`,
      detail: photo.spots ? `spot status: ${photo.spots.status}` : "missing spot"
    }));

  const spotsWithZeroPhotos = spotRows
    .filter((spot) => !isMergedSpotStatus(spot.status))
    .filter((spot) => !(photosWithSpots.data ?? []).some((photo) => photo.spot_id === spot.id))
    .map((spot) => ({
      id: spot.id,
      label: spot.name,
      href: `/admin/spots/${spot.id}`,
      detail: "no linked photos"
    }));

  const spotsMissingCoordinates = spotRows
    .filter((spot) => spot.latitude === null || spot.longitude === null)
    .map((spot) => ({
      id: spot.id,
      label: spot.name,
      href: `/admin/spots/${spot.id}`,
      detail: "missing coordinates"
    }));

  const mergedSpotsWithoutTarget = spotRows
    .filter((spot) => isMergedSpotStatus(spot.status) && (!spot.merged_into_spot_id || !spotIdSet.has(spot.merged_into_spot_id)))
    .map((spot) => ({
      id: spot.id,
      label: spot.name,
      href: `/admin/spots/${spot.id}`,
      detail: "merged spot missing canonical target"
    }));

  const reportsWithMissingTargets = (reports.data ?? [])
    .filter((report) =>
      report.target_type === "spot" ? !spotIdSet.has(report.target_id) : !photoIdSet.has(report.target_id)
    )
    .map((report) => ({
      id: report.id,
      label: `Report ${report.id.slice(0, 8)}`,
      href: "/admin/reports",
      detail: `${report.target_type} target is missing`
    }));

  const favoriteKeys = new Map<string, number>();
  const duplicateFavorites = (favorites.data ?? []).filter((favorite) => {
    const key = `${favorite.user_id ?? ""}:${favorite.visitor_id ?? ""}:${favorite.spot_id}`;
    favoriteKeys.set(key, (favoriteKeys.get(key) ?? 0) + 1);
    return favoriteKeys.get(key)! > 1;
  }).map((favorite) => ({
    id: favorite.id,
    label: `Favorite ${favorite.id.slice(0, 8)}`,
    href: "/admin/maintenance",
    detail: "duplicate favorite link"
  }));

  return [
    createIssue("photos-on-non-public-spots", "Photos on non-public spots", "These photos are linked to hidden, rejected, merged, or missing spots.", photosOnNonPublicSpots),
    createIssue("spots-zero-photos", "Spots with zero photos", "These spots may need more examples or may be low-value records.", spotsWithZeroPhotos),
    createIssue("spots-missing-coordinates", "Spots with missing coordinates", "These spots cannot be mapped reliably.", spotsMissingCoordinates),
    createIssue("broken-merged-spots", "Merged spots with broken canonical target", "These merged spots need canonical reference repair.", mergedSpotsWithoutTarget),
    createIssue("reports-missing-targets", "Reports pointing to missing targets", "These reports can usually be dismissed after validation.", reportsWithMissingTargets),
    createIssue("duplicate-favorites", "Duplicate favorites", "These usually come from earlier data before stronger constraints were in place.", duplicateFavorites)
  ];
}

export async function repairMaintenanceAction(input: {
  action: "reassign_photo" | "hide_photo" | "restore_spot" | "restore_photo" | "dismiss_report" | "fix_merge_reference";
  adminUserId: string;
  targetId: string;
  relatedId?: string;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (input.action === "reassign_photo") {
    if (!input.relatedId) {
      throw new Error("A target spot id is required to reassign a photo.");
    }

    const { error } = await supabase.from("photos").update({ spot_id: input.relatedId }).eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to reassign photo: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "photo",
      targetId: input.targetId,
      action: "edit_photo",
      note: input.note ?? `Reassigned photo to spot ${input.relatedId}`
    });
    return;
  }

  if (input.action === "hide_photo") {
    const { error } = await supabase
      .from("photos")
      .update({ status: "hidden", reviewed_by: input.adminUserId, reviewed_at: new Date().toISOString() })
      .eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to hide photo: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "photo",
      targetId: input.targetId,
      action: "hide",
      newStatus: "hidden",
      note: input.note ?? null
    });
    return;
  }

  if (input.action === "restore_spot") {
    const { error } = await supabase
      .from("spots")
      .update({
        status: getRestoredStatus(),
        duplicate_of: null,
        canonical_spot_id: null,
        is_duplicate: false,
        merged_into_spot_id: null,
        merged_at: null,
        merged_by: null,
        reviewed_by: input.adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to restore spot: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "spot",
      targetId: input.targetId,
      action: "restore",
      newStatus: getRestoredStatus(),
      note: input.note ?? null
    });
    return;
  }

  if (input.action === "restore_photo") {
    const { error } = await supabase
      .from("photos")
      .update({
        status: getRestoredStatus(),
        reviewed_by: input.adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to restore photo: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "photo",
      targetId: input.targetId,
      action: "restore",
      newStatus: getRestoredStatus(),
      note: input.note ?? null
    });
    return;
  }

  if (input.action === "dismiss_report") {
    const { error } = await supabase
      .from("reports")
      .update({
        status: "dismissed",
        resolution_note: input.note ?? "Dismissed during maintenance review.",
        reviewed_by: input.adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to dismiss report: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "report",
      targetId: input.targetId,
      action: "dismiss_report",
      newStatus: "dismissed",
      note: input.note ?? null
    });
    return;
  }

  if (input.action === "fix_merge_reference") {
    if (!input.relatedId) {
      throw new Error("A canonical spot id is required to fix merge references.");
    }

    const { error } = await supabase
      .from("spots")
      .update({
        merged_into_spot_id: input.relatedId,
        canonical_spot_id: input.relatedId,
        duplicate_of: input.relatedId,
        is_duplicate: true,
        status: "merged",
        merged_by: input.adminUserId,
        merged_at: new Date().toISOString(),
        reviewed_by: input.adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", input.targetId);
    if (error) {
      throw new Error(`Failed to fix merge reference: ${error.message}`);
    }
    await logModerationAction({
      adminUserId: input.adminUserId,
      targetType: "spot",
      targetId: input.targetId,
      action: "set_canonical",
      newStatus: "merged",
      note: input.note ?? `Canonical target fixed to ${input.relatedId}`
    });
  }
}
