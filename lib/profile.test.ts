import { describe, it, expect } from "vitest";
import {
  normalizeUsername,
  validateUsername,
  RESERVED_USERNAMES,
  computeProfileStats,
  formatTrackingSince,
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
