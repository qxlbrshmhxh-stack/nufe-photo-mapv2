import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  AdminOverviewStats,
  ContentStatus,
  DuplicateCandidate,
  ModerationAction,
  ModerationActionName,
  Photo,
  Report,
  ReportStatus,
  Spot,
  SpotLifecycleStatus
} from "@/lib/types";

type SpotRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campus_area: string;
  best_time: string;
  created_by: string | null;
  status: SpotLifecycleStatus;
  tips: string[] | null;
  tags: string[] | null;
  canonical_spot_id: string | null;
  duplicate_of: string | null;
  is_duplicate: boolean;
  merged_into_spot_id: string | null;
  merged_at: string | null;
  merged_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
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
  status: ContentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  moderation_note: string | null;
  rejection_reason: string | null;
  hide_reason: string | null;
  is_featured: boolean;
  featured_at: string | null;
  created_at: string;
  spots?: {
    id: string;
    name: string;
    slug: string;
    status: ContentStatus;
  } | null;
};

type ReportRow = {
  id: string;
  reporter_user_id: string;
  target_type: "spot" | "photo";
  target_id: string;
  reason: Report["reason"];
  note: string | null;
  status: ReportStatus;
  resolution_note: string | null;
  internal_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type ModerationActionRow = {
  id: string;
  admin_user_id: string;
  target_type: "spot" | "photo" | "report";
  target_id: string;
  action: ModerationActionName;
  previous_status: string | null;
  new_status: string | null;
  note: string | null;
  created_at: string;
};

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDayKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function createDailyTrend(rows: { created_at: string }[], days = 7) {
  const today = startOfDay();
  const buckets = new Map<string, number>();

  for (let index = days - 1; index >= 0; index -= 1) {
    const bucketDate = new Date(today);
    bucketDate.setDate(today.getDate() - index);
    buckets.set(formatDayKey(bucketDate), 0);
  }

  for (const row of rows) {
    const key = formatDayKey(row.created_at);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
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

function mapReport(row: ReportRow): Report & { resolution_note?: string | null } {
  return {
    id: row.id,
    reporter_user_id: row.reporter_user_id,
    target_type: row.target_type,
    target_id: row.target_id,
    reason: row.reason,
    note: row.note,
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    resolution_note: row.resolution_note,
    internal_note: row.internal_note
  };
}

function mapAction(row: ModerationActionRow): ModerationAction {
  return {
    id: row.id,
    admin_user_id: row.admin_user_id,
    target_type: row.target_type,
    target_id: row.target_id,
    action: row.action,
    previous_status: row.previous_status,
    new_status: row.new_status,
    note: row.note,
    created_at: row.created_at
  };
}

function findDuplicateCandidates(target: SpotRow, rows: SpotRow[]): DuplicateCandidate[] {
  return rows
    .filter((candidate) => candidate.id !== target.id)
    .map((candidate) => {
      const normalizedTarget = target.name.toLowerCase();
      const normalizedCandidate = candidate.name.toLowerCase();
      const nameSimilar =
        normalizedCandidate.includes(normalizedTarget) || normalizedTarget.includes(normalizedCandidate);
      const latitudeGap = Math.abs(candidate.latitude - target.latitude);
      const longitudeGap = Math.abs(candidate.longitude - target.longitude);
      const closeCoordinates = latitudeGap < 0.0008 && longitudeGap < 0.0008;

      if (!nameSimilar && !closeCoordinates) {
        return null;
      }

      return {
        id: candidate.id,
        slug: candidate.slug,
        name: candidate.name,
        status: candidate.status,
        distanceScore: Number((latitudeGap + longitudeGap).toFixed(6))
      } satisfies DuplicateCandidate;
    })
    .filter((candidate): candidate is DuplicateCandidate => Boolean(candidate))
    .sort((a, b) => a.distanceScore - b.distanceScore)
    .slice(0, 4);
}

async function getPreviewMap(spotIds: string[]) {
  if (!spotIds.length) {
    return {
      previewMap: new Map<string, string>(),
      countMap: new Map<string, number>()
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("photos")
    .select("spot_id, image_url")
    .in("spot_id", spotIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load preview map: ${error.message}`);
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

async function getProfileNameMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const nameMap = new Map<string, string>();

  if (!uniqueIds.length) {
    return nameMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", uniqueIds);

  if (error) {
    throw new Error(`Failed to load profile names: ${error.message}`);
  }

  for (const row of data ?? []) {
    nameMap.set(row.id, row.nickname);
  }

  return nameMap;
}

export async function logModerationAction(input: {
  adminUserId: string;
  targetType: "spot" | "photo" | "report";
  targetId: string;
  action: ModerationActionName;
  previousStatus?: string | null;
  newStatus?: string | null;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("moderation_actions").insert({
    admin_user_id: input.adminUserId,
    target_type: input.targetType,
    target_id: input.targetId,
    action: input.action,
    previous_status: input.previousStatus ?? null,
    new_status: input.newStatus ?? null,
    note: input.note ?? null
  });

  if (error) {
    throw new Error(`Failed to log moderation action: ${error.message}`);
  }
}

async function getRecentActions(limit = 8) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("moderation_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load moderation actions: ${error.message}`);
  }

  return ((data ?? []) as ModerationActionRow[]).map(mapAction);
}

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const supabase = createSupabaseAdminClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const since = sevenDaysAgo.toISOString();

  const [spots, photos, reports, recentPhotoRows, recentSpotRows, recentReportRows, recentActions] = await Promise.all([
    supabase.from("spots").select("status", { count: "exact", head: false }),
    supabase.from("photos").select("status", { count: "exact", head: false }),
    supabase.from("reports").select("status", { count: "exact", head: false }),
    supabase.from("photos").select("created_at").gte("created_at", since),
    supabase.from("spots").select("created_at").gte("created_at", since),
    supabase.from("reports").select("created_at").gte("created_at", since),
    getRecentActions()
  ]);

  if (
    spots.error ||
    photos.error ||
    reports.error ||
    recentPhotoRows.error ||
    recentSpotRows.error ||
    recentReportRows.error
  ) {
    throw new Error(
      spots.error?.message ||
        photos.error?.message ||
        reports.error?.message ||
        recentPhotoRows.error?.message ||
        recentSpotRows.error?.message ||
        recentReportRows.error?.message ||
        "Failed to load admin overview."
    );
  }

  const allSpotRows = spots.data ?? [];
  const allPhotoRows = photos.data ?? [];
  const allReportRows = reports.data ?? [];

  return {
    totalSpots: spots.count ?? 0,
    totalPhotos: photos.count ?? 0,
    totalReports: reports.count ?? 0,
    publishedSpots: allSpotRows.filter((row) => row.status === "published").length,
    publishedPhotos: allPhotoRows.filter((row) => row.status === "published").length,
    pendingSpots: allSpotRows.filter((row) => row.status === "pending").length,
    pendingPhotos: allPhotoRows.filter((row) => row.status === "pending").length,
    hiddenItems:
      allSpotRows.filter((row) => row.status === "hidden" || row.status === "merged").length +
      allPhotoRows.filter((row) => row.status === "hidden").length,
    rejectedItems:
      allSpotRows.filter((row) => row.status === "rejected").length +
      allPhotoRows.filter((row) => row.status === "rejected").length,
    openReports: allReportRows.filter((row) => row.status === "open" || row.status === "reviewing").length,
    newUploadsLast7Days: (recentPhotoRows.data ?? []).length,
    newSpotsLast7Days: (recentSpotRows.data ?? []).length,
    uploadTrend: createDailyTrend(recentPhotoRows.data ?? []),
    reportTrend: createDailyTrend(recentReportRows.data ?? []),
    recentActions
  };
}

export async function getModerationSpots({
  status,
  query,
  sort = "newest"
}: {
  status?: string;
  query?: string;
  sort?: string;
}) {
  const supabase = createSupabaseAdminClient();
  let builder = supabase.from("spots").select("*");

  if (status && status !== "all") {
    builder = builder.eq("status", status);
  }

  if (query) {
    builder = builder.ilike("name", `%${query}%`);
  }

  builder =
    sort === "oldest"
      ? builder.order("created_at", { ascending: true })
      : sort === "status"
        ? builder.order("status", { ascending: true }).order("created_at", { ascending: false })
        : builder.order("created_at", { ascending: false });

  const [{ data, error }, allStatusRows, allSpotRowsResponse] = await Promise.all([
    builder,
    supabase.from("spots").select("status"),
    supabase.from("spots").select("*")
  ]);

  if (error || allStatusRows.error || allSpotRowsResponse.error) {
    throw new Error(
      `Failed to load spots moderation data: ${error?.message ?? allStatusRows.error?.message ?? allSpotRowsResponse.error?.message}`
    );
  }

  const rows = (data ?? []) as SpotRow[];
  const allRows = (allSpotRowsResponse.data ?? []) as SpotRow[];
  const { previewMap, countMap } = await getPreviewMap(rows.map((row) => row.id));

  return {
    spots: rows.map((row) => ({
      ...mapSpot(row, previewMap.get(row.id) ?? null, countMap.get(row.id) ?? 0),
      duplicateCandidates: findDuplicateCandidates(row, allRows)
    })),
    statusCounts: (allStatusRows.data ?? []).reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
      return accumulator;
    }, {})
  };
}

export async function getModerationPhotos({
  status,
  query,
  sort = "newest"
}: {
  status?: string;
  query?: string;
  sort?: string;
}) {
  const supabase = createSupabaseAdminClient();
  let builder = supabase.from("photos").select("*, spots(id, name, slug, status)");

  if (status && status !== "all") {
    builder = builder.eq("status", status);
  }

  if (query) {
    builder = builder.or(`title.ilike.%${query}%,photographer_name.ilike.%${query}%`);
  }

  builder =
    sort === "oldest"
      ? builder.order("created_at", { ascending: true })
      : sort === "status"
        ? builder.order("status", { ascending: true }).order("created_at", { ascending: false })
        : builder.order("created_at", { ascending: false });

  const [{ data, error }, allStatusRows] = await Promise.all([
    builder,
    supabase.from("photos").select("status")
  ]);

  if (error || allStatusRows.error) {
    throw new Error(`Failed to load photos moderation data: ${error?.message ?? allStatusRows.error?.message}`);
  }

  return {
    items: ((data ?? []) as PhotoRow[]).map((row) => ({
      photo: mapPhoto(row),
      spotName: row.spots?.name ?? "Unknown spot",
      spotSlug: row.spots?.slug ?? "",
      spotStatus: row.spots?.status ?? "hidden"
    })),
    statusCounts: (allStatusRows.data ?? []).reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
      return accumulator;
    }, {})
  };
}

export async function getModerationReports({
  status,
  targetType,
  sort = "newest"
}: {
  status?: string;
  targetType?: string;
  sort?: string;
}) {
  const supabase = createSupabaseAdminClient();
  let builder = supabase.from("reports").select("*");

  if (status && status !== "all") {
    builder = builder.eq("status", status);
  }

  if (targetType && targetType !== "all") {
    builder = builder.eq("target_type", targetType);
  }

  builder =
    sort === "oldest"
      ? builder.order("created_at", { ascending: true })
      : sort === "status"
        ? builder.order("status", { ascending: true }).order("created_at", { ascending: false })
        : builder.order("created_at", { ascending: false });

  const [{ data, error }, allRowsResponse] = await Promise.all([
    builder,
    supabase.from("reports").select("status, target_type, target_id")
  ]);

  if (error || allRowsResponse.error) {
    throw new Error(`Failed to load reports: ${error?.message ?? allRowsResponse.error?.message}`);
  }

  const rows = (data ?? []) as ReportRow[];
  const reporterMap = await getProfileNameMap(rows.map((row) => row.reporter_user_id));
  const reportCountsByTarget = new Map<string, number>();

  for (const row of allRowsResponse.data ?? []) {
    const key = `${row.target_type}:${row.target_id}`;
    reportCountsByTarget.set(key, (reportCountsByTarget.get(key) ?? 0) + 1);
  }

  const spotIds = rows.filter((row) => row.target_type === "spot").map((row) => row.target_id);
  const photoIds = rows.filter((row) => row.target_type === "photo").map((row) => row.target_id);
  const [spotTargets, photoTargets] = await Promise.all([
    spotIds.length
      ? supabase.from("spots").select("id, name, status, slug").in("id", spotIds)
      : Promise.resolve({ data: [], error: null }),
    photoIds.length
      ? supabase.from("photos").select("id, title, status").in("id", photoIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (spotTargets.error || photoTargets.error) {
    throw new Error(`Failed to load linked report targets: ${spotTargets.error?.message ?? photoTargets.error?.message}`);
  }

  const targetMap = new Map<string, { label: string; status: string; href: string }>();

  for (const row of spotTargets.data ?? []) {
    targetMap.set(`spot:${row.id}`, {
      label: row.name,
      status: row.status,
      href: `/admin/spots/${row.id}`
    });
  }

  for (const row of photoTargets.data ?? []) {
    targetMap.set(`photo:${row.id}`, {
      label: row.title,
      status: row.status,
      href: `/admin/photos/${row.id}`
    });
  }

  return {
    items: rows.map((row) => {
      const key = `${row.target_type}:${row.target_id}`;
      const target = targetMap.get(key);
      return {
        report: mapReport(row),
        reporterName: reporterMap.get(row.reporter_user_id) ?? "User",
        targetLabel: target?.label ?? "Unknown target",
        targetStatus: target?.status ?? "missing",
        targetHref: target?.href ?? (row.target_type === "spot" ? "/admin/spots" : "/admin/photos"),
        reportCountForTarget: reportCountsByTarget.get(key) ?? 1
      };
    }),
    statusCounts: (allRowsResponse.data ?? []).reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
      return accumulator;
    }, {})
  };
}

export async function getSpotModerationDetail(spotId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: spotRow, error }, allSpotsResponse] = await Promise.all([
    supabase.from("spots").select("*").eq("id", spotId).maybeSingle(),
    supabase.from("spots").select("*")
  ]);

  if (error || allSpotsResponse.error) {
    throw new Error(`Failed to load spot detail: ${error?.message ?? allSpotsResponse.error?.message}`);
  }

  if (!spotRow) {
    return null;
  }

  const [previewData, linkedPhotos, actionsResponse, reportsResponse, creatorMap, reviewerMap] = await Promise.all([
    getPreviewMap([spotId]),
    supabase.from("photos").select("*").eq("spot_id", spotId).order("created_at", { ascending: false }),
    supabase
      .from("moderation_actions")
      .select("*")
      .eq("target_type", "spot")
      .eq("target_id", spotId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("reports").select("*").eq("target_type", "spot").eq("target_id", spotId).order("created_at", { ascending: false }),
    getProfileNameMap(spotRow.created_by ? [spotRow.created_by] : []),
    getProfileNameMap(spotRow.reviewed_by ? [spotRow.reviewed_by] : [])
  ]);

  if (linkedPhotos.error || actionsResponse.error || reportsResponse.error) {
    throw new Error(
      linkedPhotos.error?.message || actionsResponse.error?.message || reportsResponse.error?.message || "Failed to load spot detail data."
    );
  }

  const allSpots = (allSpotsResponse.data ?? []) as SpotRow[];
  const spot = mapSpot(
    spotRow as SpotRow,
    previewData.previewMap.get(spotId) ?? null,
    previewData.countMap.get(spotId) ?? 0
  );

  return {
    spot,
    photos: ((linkedPhotos.data ?? []) as PhotoRow[]).map(mapPhoto),
    duplicateCandidates: findDuplicateCandidates(spotRow as SpotRow, allSpots),
    reportCount: (reportsResponse.data ?? []).length,
    openReportCount: (reportsResponse.data ?? []).filter((row) => row.status === "open" || row.status === "reviewing").length,
    actions: ((actionsResponse.data ?? []) as ModerationActionRow[]).map(mapAction),
    creatorName: spot.createdBy ? creatorMap.get(spot.createdBy) ?? "User" : "System",
    reviewerName: spot.reviewedBy ? reviewerMap.get(spot.reviewedBy) ?? "Admin" : null
  };
}

export async function getPhotoModerationDetail(photoId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: photoRow, error } = await supabase
    .from("photos")
    .select("*, spots(id, name, slug, status)")
    .eq("id", photoId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load photo detail: ${error.message}`);
  }

  if (!photoRow) {
    return null;
  }

  const [actionsResponse, reportsResponse, uploaderMap, reviewerMap] = await Promise.all([
    supabase
      .from("moderation_actions")
      .select("*")
      .eq("target_type", "photo")
      .eq("target_id", photoId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("reports").select("*").eq("target_type", "photo").eq("target_id", photoId).order("created_at", { ascending: false }),
    getProfileNameMap(photoRow.user_id ? [photoRow.user_id] : []),
    getProfileNameMap(photoRow.reviewed_by ? [photoRow.reviewed_by] : [])
  ]);

  if (actionsResponse.error || reportsResponse.error) {
    throw new Error(actionsResponse.error?.message || reportsResponse.error?.message || "Failed to load photo detail data.");
  }

  return {
    photo: mapPhoto(photoRow as PhotoRow),
    spotName: (photoRow as PhotoRow).spots?.name ?? "Unknown spot",
    spotSlug: (photoRow as PhotoRow).spots?.slug ?? "",
    spotStatus: (photoRow as PhotoRow).spots?.status ?? "hidden",
    reportCount: (reportsResponse.data ?? []).length,
    openReportCount: (reportsResponse.data ?? []).filter((row) => row.status === "open" || row.status === "reviewing").length,
    actions: ((actionsResponse.data ?? []) as ModerationActionRow[]).map(mapAction),
    uploaderName:
      photoRow.user_id ? uploaderMap.get(photoRow.user_id) ?? photoRow.photographer_name : photoRow.photographer_name,
    reviewerName: photoRow.reviewed_by ? reviewerMap.get(photoRow.reviewed_by) ?? "Admin" : null
  };
}

export async function updateSpotModeration(
  spotId: string,
  input: {
    status: ContentStatus;
    adminUserId: string;
    name?: string;
    description?: string;
    campusArea?: string;
    bestTime?: string;
    latitude?: number;
    longitude?: number;
    canonicalSpotId?: string | null;
    duplicateOf?: string | null;
    isDuplicate?: boolean;
    note?: string | null;
    moderationNote?: string | null;
    rejectionReason?: string | null;
    hideReason?: string | null;
    isFeatured?: boolean;
  }
) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("spots")
    .select("status")
    .eq("id", spotId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load current spot status: ${existingError.message}`);
  }

  const previousStatus = existing?.status ?? null;
  const { error } = await supabase
    .from("spots")
    .update({
      status: input.status,
      name: input.name,
      description: input.description,
      campus_area: input.campusArea,
      best_time: input.bestTime,
      latitude: input.latitude,
      longitude: input.longitude,
      canonical_spot_id: input.canonicalSpotId ?? null,
      duplicate_of: input.duplicateOf ?? null,
      is_duplicate: input.isDuplicate ?? false,
      moderation_note: input.moderationNote ?? null,
      rejection_reason: input.rejectionReason ?? null,
      hide_reason: input.hideReason ?? null,
      is_featured: input.isFeatured ?? false,
      featured_at: input.isFeatured ? new Date().toISOString() : null,
      reviewed_by: input.adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", spotId);

  if (error) {
    throw new Error(`Failed to update spot: ${error.message}`);
  }

  const statusAction: Record<ContentStatus, ModerationActionName> = {
    pending: "edit_spot",
    published: "publish",
    hidden: "hide",
    rejected: "reject"
  };

  await logModerationAction({
    adminUserId: input.adminUserId,
    targetType: "spot",
    targetId: spotId,
    action:
      input.isDuplicate && input.duplicateOf
        ? "mark_duplicate"
        : input.canonicalSpotId
          ? "set_canonical"
          : previousStatus !== input.status
            ? statusAction[input.status]
            : "edit_spot",
    previousStatus,
    newStatus: input.status,
    note: input.note ?? null
  });
}

export async function updatePhotoModeration(
  photoId: string,
  input: {
    status: ContentStatus;
    adminUserId: string;
    title?: string;
    caption?: string;
    note?: string | null;
    moderationNote?: string | null;
    rejectionReason?: string | null;
    hideReason?: string | null;
    isFeatured?: boolean;
  }
) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("photos")
    .select("status")
    .eq("id", photoId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load current photo status: ${existingError.message}`);
  }

  const previousStatus = existing?.status ?? null;
  const { error } = await supabase
    .from("photos")
    .update({
      status: input.status,
      title: input.title,
      caption: input.caption,
      moderation_note: input.moderationNote ?? null,
      rejection_reason: input.rejectionReason ?? null,
      hide_reason: input.hideReason ?? null,
      is_featured: input.isFeatured ?? false,
      featured_at: input.isFeatured ? new Date().toISOString() : null,
      reviewed_by: input.adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", photoId);

  if (error) {
    throw new Error(`Failed to update photo: ${error.message}`);
  }

  const statusAction: Record<ContentStatus, ModerationActionName> = {
    pending: "edit_photo",
    published: "publish",
    hidden: "hide",
    rejected: "reject"
  };

  await logModerationAction({
    adminUserId: input.adminUserId,
    targetType: "photo",
    targetId: photoId,
    action: previousStatus !== input.status ? statusAction[input.status] : "edit_photo",
    previousStatus,
    newStatus: input.status,
    note: input.note ?? null
  });
}

export async function updateReportModeration(
  reportId: string,
  input: {
    status: ReportStatus;
    adminUserId: string;
    resolutionNote?: string | null;
    internalNote?: string | null;
  }
) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("reports")
    .select("status")
    .eq("id", reportId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load current report status: ${existingError.message}`);
  }

  const previousStatus = existing?.status ?? null;
  const { error } = await supabase
    .from("reports")
    .update({
      status: input.status,
      resolution_note: input.resolutionNote ?? null,
      internal_note: input.internalNote ?? null,
      reviewed_by: input.adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", reportId);

  if (error) {
    throw new Error(`Failed to update report: ${error.message}`);
  }

  const actionByStatus: Record<ReportStatus, ModerationActionName> = {
    open: "move_to_reviewing",
    reviewing: "move_to_reviewing",
    resolved: "resolve_report",
    dismissed: "dismiss_report"
  };

  await logModerationAction({
    adminUserId: input.adminUserId,
    targetType: "report",
    targetId: reportId,
    action: actionByStatus[input.status],
    previousStatus,
    newStatus: input.status,
    note: input.resolutionNote ?? null
  });
}

export async function batchUpdateSpots(input: {
  ids: string[];
  status: ContentStatus;
  adminUserId: string;
  note?: string | null;
}) {
  const ids = Array.from(new Set(input.ids.filter(Boolean)));
  if (!ids.length) {
    throw new Error("Select at least one spot.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: rows, error: loadError } = await supabase.from("spots").select("id, status").in("id", ids);

  if (loadError) {
    throw new Error(`Failed to load batch spots: ${loadError.message}`);
  }

  const { error } = await supabase
    .from("spots")
    .update({
      status: input.status,
      reviewed_by: input.adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to batch update spots: ${error.message}`);
  }

  await Promise.all(
    (rows ?? []).map((row) =>
      logModerationAction({
        adminUserId: input.adminUserId,
        targetType: "spot",
        targetId: row.id,
        action: input.status === "published" ? "publish" : input.status === "hidden" ? "hide" : "reject",
        previousStatus: row.status,
        newStatus: input.status,
        note: input.note ?? null
      })
    )
  );
}

export async function batchUpdatePhotos(input: {
  ids: string[];
  status: ContentStatus;
  adminUserId: string;
  note?: string | null;
}) {
  const ids = Array.from(new Set(input.ids.filter(Boolean)));
  if (!ids.length) {
    throw new Error("Select at least one photo.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: rows, error: loadError } = await supabase.from("photos").select("id, status").in("id", ids);

  if (loadError) {
    throw new Error(`Failed to load batch photos: ${loadError.message}`);
  }

  const { error } = await supabase
    .from("photos")
    .update({
      status: input.status,
      reviewed_by: input.adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to batch update photos: ${error.message}`);
  }

  await Promise.all(
    (rows ?? []).map((row) =>
      logModerationAction({
        adminUserId: input.adminUserId,
        targetType: "photo",
        targetId: row.id,
        action: input.status === "published" ? "publish" : input.status === "hidden" ? "hide" : "reject",
        previousStatus: row.status,
        newStatus: input.status,
        note: input.note ?? null
      })
    )
  );
}
