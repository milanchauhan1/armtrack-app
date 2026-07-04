// Offline log queue — ballpark WiFi insurance for the core loop.
//
// When saving a log fails because of connectivity, the payload is stashed in
// localStorage and pushed on the next dashboard load. One slot only (you log
// once a day); if the athlete re-logs that date while online before the sync
// runs, the server copy wins and the stash is dropped.

import { supabase } from "./supabase";

const KEY = "armtrack_pending_log";

export interface PendingLog {
  user_id: string;
  date: string;
  pain_level: number;
  soreness_level: number;
  stiffness_level: number;
  throws_count: number;
  intensity: number;
  activity_type: string[];
  recovery_done: string[];
  notes: string | null;
  queued_at: string;
}

/** True when an error smells like connectivity rather than a rejected write. */
export function isNetworkError(message: string | undefined): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return /fetch|network|connection|timeout/i.test(message ?? "");
}

export function stashPendingLog(payload: Omit<PendingLog, "queued_at">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...payload, queued_at: new Date().toISOString() }));
  } catch {
    /* storage full/blocked — nothing else we can do */
  }
}

export function getPendingLog(): PendingLog | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingLog) : null;
  } catch {
    return null;
  }
}

export function clearPendingLog(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export type SyncResult = "none" | "synced" | "dropped" | "failed";

/**
 * Push the stashed log for `userId`, if any. "dropped" means the server
 * already had a log for that date (or the stash belongs to another account)
 * and the stash was discarded.
 */
export async function syncPendingLog(userId: string): Promise<SyncResult> {
  const pending = getPendingLog();
  if (!pending) return "none";
  if (pending.user_id !== userId) {
    clearPendingLog();
    return "dropped";
  }

  const { data: existing, error: exErr } = await supabase
    .from("arm_logs")
    .select("id")
    .eq("user_id", pending.user_id)
    .eq("date", pending.date)
    .maybeSingle();
  if (exErr) return "failed";
  if (existing) {
    clearPendingLog();
    return "dropped";
  }

  const { queued_at: _queuedAt, ...payload } = pending;
  const { error } = await supabase.from("arm_logs").insert(payload);
  if (error) return "failed";
  clearPendingLog();
  return "synced";
}
