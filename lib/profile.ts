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
