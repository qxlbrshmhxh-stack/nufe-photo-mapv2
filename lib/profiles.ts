import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { canManageRoles } from "@/lib/permissions";
import { AdminUserDetail, AdminUserListItem, Photo, Profile, ProfileUpdateInput, Report, UserRole, UserStatus } from "@/lib/types";

type ProfileRow = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  restricted_until: string | null;
  moderation_note: string | null;
  created_at: string;
};

function mapProfile(row: ProfileRow, email?: string | null): Profile {
  return {
    id: row.id,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    bio: row.bio,
    role: row.role,
    status: row.status,
    restricted_until: row.restricted_until,
    moderation_note: row.moderation_note,
    email: email ?? null,
    created_at: row.created_at
  };
}

function fallbackNickname(email?: string | null) {
  return email?.split("@")[0] || "NUFE Explorer";
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed to load auth user: ${error.message}`);
  }

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Failed to load auth user: ${userError.message}`);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, bio, role, status, restricted_until, moderation_note, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) {
    const nickname =
      typeof user.user_metadata?.nickname === "string" && user.user_metadata.nickname.trim()
        ? user.user_metadata.nickname.trim()
        : fallbackNickname(user.email);

    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          nickname,
          avatar_url: null,
          bio: null,
          role: "user",
          status: "active",
          restricted_until: null,
          moderation_note: null
        },
        { onConflict: "id" }
      )
      .select("id, nickname, avatar_url, bio, role, status, restricted_until, moderation_note, created_at")
      .single();

    if (createError || !createdProfile) {
      throw new Error(`Failed to create profile: ${createError?.message ?? "Unknown error"}`);
    }

    return mapProfile(createdProfile as ProfileRow, user.email);
  }

  return mapProfile(data as ProfileRow, user.email);
}

export async function updateCurrentProfile(input: ProfileUpdateInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Failed to load auth user: ${userError.message}`);
  }

  if (!user) {
    throw new Error("Please sign in to edit your profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        nickname: input.nickname.trim(),
        avatar_url: input.avatarUrl.trim() || null,
        bio: input.bio.trim() || null
      },
      { onConflict: "id" }
    )
    .select("id, nickname, avatar_url, bio, role, status, restricted_until, moderation_note, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message ?? "Unknown error"}`);
  }

  return mapProfile(data as ProfileRow, user.email);
}

async function getAuthUserMap() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 500
  });

  if (error) {
    throw new Error(`Failed to load auth users: ${error.message}`);
  }

  return new Map((data.users ?? []).map((user) => [user.id, user.email ?? null]));
}

function mapPhotoRow(row: {
  id: string;
  spot_id: string;
  image_url: string;
  title: string;
  caption: string | null;
  photographer_name: string;
  user_id: string | null;
  visitor_id: string | null;
  shot_time: string | null;
  status: "pending" | "published" | "hidden" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  moderation_note: string | null;
  rejection_reason: string | null;
  hide_reason: string | null;
  is_featured: boolean;
  featured_at: string | null;
  created_at: string;
}): Photo {
  return {
    id: row.id,
    spot_id: row.spot_id,
    image_url: row.image_url,
    title: row.title,
    caption: row.caption ?? "",
    photographer_name: row.photographer_name,
    user_id: row.user_id,
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

function mapReportRow(row: {
  id: string;
  reporter_user_id: string;
  target_type: "spot" | "photo";
  target_id: string;
  reason: Report["reason"];
  note: string | null;
  status: Report["status"];
  resolution_note: string | null;
  internal_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}): Report {
  return {
    id: row.id,
    reporter_user_id: row.reporter_user_id,
    target_type: row.target_type,
    target_id: row.target_id,
    reason: row.reason,
    note: row.note,
    status: row.status,
    resolution_note: row.resolution_note,
    internal_note: row.internal_note,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at
  };
}

export async function getAdminUsers(input?: {
  status?: string;
  role?: string;
  query?: string;
}): Promise<{ items: AdminUserListItem[] }> {
  const supabase = createSupabaseAdminClient();
  let builder = supabase.from("profiles").select("*").order("created_at", { ascending: false });

  if (input?.status && input.status !== "all") {
    builder = builder.eq("status", input.status);
  }

  if (input?.role && input.role !== "all") {
    builder = builder.eq("role", input.role);
  }

  const [{ data, error }, uploadsResponse, reportsResponse, authUserMap] = await Promise.all([
    builder,
    supabase.from("photos").select("user_id"),
    supabase.from("reports").select("reporter_user_id"),
    getAuthUserMap()
  ]);

  if (error || uploadsResponse.error || reportsResponse.error) {
    throw new Error(
      error?.message || uploadsResponse.error?.message || reportsResponse.error?.message || "Failed to load admin users."
    );
  }

  const uploadCounts = new Map<string, number>();
  for (const row of uploadsResponse.data ?? []) {
    if (row.user_id) {
      uploadCounts.set(row.user_id, (uploadCounts.get(row.user_id) ?? 0) + 1);
    }
  }

  const reportCounts = new Map<string, number>();
  for (const row of reportsResponse.data ?? []) {
    if (row.reporter_user_id) {
      reportCounts.set(row.reporter_user_id, (reportCounts.get(row.reporter_user_id) ?? 0) + 1);
    }
  }

  const rows = (data ?? []) as ProfileRow[];
  const filteredRows = input?.query
    ? rows.filter((row) => {
        const email = authUserMap.get(row.id) ?? "";
        const query = input.query!.toLowerCase();
        return row.nickname.toLowerCase().includes(query) || email.toLowerCase().includes(query);
      })
    : rows;

  return {
    items: filteredRows.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      email: authUserMap.get(row.id) ?? null,
      role: row.role,
      status: row.status,
      restrictedUntil: row.restricted_until,
      moderationNote: row.moderation_note,
      createdAt: row.created_at,
      uploadCount: uploadCounts.get(row.id) ?? 0,
      reportCount: reportCounts.get(row.id) ?? 0
    }))
  };
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = createSupabaseAdminClient();
  const authUserMap = await getAuthUserMap();
  const [{ data: profileRow, error }, uploadsResponse, reportsResponse] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("photos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("reports").select("*").eq("reporter_user_id", userId).order("created_at", { ascending: false })
  ]);

  if (error || uploadsResponse.error || reportsResponse.error) {
    throw new Error(
      error?.message || uploadsResponse.error?.message || reportsResponse.error?.message || "Failed to load user detail."
    );
  }

  if (!profileRow) {
    return null;
  }

  return {
    profile: mapProfile(profileRow as ProfileRow, authUserMap.get(userId) ?? null),
    uploads: ((uploadsResponse.data ?? []) as Parameters<typeof mapPhotoRow>[0][]).map(mapPhotoRow),
    reports: ((reportsResponse.data ?? []) as Parameters<typeof mapReportRow>[0][]).map(mapReportRow)
  };
}

export async function updateUserGovernance(input: {
  actorRole: UserRole;
  targetUserId: string;
  role?: UserRole;
  status?: UserStatus;
  restrictedUntil?: string | null;
  moderationNote?: string | null;
}) {
  if (input.role && !canManageRoles(input.actorRole)) {
    throw new Error("Only admins can change platform roles.");
  }

  const supabase = createSupabaseAdminClient();
  const updatePayload: Record<string, string | null> = {};

  if (input.role) {
    updatePayload.role = input.role;
  }

  if (input.status) {
    updatePayload.status = input.status;
    if (input.status !== "restricted" && input.restrictedUntil === undefined) {
      updatePayload.restricted_until = null;
    }
  }

  if (input.restrictedUntil !== undefined) {
    updatePayload.restricted_until = input.restrictedUntil || null;
  }

  if (input.moderationNote !== undefined) {
    updatePayload.moderation_note = input.moderationNote?.trim() || null;
  }

  const { error } = await supabase.from("profiles").update(updatePayload).eq("id", input.targetUserId);

  if (error) {
    throw new Error(`Failed to update user governance: ${error.message}`);
  }
}
