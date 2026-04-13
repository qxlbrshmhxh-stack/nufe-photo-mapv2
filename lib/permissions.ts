import { Profile, UserRole, UserStatus } from "@/lib/types";

export type StaffRole = Exclude<UserRole, "user">;
export type GovernanceAction = "upload" | "favorite" | "report";

const roleOrder: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2
};

export function hasRole(role: UserRole | null | undefined, minimumRole: UserRole) {
  if (!role) {
    return false;
  }

  return roleOrder[role] >= roleOrder[minimumRole];
}

export function canAccessStaff(role: UserRole | null | undefined) {
  return hasRole(role, "moderator");
}

export function canModerateContent(role: UserRole | null | undefined) {
  return hasRole(role, "moderator");
}

export function canInspectMaintenance(role: UserRole | null | undefined) {
  return hasRole(role, "moderator");
}

export function canRunMaintenanceRepairs(role: UserRole | null | undefined) {
  return hasRole(role, "admin");
}

export function canMergeSpots(role: UserRole | null | undefined) {
  return hasRole(role, "admin");
}

export function canManageRoles(role: UserRole | null | undefined) {
  return hasRole(role, "admin");
}

export function canManageUserGovernance(role: UserRole | null | undefined) {
  return hasRole(role, "moderator");
}

export function canFeatureContent(role: UserRole | null | undefined) {
  return hasRole(role, "moderator");
}

export function isUserBanned(status: UserStatus | null | undefined) {
  return status === "banned";
}

export function isUserRestricted(status: UserStatus | null | undefined, restrictedUntil?: string | null) {
  if (status !== "restricted") {
    return false;
  }

  if (!restrictedUntil) {
    return true;
  }

  return new Date(restrictedUntil).getTime() > Date.now();
}

export function assertAccountCanAct(profile: Profile | null, action: GovernanceAction) {
  if (!profile) {
    throw new Error("Please sign in to continue.");
  }

  if (isUserBanned(profile.status)) {
    throw new Error("Your account is banned from using this action.");
  }

  if (action === "upload" && isUserRestricted(profile.status, profile.restricted_until)) {
    throw new Error("Your account is currently restricted from uploading new content.");
  }
}
