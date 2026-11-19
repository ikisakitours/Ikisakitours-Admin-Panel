import type { FeedbackItem } from "../types/comment.types";

export function getDisplayCommentReference(item: FeedbackItem): string {
  if (!item.id) return "REV-IK";
  const prefix = item.itemType === "package-review" ? "REV" : "FDB";
  return `${prefix}-${item.id.slice(0, 8).toUpperCase()}`;
}

export function formatCommentRelativeTime(isoDate?: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCommentFullDateTime(isoDate?: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isNewComment(createdAt?: string, hoursThreshold = 24): boolean {
  if (!createdAt) return false;
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return false;
  const diffMs = Date.now() - createdMs;
  return diffMs >= -5 * 60 * 1000 && diffMs <= hoursThreshold * 60 * 60 * 1000;
}

export function toLocalDateKey(dateInput?: string | null): string | null {
  if (!dateInput) return null;
  const trimmed = dateInput.trim();
  const exactMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (exactMatch) return exactMatch[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
