// Weekly recap — pure aggregation of the last 7 days of logs vs the 7 before.
// No side effects; rendered as the "Your Week" card on the dashboard.

import { ArmLog } from "./readiness";
import { todayString, shiftDay } from "./dates";

export interface WeekStats {
  logsCount: number;
  totalThrows: number;
  /** Averages across logged days only; null when the window has no logs. */
  avgPain: number | null;
  avgSoreness: number | null;
  avgStiffness: number | null;
}

export interface WeeklyRecap {
  week: WeekStats;
  prevWeek: WeekStats;
  /** week minus prevWeek, rounded to 1 decimal; null when either side has no logs. */
  painDelta: number | null;
  sorenessDelta: number | null;
  throwsDelta: number | null;
  /** One rule-based, plain-language line about the week. */
  headline: string;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function statsFor(logs: ArmLog[], from: string, to: string): WeekStats {
  const inWindow = logs.filter((l) => l.date >= from && l.date <= to);
  if (inWindow.length === 0) {
    return { logsCount: 0, totalThrows: 0, avgPain: null, avgSoreness: null, avgStiffness: null };
  }
  const sum = (f: (l: ArmLog) => number) => inWindow.reduce((a, l) => a + f(l), 0);
  return {
    logsCount: inWindow.length,
    totalThrows: sum((l) => l.throws_count),
    avgPain: round1(sum((l) => l.pain_level) / inWindow.length),
    avgSoreness: round1(sum((l) => l.soreness_level) / inWindow.length),
    avgStiffness: round1(sum((l) => l.stiffness_level) / inWindow.length),
  };
}

function pickHeadline(recap: Omit<WeeklyRecap, "headline">): string {
  const { week, painDelta, sorenessDelta } = recap;

  if (week.logsCount === 7) {
    return "Perfect week — you logged all 7 days.";
  }
  if (painDelta !== null && painDelta <= -1) {
    return "Pain is trending down vs last week. Whatever you're doing, keep doing it.";
  }
  if (painDelta !== null && painDelta >= 1) {
    return "Pain is up vs last week — your data suggests easing the workload.";
  }
  if (sorenessDelta !== null && sorenessDelta >= 1.5) {
    return "Soreness climbed this week — recovery work matters most right now.";
  }
  if (week.avgPain !== null && week.avgPain <= 2 && week.logsCount >= 4) {
    return "Low pain all week with consistent logging. That's how arms stay healthy.";
  }
  if (week.logsCount >= 5) {
    return `${week.logsCount} logs this week — your readiness estimate is well fed.`;
  }
  return "More logs mean a sharper picture. Aim for every day this week.";
}

/**
 * Recap of the rolling 7-day window ending `today`, compared to the 7 days
 * before it. `today` is injectable for testing.
 */
export function buildWeeklyRecap(logs: ArmLog[], today: string = todayString()): WeeklyRecap {
  const weekFrom = shiftDay(today, -6);
  const prevTo = shiftDay(today, -7);
  const prevFrom = shiftDay(today, -13);

  const week = statsFor(logs, weekFrom, today);
  const prevWeek = statsFor(logs, prevFrom, prevTo);

  const delta = (a: number | null, b: number | null) =>
    a !== null && b !== null ? round1(a - b) : null;

  const partial: Omit<WeeklyRecap, "headline"> = {
    week,
    prevWeek,
    painDelta: delta(week.avgPain, prevWeek.avgPain),
    sorenessDelta: delta(week.avgSoreness, prevWeek.avgSoreness),
    throwsDelta: prevWeek.logsCount > 0 ? week.totalThrows - prevWeek.totalThrows : null,
  };

  return { ...partial, headline: pickHeadline(partial) };
}

/** Only show the card when there's enough data to say something useful. */
export function shouldShowRecap(recap: WeeklyRecap): boolean {
  return recap.week.logsCount >= 2;
}
