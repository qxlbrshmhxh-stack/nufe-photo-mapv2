export type Spot = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campusArea: string;
  bestTime: string;
  previewImage: string | null;
  tags: string[];
  tips: string[];
  status: SpotLifecycleStatus;
  createdBy?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  canonicalSpotId?: string | null;
  duplicateOf?: string | null;
  isDuplicate?: boolean;
  mergedIntoSpotId?: string | null;
  mergedAt?: string | null;
  mergedBy?: string | null;
  moderationNote?: string | null;
  rejectionReason?: string | null;
  hideReason?: string | null;
  isFeatured?: boolean;
  featuredAt?: string | null;
  photoCount?: number;
  createdAt?: string;
  locationText?: string;
  gallery?: string[];
};

export type Photo = {
  id: string;
  spot_id: string;
  image_url: string;
  title: string;
  caption: string;
  photographer_name: string;
  user_id?: string | null;
  visitor_id?: string | null;
  shot_time: string;
  status: ContentStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  moderation_note?: string | null;
  rejection_reason?: string | null;
  hide_reason?: string | null;
  is_featured?: boolean;
  featured_at?: string | null;
  linkedSpot?: Pick<Spot, "id" | "slug" | "name" | "campusArea"> | null;
  created_at: string;
};

export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  email?: string | null;
  role: UserRole;
  status: UserStatus;
  restricted_until?: string | null;
  moderation_note?: string | null;
  created_at: string;
};

export type UserProfile = Profile;

export type Favorite = {
  id: string;
  user_id?: string | null;
  visitor_id?: string | null;
  spot_id: string;
  created_at: string;
};

export type SpotWithPhotos = Spot & {
  photos: Photo[];
};

export type SpotInsertInput = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campusArea: string;
  bestTime: string;
};

export type UploadPhotoPayload = {
  spotMode: "existing" | "new";
  existingSpotId?: string;
  newSpot?: SpotInsertInput;
  title: string;
  caption: string;
  photographerName: string;
  userId?: string;
  visitorId?: string;
  shotTime?: string;
};

export type ContentStatus = "pending" | "published" | "hidden" | "rejected";
export type UserRole = "user" | "moderator" | "admin";
export type UserStatus = "active" | "restricted" | "banned";
export type SpotLifecycleStatus = ContentStatus | "merged";

export type SpotFilters = {
  campusArea: string;
  bestTime: string;
  keyword: string;
};

export type VisitorIdentity = {
  id: string;
  photographerName: string;
};

export type AuthFormMode = "login" | "signup";

export type ProfileUpdateInput = {
  nickname: string;
  avatarUrl: string;
  bio: string;
};

export type ReportTargetType = "spot" | "photo";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReportReason = "wrong location" | "inappropriate image" | "spam" | "duplicate" | "other";

export type Report = {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  note: string | null;
  status: ReportStatus;
  resolution_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  internal_note?: string | null;
  created_at: string;
};

export type ModerationActionTargetType = "spot" | "photo" | "report";
export type ModerationActionName =
  | "publish"
  | "hide"
  | "reject"
  | "restore"
  | "mark_duplicate"
  | "set_canonical"
  | "merge_spot"
  | "resolve_report"
  | "dismiss_report"
  | "move_to_reviewing"
  | "edit_spot"
  | "edit_photo";

export type ModerationAction = {
  id: string;
  admin_user_id: string;
  target_type: ModerationActionTargetType;
  target_id: string;
  action: ModerationActionName;
  previous_status: string | null;
  new_status: string | null;
  note: string | null;
  created_at: string;
};

export type DuplicateCandidate = {
  id: string;
  slug: string;
  name: string;
  status: SpotLifecycleStatus;
  distanceScore: number;
};

export type AdminOverviewStats = {
  totalSpots: number;
  totalPhotos: number;
  totalReports: number;
  publishedSpots: number;
  publishedPhotos: number;
  pendingSpots: number;
  pendingPhotos: number;
  hiddenItems: number;
  rejectedItems: number;
  openReports: number;
  newUploadsLast7Days: number;
  newSpotsLast7Days: number;
  uploadTrend: { date: string; count: number }[];
  reportTrend: { date: string; count: number }[];
  recentActions: ModerationAction[];
};

export type RecentPhotoItem = {
  photo: Photo;
  spot: Pick<Spot, "id" | "slug" | "name" | "campusArea">;
};

export type SpotMerge = {
  id: string;
  source_spot_id: string;
  target_spot_id: string;
  admin_user_id: string;
  note: string | null;
  created_at: string;
};

export type MaintenanceIssue = {
  key: string;
  title: string;
  description: string;
  count: number;
  items: {
    id: string;
    label: string;
    href?: string;
    detail?: string;
  }[];
};

export type AdminUserListItem = {
  id: string;
  nickname: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  restrictedUntil: string | null;
  moderationNote: string | null;
  createdAt: string;
  uploadCount: number;
  reportCount: number;
};

export type AdminUserDetail = {
  profile: Profile;
  uploads: Photo[];
  reports: Report[];
};
