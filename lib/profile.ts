import { computeStreak } from "./readiness";

// ── Reserved usernames ──────────────────────────────────────────────────────
// Handles that would collide with real routes or are otherwise off-limits.

export const RESERVED_USERNAMES = new Set<string>([
  "admin", "api", "u", "profile", "login", "signup", "logout", "dashboard",
  "log", "history", "onboarding", "coach", "join", "blog", "settings",
  "reset-password", "update-password", "auth", "armtrack", "support", "help",
  "about", "terms", "privacy", "static", "_next",
]);

// ── Username validation ─────────────────────────────────────────────────────

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export type UsernameResult = { ok: true; value: string } | { ok: false; error: string };

export function validateUsername(raw: string): UsernameResult {
  const value = normalizeUsername(raw);
  if (value.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  if (value.length > 20) return { ok: false, error: "Username must be 20 characters or fewer." };
  if (!/^[a-z0-9_]+$/.test(value))
    return { ok: false, error: "Use only letters, numbers, and underscores." };
  if (RESERVED_USERNAMES.has(value)) return { ok: false, error: "That username isn't available." };
  return { ok: true, value };
}

// ── Profile stats (derived from log dates) ──────────────────────────────────

export interface ProfileStats {
  streak: number;
  totalLogs: number;
  trackingSince: string | null; // earliest YYYY-MM-DD, or null when no logs
}

export function computeProfileStats(logDates: string[]): ProfileStats {
  if (logDates.length === 0) return { streak: 0, totalLogs: 0, trackingSince: null };
  const sorted = [...logDates].sort(); // YYYY-MM-DD sorts lexically = chronologically
  return {
    streak: computeStreak(logDates),
    totalLogs: logDates.length,
    trackingSince: sorted[0],
  };
}

// ── Display helpers ─────────────────────────────────────────────────────────

/** "June 2026" from a YYYY-MM-DD string; "" when null. */
export function formatTrackingSince(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Denormalized public stats ────────────────────────────────────────────────
// Aggregates stored on the profile row (public-safe) so the public profile never
// has to read raw arm_logs. Refreshed whenever the player opens their dashboard.

export interface PublicStats {
  totalLogs: number;
  currentStreak: number;
  lastLogDate: string | null;
  firstLogDate: string | null;
}

export function buildPublicStats(logDates: string[]): PublicStats {
  if (logDates.length === 0) {
    return { totalLogs: 0, currentStreak: 0, lastLogDate: null, firstLogDate: null };
  }
  const sorted = [...logDates].sort(); // YYYY-MM-DD sorts chronologically
  return {
    totalLogs: logDates.length,
    currentStreak: computeStreak(logDates),
    lastLogDate: sorted[sorted.length - 1],
    firstLogDate: sorted[0],
  };
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function localShift(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * A stored current streak is only still valid if the most recent log was today
 * or yesterday. Otherwise the streak has broken since it was stored, so display 0.
 * `today` is injectable for testing.
 */
export function displayedStreak(
  storedStreak: number,
  lastLogDate: string | null,
  today: string = localToday()
): number {
  if (!lastLogDate) return 0;
  const yesterday = localShift(today, -1);
  return lastLogDate === today || lastLogDate === yesterday ? storedStreak : 0;
}
