"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArmLog,
  calculateEstimatedReadiness,
  getReadinessState,
  getPrimaryRecommendation,
  getContextualInsights,
  getReadinessExplanation,
  computeLogScore,
} from "@/lib/readiness";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  first_name: string;
  onboarding_complete: boolean;
  position: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  function shiftDay(dateStr: string, n: number): string {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  }
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

function scoreColor(v: number): string {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
    >
      {children}
    </div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl py-3 px-2"
      style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
    >
      <span className="text-2xl font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: "#181818", border: "1px solid #2a2a2a" }}
    >
      <p className="mb-2 font-semibold text-gray-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function LogRow({ log, index }: { log: ArmLog; index: number }) {
  const [open, setOpen] = useState(false);
  const isToday = log.date === getTodayString();

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div
        className="rounded-xl p-4 transition-colors duration-150"
        style={{ backgroundColor: open ? "#161616" : "#111111", border: "1px solid #222222" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{formatDateFull(log.date)}</span>
              {isToday && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#60a5fa" }}
                >
                  Today
                </span>
              )}
            </div>
            {log.activity_type?.length ? (
              <span className="mt-0.5 text-xs text-gray-500">{log.activity_type.join(" · ")}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.pain_level)}15`, color: scoreColor(log.pain_level) }}
            >
              P {log.pain_level}
            </span>
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.soreness_level)}15`, color: scoreColor(log.soreness_level) }}
            >
              S {log.soreness_level}
            </span>
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.stiffness_level)}15`, color: scoreColor(log.stiffness_level) }}
            >
              St {log.stiffness_level}
            </span>
            {log.throws_count > 0 && (
              <span
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-400"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                {log.throws_count} throws
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-gray-600 transition-transform duration-200 flex-shrink-0"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid #1e1e1e" }}>
                {log.recovery_done?.length ? (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 shrink-0 mt-0.5">Recovery:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.recovery_done.map((r) => (
                        <span
                          key={r}
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: "rgba(59,130,246,0.08)", color: "#60a5fa" }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {log.notes ? (
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500 shrink-0 mt-0.5">Notes:</span>
                    <span className="text-xs text-gray-300 leading-relaxed">{log.notes}</span>
                  </div>
                ) : (
                  !log.recovery_done?.length && (
                    <p className="text-xs text-gray-600 italic">No additional details</p>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentLog, setRecentLog] = useState<ArmLog | null>(null);
  const [logs14, setLogs14] = useState<ArmLog[]>([]);
  const [logs7, setLogs7] = useState<ArmLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [chartMounted, setChartMounted] = useState(false);

  useEffect(() => {
    setChartMounted(true);
  }, []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, onboarding_complete, position")
        .eq("id", user.id)
        .single();

      if (!prof?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }

      setProfile(prof);

      const { data: allDates } = await supabase
        .from("arm_logs")
        .select("date")
        .eq("user_id", user.id);

      if (allDates) setStreak(computeStreak(allDates.map((l) => l.date)));

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
      const cutoff = fourteenDaysAgo.toISOString().split("T")[0];

      const { data: recent14 } = await supabase
        .from("arm_logs")
        .select("id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes")
        .eq("user_id", user.id)
        .gte("date", cutoff)
        .order("date", { ascending: false });

      const logs = (recent14 ?? []) as ArmLog[];
      setLogs14([...logs].sort((a, b) => a.date.localeCompare(b.date)));
      setLogs7(logs.slice(0, 7));

      if (logs.length > 0) {
        const today = getTodayString();
        const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        setRecentLog(sorted[0]);
        setLoggedToday(sorted[0].date === today);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const readiness = calculateEstimatedReadiness(logs7);
  const meta = readiness !== null ? getReadinessState(readiness) : null;

  // Per-log base scores (most-recent first) for contextual insight checks
  const recentScores = logs7.slice(0, 3).map(computeLogScore);
  const insights = getContextualInsights(logs7, recentScores);

  const chartData = logs14.map((l) => ({
    date: formatDateShort(l.date),
    Pain: l.pain_level,
    Soreness: l.soreness_level,
    Stiffness: l.stiffness_level,
  }));

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4 sm:px-10"
        style={{ borderBottom: "1px solid #111" }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/30 hover:text-white cursor-pointer"
        >
          Sign out
        </button>
      </nav>

      <div className="mx-auto max-w-2xl px-5 pt-8">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
            {getGreeting()}, {profile?.first_name}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Arm Health Dashboard</h1>
            {streak > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: "rgba(249,115,22,0.10)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  color: "#fb923c",
                }}
              >
                🔥 {streak}-day streak
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Arm Health Status ────────────────────────────────────────────────── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
          <Card>
            {recentLog && meta ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Big score */}
                <div className="flex items-baseline gap-3 sm:min-w-[160px]">
                  <span className="text-7xl font-black tabular-nums leading-none" style={{ color: meta.color }}>
                    {readiness!.toFixed(1)}
                  </span>
                  <span className="text-lg text-gray-600 font-medium">/10</span>
                </div>

                {/* Label + sub-scores */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <div
                      className="inline-flex self-start items-center rounded-full px-3 py-1.5 text-sm font-bold"
                      style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
                    >
                      {meta.label}
                    </div>
                    <p className="text-xs text-gray-500 pl-1">Based on your recent logs</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreBadge label="Pain" value={recentLog.pain_level} />
                    <ScoreBadge label="Soreness" value={recentLog.soreness_level} />
                    <ScoreBadge label="Stiffness" value={recentLog.stiffness_level} />
                  </div>
                  <p className="text-xs text-gray-600">{getReadinessExplanation()}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-3 text-center">
                <p className="text-4xl">💪</p>
                <p className="text-base font-bold text-white">No logs yet</p>
                <p className="text-sm text-gray-400">Start logging to see your arm health score here.</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Daily Recommendation ─────────────────────────────────────────────── */}
        {recentLog && meta && readiness !== null && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
            >
              {/* Card header */}
              <div className="flex items-center gap-2 mb-3">
                <svg
                  width="15"
                  height="16"
                  viewBox="0 0 15 16"
                  fill="none"
                  className="flex-shrink-0"
                  style={{ color: "#6b7280" }}
                >
                  <path
                    d="M7.5 1L13 3.5V8C13 11.5 10.5 14.5 7.5 15C4.5 14.5 2 11.5 2 8V3.5L7.5 1Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm font-bold text-white">Today&apos;s Recommendation</p>
              </div>

              {/* Primary recommendation */}
              <p className="text-sm font-semibold text-white leading-relaxed mb-3">
                {getPrimaryRecommendation(readiness, profile?.position ?? null)}
              </p>

              {/* Contextual insights */}
              {insights.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-3">
                  {insights.map((insight, i) => (
                    <p key={i} className="text-xs leading-relaxed" style={{ color: "#888888" }}>
                      · {insight}
                    </p>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] leading-relaxed" style={{ color: "#555555" }}>
                ArmTrack tracks patterns to support your decisions — not to diagnose injuries. Always listen to your body and your coach.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {loggedToday ? (
              <button
                disabled
                className="rounded-xl py-3.5 text-sm font-bold cursor-not-allowed"
                style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
              >
                Logged Today ✓
              </button>
            ) : (
              <Link
                href="/log"
                className="rounded-xl py-3.5 text-sm font-bold text-white text-center transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Log Today
              </Link>
            )}
            <a
              href="#history"
              className="rounded-xl py-3.5 text-sm font-bold text-center transition-all duration-150"
              style={{ backgroundColor: "#111111", border: "1px solid #222222", color: "#9ca3af" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              View History
            </a>
          </div>
        </motion.div>

        {/* ── 14-Day Trend Chart ───────────────────────────────────────────────── */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
          <Card>
            <p className="text-sm font-bold text-white mb-4">14-Day Trend</p>
            {chartMounted && chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#4b5563", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fill: "#4b5563", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: "12px" }}
                  />
                  <Line type="monotone" dataKey="Pain" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ef4444" }} />
                  <Line type="monotone" dataKey="Soreness" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
                  <Line type="monotone" dataKey="Stiffness" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : chartData.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <p className="text-3xl">📈</p>
                <p className="text-sm font-semibold text-white">Log more sessions to see your trends</p>
                <p className="text-xs text-gray-500">You need at least 2 logs to generate a chart.</p>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Recent Logs ──────────────────────────────────────────────────────── */}
        <motion.div
          id="history"
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Recent Logs</p>
            <Link href="/log" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              + Add log
            </Link>
          </div>

          {logs7.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <p className="text-3xl">📋</p>
                <p className="text-sm font-semibold text-white">No logs yet</p>
                <p className="text-xs text-gray-500">Your logged sessions will appear here.</p>
                <Link
                  href="/log"
                  className="mt-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  Log your first session
                </Link>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {logs7.map((log, i) => (
                <LogRow key={log.id} log={log} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
