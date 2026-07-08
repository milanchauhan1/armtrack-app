"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { DashboardSkeleton } from "@/components/Skeleton";
import DashboardTour from "@/components/DashboardTour";
import { scheduleArmLogReminder } from "@/lib/notifications";
import dynamic from "next/dynamic";
import { CheckCircle, Shield, MessageSquare, Flame, Activity, TrendingUp, ClipboardList, Check, WifiOff, Compass, User } from "lucide-react";
import {
  ArmLog,
  calculateEstimatedReadiness,
  getReadinessState,
  getPrimaryRecommendation,
  getContextualInsights,
  getReadinessExplanation,
  computeLogScore,
  daysSinceLatestLog,
  READINESS_STALE_DAYS,
} from "@/lib/readiness";
import { buildPublicStats } from "@/lib/profile";
import { buildWeeklyRecap, shouldShowRecap } from "@/lib/weekly";
import { syncPendingLog } from "@/lib/offlineQueue";
import { todayString as getTodayString, daysAgoString } from "@/lib/dates";

// Loaded on demand so Recharts stays out of the dashboard's initial bundle.
const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  first_name: string;
  onboarding_complete: boolean;
  position: string | null;
  role: string | null;
  team_id: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function scoreColor(v: number): string {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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
      style={{ backgroundColor: "#111111", border: "1px solid #222222", boxShadow: "0 0 24px rgba(59,130,246,0.07)" }}
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

function RecapStat({
  label,
  value,
  delta,
  deltaGoodWhenDown,
}: {
  label: string;
  value: string;
  delta: number | null;
  /** Pain/soreness improve when they drop; throws are neutral. */
  deltaGoodWhenDown?: boolean;
}) {
  let deltaEl: React.ReactNode = null;
  if (delta !== null && delta !== 0) {
    const up = delta > 0;
    const color =
      deltaGoodWhenDown === undefined ? "#6b7280" : up === !deltaGoodWhenDown ? "#22c55e" : "#ef4444";
    deltaEl = (
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
        {up ? "▲" : "▼"} {Math.abs(delta)}
      </span>
    );
  }
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-xl py-3 px-1"
      style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
    >
      <span className="text-xl font-black tabular-nums text-white">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      {deltaEl ?? <span className="text-[10px] text-gray-700">—</span>}
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
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentLog, setRecentLog] = useState<ArmLog | null>(null);
  const [logs14, setLogs14] = useState<ArmLog[]>([]);
  const [logs7, setLogs7] = useState<ArmLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [isAnon, setIsAnon] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [coachRec, setCoachRec] = useState<string | null>(null);
  const [teamMsg, setTeamMsg] = useState<{
    message: string;
    coach_name: string;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    const msg = sessionStorage.getItem("toast");
    if (!msg) return;
    sessionStorage.removeItem("toast");
    // Deferred so the effect body itself doesn't set state synchronously.
    const show = setTimeout(() => setToast(msg), 0);
    const hide = setTimeout(() => setToast(null), 4000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const user = session.user;
      setIsAnon(user.is_anonymous ?? false);

      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, onboarding_complete, position, role, team_id")
        .eq("id", user.id)
        .single();

      if (!prof?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }

      setProfile(prof);

      // Push any log saved offline BEFORE fetching, so it's included below.
      const syncResult = await syncPendingLog(user.id).catch(() => "failed" as const);
      if (syncResult === "synced") {
        setToast("Offline log synced ✓");
        setTimeout(() => setToast(null), 4000);
      }

      const nowIso = new Date().toISOString();
      const cutoff = daysAgoString(13);

      // Everything below only depends on the profile, not on each other — run
      // them in parallel so the dashboard waits on one round-trip, not five.
      const [recRes, teamMsgInfo, allDatesRes, recent14Res] = await Promise.all([
        // Active coach recommendation for today
        supabase
          .from("coach_recommendations")
          .select("recommendation")
          .eq("player_id", user.id)
          .gt("expires_at", nowIso)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Most recent team message from the last 24h (+ coach's name), if on a team
        (async () => {
          if (!prof?.team_id) return null;
          const yesterday = new Date();
          yesterday.setHours(yesterday.getHours() - 24);
          const { data: msgRows } = await supabase
            .from("coach_messages")
            .select("message, created_at, coach_id")
            .eq("team_id", prof.team_id)
            .or(`player_id.eq.${user.id},player_id.is.null`)
            .gte("created_at", yesterday.toISOString())
            .order("created_at", { ascending: false })
            .limit(1);
          if (!msgRows || msgRows.length === 0) return null;
          const latest = msgRows[0] as { message: string; created_at: string; coach_id: string };
          const { data: coachProf } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", latest.coach_id)
            .single();
          return {
            message: latest.message,
            coach_name: (coachProf as { first_name: string } | null)?.first_name ?? "Coach",
            created_at: latest.created_at,
          };
        })(),
        // All log dates (for streak/stats)
        supabase.from("arm_logs").select("date").eq("user_id", user.id),
        // Last 14 days of detail (for readiness + trends)
        supabase
          .from("arm_logs")
          .select("id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes")
          .eq("user_id", user.id)
          .gte("date", cutoff)
          .order("date", { ascending: false }),
      ]);

      if (recRes.data) setCoachRec((recRes.data as { recommendation: string }).recommendation);
      if (teamMsgInfo) setTeamMsg(teamMsgInfo);

      const allDates = allDatesRes.data;
      if (allDates) {
        const stats = buildPublicStats(allDates.map((l) => l.date));
        setStreak(stats.currentStreak);
        // Re-arm the daily reminders so the copy reflects the live streak and
        // an already-logged day never fires a nag.
        scheduleArmLogReminder(stats.currentStreak, stats.lastLogDate === getTodayString()).catch(
          () => {}
        );
        // The denormalized public-profile stats (total_logs, current_streak, …)
        // are maintained by a database trigger on arm_logs — clients can't
        // write them, so streaks can't be faked.
      }

      const logs = (recent14Res.data ?? []) as ArmLog[];
      setLogs14([...logs].sort((a, b) => a.date.localeCompare(b.date)));
      setLogs7(logs.slice(0, 7));

      if (logs.length > 0) {
        const today = getTodayString();
        const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        setRecentLog(sorted[0]);
        setLoggedToday(sorted[0].date === today);
      }

      setLoading(false);
      } catch {
        setLoadError(true);
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
        >
          <WifiOff size={26} strokeWidth={1.75} className="text-gray-400" />
        </div>
        <div>
          <p className="text-base font-bold text-white">Couldn&apos;t load your dashboard</p>
          <p className="mt-1 text-sm text-gray-400">Check your connection and try again.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#3B82F6" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const readiness = calculateEstimatedReadiness(logs7);
  const meta = readiness !== null ? getReadinessState(readiness) : null;
  const staleDays = recentLog ? daysSinceLatestLog([recentLog]) : null;
  const isStale = staleDays !== null && staleDays >= READINESS_STALE_DAYS;

  // Per-log base scores (most-recent first) for contextual insight checks
  const recentScores = logs7.slice(0, 3).map(computeLogScore);
  const insights = getContextualInsights(logs7, recentScores);

  const chartData = logs14.map((l) => ({
    date: formatDateShort(l.date),
    Pain: l.pain_level,
    Soreness: l.soreness_level,
    Stiffness: l.stiffness_level,
  }));

  const recap = buildWeeklyRecap(logs14);
  const showRecap = shouldShowRecap(recap);

  return (
    <div className="min-h-screen bg-black pb-20">
      <DashboardTour />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-1/2 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
            style={{
              transform: "translateX(-50%)",
              backgroundColor: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#22C55E",
              backdropFilter: "blur(12px)",
            }}
          >
            <CheckCircle size={15} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-3.5 sm:px-10"
        style={{ backgroundColor: "rgba(0,0,0,0.8)", borderBottom: "1px solid #1a1a1a", backdropFilter: "blur(12px)" }}
      >
        <span className="shrink-0 text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/discover"
            aria-label="Discover"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/25 hover:bg-white/5 hover:text-white sm:px-3.5"
          >
            <Compass size={17} strokeWidth={2} />
            <span className="hidden sm:inline">Discover</span>
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            data-tour="profile"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/25 hover:bg-white/5 hover:text-white sm:px-3.5"
          >
            <User size={17} strokeWidth={2} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-5 pt-8">
        {/* Save-progress nudge — only for anonymous users (no email yet) */}
        {isAnon && (
          <Link
            href="/save"
            className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ backgroundColor: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.35)" }}
          >
            <Shield size={20} className="shrink-0 text-blue-400" />
            <span className="flex-1 text-sm leading-snug text-white">
              <span className="font-bold">Save your progress.</span>{" "}
              <span className="text-gray-300">Add an email to keep your streak and sync across devices.</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-blue-400">Save →</span>
          </Link>
        )}

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
            {getGreeting()}, {profile?.first_name}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Arm Health Dashboard</h1>
            {streak > 0 ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-extrabold"
                style={{
                  backgroundColor: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.35)",
                  color: "#fb923c",
                  boxShadow: "0 0 18px rgba(249,115,22,0.18)",
                }}
              >
                <Flame size={15} strokeWidth={2.4} fill="currentColor" /> {streak}-day streak
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold"
                style={{ backgroundColor: "#141414", border: "1px solid #252525", color: "#888888" }}
              >
                <Flame size={14} strokeWidth={2} /> Start your streak today
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Arm Health Status ────────────────────────────────────────────────── */}
        <motion.div data-tour="readiness" custom={1} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
          <Card>
            {recentLog && meta ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Big score */}
                <div className="relative flex items-baseline gap-3 sm:min-w-[160px]">
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "40%",
                      transform: "translate(-50%, -50%)",
                      width: 160,
                      height: 160,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${meta.color}28 0%, transparent 70%)`,
                      filter: "blur(24px)",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    className="relative font-black tabular-nums leading-none"
                    style={{ color: isStale ? "#6b7280" : meta.color, fontSize: 88, opacity: isStale ? 0.7 : 1 }}
                  >
                    {readiness!.toFixed(1)}
                  </span>
                  <span className="relative text-lg text-gray-600 font-medium">/10</span>
                </div>

                {/* Label + sub-scores */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <div
                      className="inline-flex self-start items-center rounded-full px-3 py-1.5 text-sm font-bold"
                      style={
                        isStale
                          ? { backgroundColor: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }
                          : { backgroundColor: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }
                      }
                    >
                      {isStale ? "Needs a fresh log" : meta.label}
                    </div>
                    <p className="text-xs text-gray-500 pl-1">
                      {isStale
                        ? `Based on a log from ${staleDays} days ago — log today to refresh.`
                        : "Based on your recent logs"}
                    </p>
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
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                >
                  <Activity size={26} strokeWidth={1.75} className="text-blue-500" />
                </div>
                <p className="text-base font-bold text-white">No logs yet</p>
                <p className="text-sm text-gray-400">Start logging to see your arm health score here.</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── From Your Coach ──────────────────────────────────────────────────── */}
        {coachRec && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #222222",
                borderLeft: "3px solid #3B82F6",
                boxShadow: "0 0 24px rgba(59,130,246,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} style={{ color: "#3B82F6" }} />
                <p className="text-sm font-bold text-white">From Your Coach</p>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed mb-2">{coachRec}</p>
              <p className="text-xs" style={{ color: "#555555" }}>Sent by your coach today</p>
            </div>
          </motion.div>
        )}

        {/* ── Team Message ─────────────────────────────────────────────────────── */}
        {teamMsg && (
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={15} style={{ color: "#555555" }} />
                <p className="text-sm font-bold text-white">Team Message</p>
              </div>
              <p className="text-sm text-white leading-relaxed mb-2">{teamMsg.message}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs" style={{ color: "#555555" }}>{teamMsg.coach_name}</p>
                <span style={{ color: "#333333" }}>·</span>
                <p className="text-xs" style={{ color: "#444444" }}>{formatTime(teamMsg.created_at)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Daily Recommendation ─────────────────────────────────────────────── */}
        {recentLog && meta && readiness !== null && (
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#111111", border: "1px solid #222222", borderLeft: `3px solid ${meta.color}`, boxShadow: "0 0 24px rgba(59,130,246,0.07)" }}
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
        <motion.div data-tour="log" custom={5} variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {profile?.role === "coach" ? (
              <Link
                href="/coach/invite"
                className="rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 20px rgba(59,130,246,0.35)" }}
              >
                Invite Players
              </Link>
            ) : loggedToday ? (
              <button
                disabled
                className="rounded-2xl py-3.5 text-sm font-bold cursor-not-allowed"
                style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Check size={16} strokeWidth={2.5} /> Logged Today
                </span>
              </button>
            ) : (
              <Link
                href="/log"
                className="rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 20px rgba(59,130,246,0.35)" }}
              >
                Log Today
              </Link>
            )}
            <a
              href="#history"
              className="rounded-2xl py-3.5 text-sm font-bold text-center transition-all duration-150"
              style={{ backgroundColor: "#111111", border: "1px solid #222222", color: "#9ca3af" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              View History
            </a>
          </div>
        </motion.div>

        {/* ── Your Week ────────────────────────────────────────────────────────── */}
        {showRecap && (
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <Card>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-bold text-white">Your Week</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  vs previous 7 days
                </span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-gray-400">{recap.headline}</p>
              <div className="grid grid-cols-4 gap-2">
                <RecapStat label="Logs" value={`${recap.week.logsCount}/7`} delta={null} />
                <RecapStat
                  label="Throws"
                  value={String(recap.week.totalThrows)}
                  delta={recap.throwsDelta}
                />
                <RecapStat
                  label="Avg Pain"
                  value={recap.week.avgPain !== null ? String(recap.week.avgPain) : "—"}
                  delta={recap.painDelta}
                  deltaGoodWhenDown
                />
                <RecapStat
                  label="Avg Sore"
                  value={recap.week.avgSoreness !== null ? String(recap.week.avgSoreness) : "—"}
                  delta={recap.sorenessDelta}
                  deltaGoodWhenDown
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── 14-Day Trend Chart ───────────────────────────────────────────────── */}
        <motion.div data-tour="trend" custom={7} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
          <Card>
            <p className="text-sm font-bold text-white mb-4">14-Day Trend</p>
            {chartData.length >= 2 ? (
              <TrendChart data={chartData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                >
                  <TrendingUp size={26} strokeWidth={1.75} className="text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-white">Log more sessions to see your trends</p>
                <p className="text-xs text-gray-500">You need at least 2 logs to generate a chart.</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Recent Logs ──────────────────────────────────────────────────────── */}
        <motion.div
          id="history"
          custom={8}
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
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                >
                  <ClipboardList size={26} strokeWidth={1.75} className="text-blue-500" />
                </div>
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
