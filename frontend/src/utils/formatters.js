/**
 * Shared formatting helpers used across pages. Kept dependency-free
 * (native Intl APIs only) since the project doesn't use a date library.
 */

/**
 * Format an ISO date string ("2026-08-16") as a readable date.
 * Returns a fallback dash when no date is available.
 */
export function formatDate(isoDate, options) {
  if (!isoDate) return "\u2014";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleDateString(
    undefined,
    options ?? { month: "short", day: "numeric", year: "numeric" }
  );
}

/**
 * Format a 24-hour "HH:MM:SS" or "HH:MM" time string as a localized time.
 */
export function formatTime(isoTime) {
  if (!isoTime) return "\u2014";
  const [hours, minutes] = isoTime.split(":");
  if (hours === undefined || minutes === undefined) return "\u2014";
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a full datetime (ISO string) as "Aug 16, 2026 - 9:00 AM".
 */
export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return "\u2014";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "\u2014";
  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} \u00b7 ${timePart}`;
}

/**
 * Format seconds as "1h 12m", "12m 30s", or "45s" depending on magnitude.
 */
export function formatDuration(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return "\u2014";
  const seconds = Number(totalSeconds);
  if (Number.isNaN(seconds)) return "\u2014";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Format a plain number with thousands separators.
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return "\u2014";
  const num = Number(value);
  if (Number.isNaN(num)) return "\u2014";
  return num.toLocaleString(undefined);
}

/**
 * Title-case a snake_case token, e.g. "full_body" -> "Full Body".
 */
export function formatLabel(token) {
  if (!token) return "";
  return token
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Build a set of initials from a first/last name pair for avatars.
 */
export function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}
