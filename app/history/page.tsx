"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArmLog, computeLogScore, getReadinessState } from "@/lib/readiness";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDay(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const today = getTodayString();
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  if (!set.has(cursor)) return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

function dotColor(score: number): string {
  if (score >= 7) return "#22C55E";
  if (score >= 4) return "#F59E0B";
  return "#EF4444";
}

function scoreColor(v: number): string {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

function getDayLetter(dateStr: string): string {
  return ["S", "M", "T", "W", "T", "F", "S"][new Date(dateStr + "T12:00:00").getDay()];
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      delay: i * 0.05,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ── Log row ────────────────────────────────────────────────────────────────────

function LogRow({ log, index }: { log: ArmLog; index: number }) {
  const [open, setOpen] = useState(false);
  const score = computeLogScore(log);
  const meta = getReadinessState(score);
  const isToday = log.date === getTodayString();

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      onClick={() => setOpen((o) => !o)}
      className="cursor-pointer"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: open ? "#161616" : "#111111",
          border: "1px solid #222222",
          transition: "background-color 150ms ease",
        }}
      >
        {/* Collapsed row */}
        <div className="px-4 py-4 flex items-start gap-3">
          {/* Left: date + activity */}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white leading-tight">
                {formatDateFull(log.date)}
              </span>
              {isToday && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#60a5fa" }}
                >
                  Today
                </span>
              )}
            </div>
            {(log.activity_type?.length ?? 0) > 0 && (
              <span className="text-xs" style={{ color: "#555" }}>
                {log.activity_type!.join(" · ")}
              </span>
            )}
          </div>

          {/* Right: badges + chevron */}
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {/* Readiness score */}
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-black tabular-nums"
              style={{
                backgroundColor: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.color,
              }}
            >
              {score.toFixed(1)}
            </span>

            {/* P / S / St */}
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{
                backgroundColor: `${scoreColor(log.pain_level)}15`,
                color: scoreColor(log.pain_level),
              }}
            >
              P{log.pain_level}
            </span>
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{
                backgroundColor: `${scoreColor(log.soreness_level)}15`,
                color: scoreColor(log.soreness_level),
              }}
            >
              S{log.soreness_level}
            </span>
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{
                backgroundColor: `${scoreColor(log.stiffness_level)}15`,
                color: scoreColor(log.stiffness_level),
              }}
            >
              St{log.stiffness_level}
            </span>

            {/* Throw count */}
            {log.throws_count > 0 && (
              <span
                className="rounded-lg px-2 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: "#1a1a1a", color: "#666" }}
              >
                {log.throws_count}
              </span>
            )}

            {/* Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-gray-700 flex-shrink-0 ml-0.5"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
              }}
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              <div
                className="px-4 pb-4 pt-3 flex flex-col gap-2.5"
                style={{ borderTop: "1px solid #1e1e1e" }}
              >
                {(log.recovery_done?.length ?? 0) > 0 && (
                  <div className="flex gap-2 items-start flex-wrap">
                    <span className="text-xs shrink-0 mt-0.5" style={{ color: "#555" }}>
                      Recovery:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.recovery_done!.map((r) => (
                        <span
                          key={r}
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: "rgba(59,130,246,0.08)",
                            color: "#60a5fa",
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {log.notes ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs" style={{ color: "#555" }}>
                      Notes
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: "#aaa" }}>
                      {log.notes}
                    </span>
                  </div>
                ) : (log.recovery_done?.length ?? 0) === 0 ? (
                  <p className="text-xs italic" style={{ color: "#444" }}>
                    No additional details
                  </p>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ArmLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("arm_logs")
        .select(
          "id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes"
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      setLogs((data ?? []) as ArmLog[]);
      setLoading(false);
    }
    load();
  }, [router]);

  // Scroll today into view after mount
  useEffect(() => {
    if (!loading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [loading]);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const today = getTodayString();

  // 14-day calendar (oldest → newest)
  const calendarDays: string[] = [];
  for (let i = 13; i >= 0; i--) calendarDays.push(shiftDay(today, -i));

  // Index logs by date (first entry per date)
  const logByDate = new Map<string, ArmLog>();
  logs.forEach((l) => {
    if (!logByDate.has(l.date)) logByDate.set(l.date, l);
  });

  // Stats (last 14 days only)
  const last14Logs = logs.filter((l) => calendarDays.includes(l.date));
  const avgReadiness =
    last14Logs.length > 0
      ? Math.round(
          (last14Logs.reduce((sum, l) => sum + computeLogScore(l), 0) / last14Logs.length) * 10
        ) / 10
      : null;
  const totalThrows = last14Logs.reduce((sum, l) => sum + (l.throws_count ?? 0), 0);
  const streak = computeStreak(logs.map((l) => l.date));

  // Filtered log list
  const displayedLogs = selectedDate
    ? logs.filter((l) => l.date === selectedDate)
    : logs;

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4"
        style={{ borderBottom: "1px solid #111111" }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
      </nav>

      <div className="mx-auto max-w-[600px] px-4 pt-6 flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
            Your History
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Track your arm over time
          </h1>
        </motion.div>

        {/* ── 14-Day Calendar Strip ───────────────────────────────────────────── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last 14 Days
              </p>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Show all
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {calendarDays.map((day) => {
                const log = logByDate.get(day);
                const score = log ? computeLogScore(log) : null;
                const isToday = day === today;
                const isSelected = selectedDate === day;

                return (
                  <button
                    key={day}
                    ref={isToday ? todayRef : undefined}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 flex-shrink-0 transition-all duration-150"
                    style={{
                      width: 40,
                      minWidth: 40,
                      backgroundColor: isSelected
                        ? "rgba(59,130,246,0.18)"
                        : isToday
                        ? "rgba(59,130,246,0.08)"
                        : "transparent",
                      border: isToday
                        ? "1.5px solid rgba(59,130,246,0.45)"
                        : isSelected
                        ? "1.5px solid rgba(59,130,246,0.6)"
                        : "1.5px solid transparent",
                      boxShadow: (isToday || isSelected) ? "0 0 12px rgba(59,130,246,0.2)" : "none",
                    }}
                  >
                    {/* Day letter */}
                    <span
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: isToday || isSelected ? "#60a5fa" : "#555" }}
                    >
                      {getDayLetter(day)}
                    </span>

                    {/* Date number */}
                    <span
                      className="text-sm font-bold tabular-nums leading-none"
                      style={{ color: isToday || isSelected ? "#fff" : "#888" }}
                    >
                      {new Date(day + "T12:00:00").getDate()}
                    </span>

                    {/* Status dot */}
                    <span
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: 6,
                        height: 6,
                        backgroundColor: score !== null ? dotColor(score) : "#2a2a2a",
                        boxShadow: score !== null ? `0 0 4px ${dotColor(score)}60` : "none",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ───────────────────────────────────────────────────────── */}
        {logs.length > 0 && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <div className="grid grid-cols-3 gap-3">
              {/* Avg Readiness */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1"
                style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e", borderTop: "2px solid #22C55E" }}
              >
                <span
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{
                    color:
                      avgReadiness !== null
                        ? avgReadiness >= 7
                          ? "#22C55E"
                          : avgReadiness >= 4
                          ? "#F59E0B"
                          : "#EF4444"
                        : "#444",
                  }}
                >
                  {avgReadiness !== null ? avgReadiness.toFixed(1) : "—"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 leading-tight">
                  Avg Readiness
                </span>
                <span className="text-[9px] text-gray-700">Last 14 days</span>
              </div>

              {/* Total Throws */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1"
                style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e", borderTop: "2px solid #3B82F6" }}
              >
                <span className="text-2xl font-black tabular-nums leading-none text-white">
                  {totalThrows > 0 ? totalThrows.toLocaleString() : "—"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 leading-tight">
                  Total Throws
                </span>
                <span className="text-[9px] text-gray-700">Last 14 days</span>
              </div>

              {/* Streak */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1"
                style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e", borderTop: "2px solid #F59E0B" }}
              >
                <span
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{ color: streak > 0 ? "#fb923c" : "#444" }}
                >
                  {streak > 0 ? streak : "—"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 leading-tight">
                  Day Streak
                </span>
                <span className="text-[9px] text-gray-700">
                  {streak > 0 ? "Keep it going 🔥" : "Start logging"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Log List ────────────────────────────────────────────────────────── */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">

          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">
              {selectedDate
                ? `Logs for ${formatDateFull(selectedDate)}`
                : "All Sessions"}
            </p>
            <Link
              href="/log"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Add log
            </Link>
          </div>

          {/* Empty state */}
          {displayedLogs.length === 0 && (
            <div
              className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
              style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
            >
              {selectedDate ? (
                <>
                  <p className="text-3xl">📅</p>
                  <p className="text-sm font-semibold text-white">No log for this day</p>
                  <p className="text-xs text-gray-500">
                    You didn&apos;t log a session on {formatDateFull(selectedDate)}.
                  </p>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Show all sessions
                  </button>
                </>
              ) : (
                <>
                  <p className="text-4xl">💪</p>
                  <div>
                    <p className="text-base font-bold text-white mb-1">
                      No logs yet — start tracking your arm today
                    </p>
                    <p className="text-xs text-gray-500">
                      Every session you log builds a picture of your arm health over time.
                    </p>
                  </div>
                  <Link
                    href="/log"
                    className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    Log today&apos;s session
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Log rows */}
          {displayedLogs.length > 0 && (
            <div className="flex flex-col gap-2">
              {displayedLogs.map((log, i) => (
                <LogRow key={log.id} log={log} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
