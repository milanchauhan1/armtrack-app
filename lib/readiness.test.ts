import { describe, it, expect } from "vitest";
import {
  ArmLog,
  computeLogScore,
  calculateEstimatedReadiness,
  getReadinessState,
  getContextualInsights,
  computeStreak,
  daysSinceLatestLog,
  READINESS_STALE_DAYS,
} from "./readiness";
import { daysAgoString } from "./dates";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Local date string `offset` days before today — must match the lib's
 *  local-timezone dates or these tests fail between 7pm and midnight CT. */
function daysAgo(offset: number): string {
  return daysAgoString(offset);
}

function log(partial: Partial<ArmLog> & { date: string }): ArmLog {
  return {
    id: partial.id ?? partial.date,
    date: partial.date,
    pain_level: partial.pain_level ?? 0,
    soreness_level: partial.soreness_level ?? 0,
    stiffness_level: partial.stiffness_level ?? 0,
    throws_count: partial.throws_count ?? 0,
    activity_type: partial.activity_type ?? null,
    recovery_done: partial.recovery_done ?? null,
    notes: partial.notes ?? null,
  };
}

// ── computeLogScore ──────────────────────────────────────────────────────────

describe("computeLogScore", () => {
  it("returns 10 for a perfectly healthy log", () => {
    expect(computeLogScore(log({ date: "2026-01-01" }))).toBe(10);
  });

  it("returns 0 for a maxed-out (10/10/10) log", () => {
    expect(
      computeLogScore(log({ date: "2026-01-01", pain_level: 10, soreness_level: 10, stiffness_level: 10 })),
    ).toBe(0);
  });

  it("weights pain more heavily than stiffness", () => {
    const painful = computeLogScore(log({ date: "x", pain_level: 6 }));
    const stiff = computeLogScore(log({ date: "x", stiffness_level: 6 }));
    expect(painful).toBeLessThan(stiff);
  });

  it("clamps to the 0–10 range", () => {
    const s = computeLogScore(log({ date: "x", pain_level: 10, soreness_level: 10, stiffness_level: 10 }));
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(10);
  });
});

// ── calculateEstimatedReadiness ──────────────────────────────────────────────

describe("calculateEstimatedReadiness", () => {
  it("returns null with no logs", () => {
    expect(calculateEstimatedReadiness([])).toBeNull();
  });

  it("scores a healthy single log at 10", () => {
    expect(calculateEstimatedReadiness([log({ date: daysAgo(0) })])).toBe(10);
  });

  it("uses the most recent log regardless of input order", () => {
    const logs = [
      log({ date: daysAgo(3), pain_level: 8 }),
      log({ date: daysAgo(0), pain_level: 0 }),
    ];
    expect(calculateEstimatedReadiness(logs)).toBe(10);
  });

  it("applies the high-workload modifier when latest throws_count > 100", () => {
    const score = calculateEstimatedReadiness([log({ date: daysAgo(0), throws_count: 120 })]);
    expect(score).toBe(9.5);
  });

  it("subtracts for two consecutive heavy (>75) sessions", () => {
    const logs = [
      log({ date: daysAgo(0), throws_count: 80 }),
      log({ date: daysAgo(1), throws_count: 80 }),
    ];
    expect(calculateEstimatedReadiness(logs)).toBe(9.5);
  });

  it("subtracts for pain trending up across 3 sessions", () => {
    const logs = [
      log({ date: daysAgo(0), pain_level: 3 }),
      log({ date: daysAgo(1), pain_level: 2 }),
      log({ date: daysAgo(2), pain_level: 1 }),
    ];
    // base for pain 3 = 10 - (3*3/6) = 8.5, minus 0.5 trend = 8.0
    expect(calculateEstimatedReadiness(logs)).toBe(8.0);
  });

  it("never returns below 0", () => {
    const logs = [
      log({ date: daysAgo(0), pain_level: 10, soreness_level: 10, stiffness_level: 10, throws_count: 200 }),
    ];
    expect(calculateEstimatedReadiness(logs)).toBeGreaterThanOrEqual(0);
  });
});

// ── getReadinessState ────────────────────────────────────────────────────────

describe("getReadinessState", () => {
  it("labels high scores green/Ready", () => {
    expect(getReadinessState(9).label).toBe("Ready");
    expect(getReadinessState(9).color).toBe("#22C55E");
  });

  it("never uses the banned 'Do Not Throw' wording at the bottom", () => {
    const label = getReadinessState(0).label;
    expect(label).toBe("Throwing Not Recommended");
    expect(label.toLowerCase()).not.toContain("do not throw");
  });

  it("maps boundary scores to the expected bands", () => {
    expect(getReadinessState(8.5).label).toBe("Ready");
    expect(getReadinessState(7.0).label).toBe("Good to Go");
    expect(getReadinessState(5.5).label).toBe("Proceed with Caution");
    expect(getReadinessState(4.0).label).toBe("Light Day");
    expect(getReadinessState(2.0).label).toBe("Rest Recommended");
    expect(getReadinessState(1.9).label).toBe("Throwing Not Recommended");
  });
});

// ── getContextualInsights ────────────────────────────────────────────────────

describe("getContextualInsights", () => {
  it("returns nothing with no logs", () => {
    expect(getContextualInsights([], [])).toEqual([]);
  });

  it("flags a sharp pain jump from the previous session", () => {
    const logs = [
      log({ date: daysAgo(0), pain_level: 5 }),
      log({ date: daysAgo(1), pain_level: 1 }),
    ];
    const insights = getContextualInsights(logs, []);
    expect(insights.some((i) => i.toLowerCase().includes("pain is up"))).toBe(true);
  });

  it("returns at most 2 insights and prioritises concerning ones", () => {
    const logs = [
      log({ date: daysAgo(0), pain_level: 9, throws_count: 150 }),
      log({ date: daysAgo(1), pain_level: 5 }),
      log({ date: daysAgo(2), pain_level: 3 }),
    ];
    expect(getContextualInsights(logs, []).length).toBeLessThanOrEqual(2);
  });
});

// ── computeStreak ────────────────────────────────────────────────────────────

describe("computeStreak", () => {
  it("returns 0 for no logs", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3);
  });

  it("still counts a streak ending yesterday (today not yet logged)", () => {
    expect(computeStreak([daysAgo(1), daysAgo(2)])).toBe(2);
  });

  it("breaks the streak on a gap", () => {
    expect(computeStreak([daysAgo(0), daysAgo(2), daysAgo(3)])).toBe(1);
  });

  it("returns 0 when the most recent log is older than yesterday", () => {
    expect(computeStreak([daysAgo(3), daysAgo(4)])).toBe(0);
  });

  it("is unaffected by duplicate dates and ordering", () => {
    expect(computeStreak([daysAgo(1), daysAgo(0), daysAgo(0), daysAgo(2)])).toBe(3);
  });
});

// ── daysSinceLatestLog / staleness ───────────────────────────────────────────

describe("daysSinceLatestLog", () => {
  it("returns null with no logs", () => {
    expect(daysSinceLatestLog([])).toBeNull();
  });

  it("returns 0 for a log made today", () => {
    expect(daysSinceLatestLog([log({ date: daysAgo(0) })])).toBe(0);
  });

  it("detects a stale latest log beyond the threshold", () => {
    const days = daysSinceLatestLog([log({ date: daysAgo(5) })]);
    expect(days).not.toBeNull();
    expect(days! >= READINESS_STALE_DAYS).toBe(true);
  });
});
