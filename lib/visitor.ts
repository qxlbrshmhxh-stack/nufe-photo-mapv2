import { VisitorIdentity } from "@/lib/types";

const VISITOR_ID_KEY = "nufe-photo-map-visitor-id";
const PHOTOGRAPHER_NAME_KEY = "nufe-photo-map-photographer-name";

function isBrowser() {
  return typeof window !== "undefined";
}

function generateVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getStoredVisitorId() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(VISITOR_ID_KEY) ?? "";
}

export function getStoredPhotographerName() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(PHOTOGRAPHER_NAME_KEY) ?? "";
}

export function getOrCreateVisitorIdentity(): VisitorIdentity {
  if (!isBrowser()) {
    return {
      id: "",
      photographerName: ""
    };
  }

  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateVisitorId();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }

  return {
    id,
    photographerName: getStoredPhotographerName()
  };
}

export function getLegacyVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(VISITOR_ID_KEY) ?? "";
}

export function savePhotographerName(name: string) {
  if (!isBrowser()) {
    return;
  }

  const normalized = name.trim();
  if (!normalized) {
    return;
  }

  window.localStorage.setItem(PHOTOGRAPHER_NAME_KEY, normalized);
}

export function getVisitorLabel(visitor: VisitorIdentity) {
  return visitor.photographerName || `Visitor ${visitor.id.slice(0, 8)}`;
}
