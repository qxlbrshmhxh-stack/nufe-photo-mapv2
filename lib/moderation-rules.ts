import { ContentStatus, SpotLifecycleStatus } from "@/lib/types";

export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const REPORT_COOLDOWN_HOURS = 24;
export const MIN_SPOT_NAME_LENGTH = 3;
export const MAX_SPOT_NAME_LENGTH = 80;

export function isPublishedStatus(status: string | null | undefined) {
  return status === "published";
}

export function isMergedSpotStatus(status: string | null | undefined) {
  return status === "merged";
}

export function isPublicSpot(status: SpotLifecycleStatus | null | undefined) {
  return status === "published";
}

export function isPublicPhoto(status: ContentStatus | null | undefined) {
  return status === "published";
}

export function canRestoreStatus(status: string | null | undefined) {
  return status === "hidden" || status === "rejected";
}

export function getRestoredStatus() {
  return "published" as const;
}

export function validateUploadFile(file: File) {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    throw new Error("Image file is too large. Keep uploads under 5 MB.");
  }
}

export function validateSpotDraft(input: {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  campusArea: string;
  bestTime: string;
}) {
  const name = input.name.trim();
  if (name.length < MIN_SPOT_NAME_LENGTH || name.length > MAX_SPOT_NAME_LENGTH) {
    throw new Error("Spot name must be between 3 and 80 characters.");
  }

  if (!input.description.trim()) {
    throw new Error("Spot description is required.");
  }

  if (!input.campusArea.trim() || !input.bestTime.trim()) {
    throw new Error("Campus area and best shooting time are required.");
  }

  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
    throw new Error("Valid coordinates are required.");
  }
}

export function getPublicSpotQueryStatuses() {
  return ["published"];
}

export function getPublicPhotoQueryStatuses() {
  return ["published"];
}
