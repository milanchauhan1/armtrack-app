import { describe, it, expect } from "vitest";
import { ArmLog } from "./readiness";
import { buildWeeklyRecap, shouldShowRecap } from "./weekly";

const TODAY = "2026-07-03";

function shift(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function log(daysAgo: number, partial: Partial<ArmLog> = {}): ArmLog {
  const date = shift(TODAY, -daysAgo);
  return {
    id: partial.id ?? date,
    date,
    pain_level: partial.pain_level ?? 0,
    soreness_level: partial.soreness_level ?? 0,
    stiffness_level: partial.stiffness_level ?? 0,
    throws_count: partial.throws_count ?? 0,
    activity_type: partial.activity_type ?? null,
    recovery_done: partial.recovery_done ?? null,
    notes: partial.notes ?? null,
  };
}

describe("buildWeeklyRecap", () => {
  it("returns empty stats with no logs", () => {
    const r = buildWeeklyRecap([], TODAY);
    expect(r.week.logsCount).toBe(0);
    expect(r.week.avgPain).toBeNull();
    expect(r.painDelta).toBeNull();
    expect(shouldShowRecap(r)).toBe(false);
  });

  it("splits the two 7-day windows correctly", () => {
    const logs = [
      log(0), // this week (day 0)
      log(6), // this week (boundary)
      log(7), // previous week (boundary)
      log(13), // previous week (boundary)
      log(14), // outside both — ignored
    ];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.week.logsCount).toBe(2);
    expect(r.prevWeek.logsCount).toBe(2);
  });

  it("averages levels and sums throws within the week", () => {
    const logs = [
      log(0, { pain_level: 2, soreness_level: 4, stiffness_level: 6, throws_count: 50 }),
      log(1, { pain_level: 4, soreness_level: 2, stiffness_level: 0, throws_count: 25 }),
    ];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.week.avgPain).toBe(3);
    expect(r.week.avgSoreness).toBe(3);
    expect(r.week.avgStiffness).toBe(3);
    expect(r.week.totalThrows).toBe(75);
  });

  it("computes deltas vs the previous week", () => {
    const logs = [
      log(0, { pain_level: 1, throws_count: 40 }),
      log(1, { pain_level: 1, throws_count: 40 }),
      log(8, { pain_level: 4, throws_count: 100 }),
      log(9, { pain_level: 4, throws_count: 100 }),
    ];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.painDelta).toBe(-3);
    expect(r.throwsDelta).toBe(-120);
  });

  it("leaves deltas null when the previous week is empty", () => {
    const logs = [log(0, { pain_level: 2 }), log(1, { pain_level: 2 })];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.painDelta).toBeNull();
    expect(r.throwsDelta).toBeNull();
    expect(shouldShowRecap(r)).toBe(true);
  });

  it("celebrates a perfect 7-log week", () => {
    const logs = Array.from({ length: 7 }, (_, i) => log(i));
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.headline).toMatch(/all 7 days/);
  });

  it("flags pain trending up", () => {
    const logs = [
      log(0, { pain_level: 5 }),
      log(1, { pain_level: 5 }),
      log(8, { pain_level: 2 }),
      log(9, { pain_level: 2 }),
    ];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.headline).toMatch(/Pain is up/);
  });

  it("celebrates pain trending down", () => {
    const logs = [
      log(0, { pain_level: 1 }),
      log(1, { pain_level: 1 }),
      log(8, { pain_level: 4 }),
      log(9, { pain_level: 4 }),
    ];
    const r = buildWeeklyRecap(logs, TODAY);
    expect(r.headline).toMatch(/trending down/);
  });
});
