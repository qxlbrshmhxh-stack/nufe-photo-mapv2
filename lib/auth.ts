import { redirect } from "next/navigation";
import {
  canAccessStaff,
  canFeatureContent,
  canInspectMaintenance,
  canManageRoles,
  canMergeSpots,
  canModerateContent,
  canRunMaintenanceRepairs
} from "@/lib/permissions";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";

export async function requireUser(redirectPath = "/login?next=/user") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectPath);
  }

  return user;
}

export async function requireAdmin(redirectPath = "/") {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect(redirectPath);
  }

  return adminSession;
}

export async function requireStaff(redirectPath = "/") {
  const staffSession = await getStaffSession();

  if (!staffSession) {
    redirect(redirectPath);
  }

  return staffSession;
}

export async function getAdminSession() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!user || !profile || !canManageRoles(profile.role)) {
    return null;
  }

  return {
    user,
    profile
  };
}

export async function getStaffSession() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!user || !profile || !canAccessStaff(profile.role)) {
    return null;
  }

  return {
    user,
    profile
  };
}

export async function assertAdminSession() {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error("Admin access is required.");
  }

  return adminSession;
}

export async function assertStaffSession() {
  const staffSession = await getStaffSession();

  if (!staffSession) {
    throw new Error("Staff access is required.");
  }

  return staffSession;
}

export async function assertCanModerate() {
  const staffSession = await assertStaffSession();

  if (!canModerateContent(staffSession.profile.role)) {
    throw new Error("Moderation access is required.");
  }

  return staffSession;
}

export async function assertCanMergeSpots() {
  const staffSession = await assertStaffSession();

  if (!canMergeSpots(staffSession.profile.role)) {
    throw new Error("Admin access is required for spot merges.");
  }

  return staffSession;
}

export async function assertCanRunMaintenanceRepairs() {
  const staffSession = await assertStaffSession();

  if (!canRunMaintenanceRepairs(staffSession.profile.role)) {
    throw new Error("Admin access is required for maintenance repairs.");
  }

  return staffSession;
}

export async function assertCanInspectMaintenance() {
  const staffSession = await assertStaffSession();

  if (!canInspectMaintenance(staffSession.profile.role)) {
    throw new Error("Staff access is required for maintenance.");
  }

  return staffSession;
}

export async function assertCanManageRoles() {
  const staffSession = await assertStaffSession();

  if (!canManageRoles(staffSession.profile.role)) {
    throw new Error("Admin access is required to manage roles.");
  }

  return staffSession;
}

export async function assertCanFeatureContent() {
  const staffSession = await assertStaffSession();

  if (!canFeatureContent(staffSession.profile.role)) {
    throw new Error("Staff access is required to feature content.");
  }

  return staffSession;
}
