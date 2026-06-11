import { describe, it, expect } from "vitest";
import {
  normalizeUsername,
  validateUsername,
  RESERVED_USERNAMES,
  computeProfileStats,
  formatTrackingSince,
  buildPublicStats,
  displayedStreak,
} from "./profile";

describe("normalizeUsername", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsername("  JakeThrows ")).toBe("jakethrows");
  });
});

describe("validateUsername", () => {
  it("accepts a valid handle", () => {
    expect(validateUsername("jake_throws22")).toEqual({ ok: true, value: "jake_throws22" });
  });
  it("normalizes case on accept", () => {
    expect(validateUsername("JakeThrows")).toEqual({ ok: true, value: "jakethrows" });
  });
  it("rejects too short", () => {
    expect(validateUsername("ab").ok).toBe(false);
  });
  it("rejects too long (>20)", () => {
    expect(validateUsername("a".repeat(21)).ok).toBe(false);
  });
  it("rejects illegal characters", () => {
    expect(validateUsername("jake.throws").ok).toBe(false);
    expect(validateUsername("jake throws").ok).toBe(false);
    expect(validateUsername("jake-throws").ok).toBe(false);
  });
  it("rejects reserved words (case-insensitive)", () => {
    expect(validateUsername("Admin").ok).toBe(false);
    expect(RESERVED_USERNAMES.has("dashboard")).toBe(true);
  });
});

describe("computeProfileStats", () => {
  it("returns zeros for no logs", () => {
    expect(computeProfileStats([])).toEqual({ streak: 0, totalLogs: 0, trackingSince: null });
  });
  it("counts total logs and finds earliest date", () => {
    const stats = computeProfileStats(["2026-06-01", "2026-06-03", "2026-06-02"]);
    expect(stats.totalLogs).toBe(3);
    expect(stats.trackingSince).toBe("2026-06-01");
  });
});

describe("formatTrackingSince", () => {
  it("formats a date as Month Year", () => {
    expect(formatTrackingSince("2026-06-01")).toBe("June 2026");
  });
  it("returns empty string for null", () => {
    expect(formatTrackingSince(null)).toBe("");
  });
});

describe("buildPublicStats", () => {
  it("returns empty stats for no logs", () => {
    expect(buildPublicStats([])).toEqual({
      totalLogs: 0,
      currentStreak: 0,
      lastLogDate: null,
      firstLogDate: null,
    });
  });
  it("derives total, first, and last from dates", () => {
    const s = buildPublicStats(["2026-06-03", "2026-06-01", "2026-06-02"]);
    expect(s.totalLogs).toBe(3);
    expect(s.firstLogDate).toBe("2026-06-01");
    expect(s.lastLogDate).toBe("2026-06-03");
  });
});

describe("displayedStreak", () => {
  it("shows the stored streak when last log was today", () => {
    expect(displayedStreak(5, "2026-06-11", "2026-06-11")).toBe(5);
  });
  it("shows the stored streak when last log was yesterday", () => {
    expect(displayedStreak(5, "2026-06-10", "2026-06-11")).toBe(5);
  });
  it("shows 0 when the streak has gone stale", () => {
    expect(displayedStreak(5, "2026-06-08", "2026-06-11")).toBe(0);
  });
  it("shows 0 when there is no last log", () => {
    expect(displayedStreak(0, null, "2026-06-11")).toBe(0);
  });
});
