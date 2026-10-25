import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

/**
 * Parses and returns a valid Date instance from string, number, or Date.
 */
function toDate(date: string | number | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  if (typeof date === "string") {
    const parsed = parseISO(date);
    if (isValid(parsed)) return parsed;
    const direct = new Date(date);
    return isValid(direct) ? direct : null;
  }
  const timestampDate = new Date(date);
  return isValid(timestampDate) ? timestampDate : null;
}

/**
 * Formats a date into a clean display timestamp: "Oct 24, 2026, 03:00 PM"
 */
export function formatDateTime(date: string | number | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "MMM dd, yyyy, hh:mm a");
}

/**
 * Formats a date into short date: "Oct 24, 2026"
 */
export function formatDate(date: string | number | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "MMM dd, yyyy");
}

/**
 * Formats relative time: "5 minutes ago"
 */
export function formatRelativeTime(date: string | number | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Formats time only: "03:00 PM"
 */
export function formatTime(date: string | number | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "hh:mm a");
}
