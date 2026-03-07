// ── Types ─────────────────────────────────────────────────────────────────────

export interface ArmLog {
  id: string;
  date: string;
  pain_level: number;
  soreness_level: number;
  stiffness_level: number;
  throws_count: number;
  activity_type: string[] | null;
  recovery_done: string[] | null;
  notes: string | null;
}

export interface ReadinessState {
  label: string;
  color: string;
  bg: string;
  border: string;
}

// ── Score helpers ─────────────────────────────────────────────────────────────

/** Per-log base score with no modifiers — used for historical comparisons. */
export function computeLogScore(log: ArmLog): number {
  const weighted = (log.pain_level * 3 + log.soreness_level * 2 + log.stiffness_level * 1) / 6;
  return Math.round(Math.max(0, Math.min(10, 10 - weighted)) * 10) / 10;
}

/**
 * Full readiness score from the most recent log, with workload / trend modifiers.
 * Returns null when no logs are available.
 */
export function calculateEstimatedReadiness(logs: ArmLog[]): number | null {
  if (!logs.length) return null;
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];

  const weighted = (latest.pain_level * 3 + latest.soreness_level * 2 + latest.stiffness_level * 1) / 6;
  let score = 10 - weighted;

  // Most recent log throws_count > 100
  if (latest.throws_count > 100) score -= 0.5;

  // Last 2 logs both have throws_count > 75
  if (sorted.length >= 2 && sorted[0].throws_count > 75 && sorted[1].throws_count > 75) score -= 0.5;

  // Pain increased across the last 3 consecutive logs
  if (
    sorted.length >= 3 &&
    sorted[0].pain_level > sorted[1].pain_level &&
    sorted[1].pain_level > sorted[2].pain_level
  ) {
    score -= 0.5;
  }

  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
}

// ── State label ───────────────────────────────────────────────────────────────

export function getReadinessState(score: number): ReadinessState {
  if (score >= 8.5)
    return { label: "Ready", color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" };
  if (score >= 7.0)
    return { label: "Good to Go", color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" };
  if (score >= 5.5)
    return { label: "Proceed with Caution", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
  if (score >= 4.0)
    return { label: "Light Day", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
  if (score >= 2.0)
    return { label: "Rest Recommended", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
  return { label: "Throwing Not Recommended", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
}

// ── Primary recommendation ────────────────────────────────────────────────────

export function getPrimaryRecommendation(score: number, position: string | null): string {
  const pos = (position ?? "").toLowerCase();
  const isPitcher = pos.includes("pitcher");
  const isCatcher = pos.includes("catcher");
  const isFielder = pos.includes("infield") || pos.includes("outfield");

  if (score >= 8.5) {
    if (isPitcher) return "Full bullpen or long toss session — your arm is responding well.";
    if (isCatcher) return "Full receiving session — your arm is in good shape today.";
    if (isFielder) return "Full throwing program — arm feels ready.";
    return "Full session — your arm is responding well based on your recent logs.";
  }
  if (score >= 7.0) {
    if (isPitcher) return "Normal session today — stay within your pitch count plan.";
    if (isCatcher) return "Normal receiving load — monitor how your arm feels.";
    return "Normal session today — stay within your plan.";
  }
  if (score >= 5.5) {
    if (isPitcher) return "Limit intensity today — flat ground or light catch only. No max-effort bullpen.";
    if (isCatcher) return "Reduce receiving volume today — monitor arm during warmup.";
    return "Limit intensity today — monitor how your arm feels during warmup.";
  }
  if (score >= 4.0) {
    if (isPitcher) return "Flat ground or catch only today — avoid all max-effort throwing.";
    return "Light activity only — avoid high-intensity throwing today.";
  }
  if (score >= 2.0) {
    return "Consider a recovery day — ice, band work, and rest based on your recent trend.";
  }
  return "Your recent logs suggest your arm needs rest. Consider skipping today's session and focusing on recovery.";
}

// ── Contextual insights ───────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const today = new Date();
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns up to 2 contextual insight strings.
 * Concerning insights are prioritised over positive ones.
 * @param logs       All available logs (any order — sorted internally).
 * @param recentScores  Per-log base scores for the most recent logs, most-recent first.
 */
export function getContextualInsights(logs: ArmLog[], recentScores: number[]): string[] {
  if (!logs.length) return [];
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const concerning: string[] = [];
  const positive: string[] = [];

  // Pain up 2+ points from the previous log
  if (sorted.length >= 2) {
    const diff = sorted[0].pain_level - sorted[1].pain_level;
    if (diff >= 2) {
      concerning.push(`Pain is up ${diff} points from your last session — take it easy in warmup.`);
    }
  }

  // High throw count in the last log
  if (sorted[0].throws_count > 100) {
    concerning.push("High throwing load yesterday — allow extra recovery time today.");
  }

  // Pain trended up across the last 3 consecutive logs
  if (
    sorted.length >= 3 &&
    sorted[0].pain_level > sorted[1].pain_level &&
    sorted[1].pain_level > sorted[2].pain_level
  ) {
    concerning.push("Pain has trended up for 3 straight sessions — monitor closely.");
  }

  // Gap in logging
  const missed = daysSince(sorted[0].date);
  if (missed >= 2) {
    concerning.push(`You haven't logged in ${missed} days — regular logging helps catch patterns early.`);
  }

  // All metrics under 3 for last 3 logs (positive)
  if (
    sorted.length >= 3 &&
    sorted.slice(0, 3).every((l) => l.pain_level < 3 && l.soreness_level < 3 && l.stiffness_level < 3)
  ) {
    positive.push("Your arm has been feeling consistently good — solid recent trend.");
  }

  // Last 3 readiness scores all above 7 (positive)
  if (recentScores.length >= 3 && recentScores.slice(0, 3).every((s) => s > 7)) {
    positive.push("Strong readiness over your last few sessions — you're in a good rhythm.");
  }

  return [...concerning, ...positive].slice(0, 2);
}

// ── Explanation text ──────────────────────────────────────────────────────────

export function getReadinessExplanation(): string {
  return "Estimated from pain, soreness, stiffness, and recent throwing load.";
}
