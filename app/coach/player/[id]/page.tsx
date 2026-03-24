"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArmLog,
  computeLogScore,
  getReadinessState,
  calculateEstimatedReadiness,
} from "@/lib/readiness";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowLeft, Shield, Send, MessageSquare } from "lucide-react";
import CoachBottomNav from "@/app/coach/components/CoachBottomNav";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlayerProfile {
  first_name: string;
  position: string | null;
  level: string | null;
  throws: string | null;
  injury_history: string | null;
  goal: string | null;
  throw_frequency: string | null;
  pain_zones: string[] | null;
}

interface CoachRec {
  id: string;
  recommendation: string;
  created_at: string;
}

interface CoachMsg {
  id: string;
  message: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function scoreColor(v: number): string {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

// ── Animation ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ── Sub-components ────────────────────────────────────────────────────────────

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
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function ReadOnlyLogRow({ log, index }: { log: ArmLog; index: number }) {
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
        <div className="px-4 py-4 flex items-start gap-3">
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
              <span className="text-xs" style={{ color: "#555555" }}>
                {log.activity_type!.join(" · ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-black tabular-nums"
              style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
            >
              {score.toFixed(1)}
            </span>
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.pain_level)}15`, color: scoreColor(log.pain_level) }}
            >
              P{log.pain_level}
            </span>
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.soreness_level)}15`, color: scoreColor(log.soreness_level) }}
            >
              S{log.soreness_level}
            </span>
            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums"
              style={{ backgroundColor: `${scoreColor(log.stiffness_level)}15`, color: scoreColor(log.stiffness_level) }}
            >
              St{log.stiffness_level}
            </span>
            {log.throws_count > 0 && (
              <span
                className="rounded-lg px-2 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: "#1a1a1a", color: "#666666" }}
              >
                {log.throws_count}
              </span>
            )}
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
                    <span className="text-xs shrink-0 mt-0.5" style={{ color: "#555555" }}>
                      Recovery:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.recovery_done!.map((r) => (
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
                )}
                {log.notes ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs" style={{ color: "#555555" }}>Notes</span>
                    <span className="text-xs leading-relaxed" style={{ color: "#aaaaaa" }}>
                      {log.notes}
                    </span>
                  </div>
                ) : (log.recovery_done?.length ?? 0) === 0 ? (
                  <p className="text-xs italic" style={{ color: "#444444" }}>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [logs, setLogs] = useState<ArmLog[]>([]);
  const [chartMounted, setChartMounted] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [activeRec, setActiveRec] = useState<CoachRec | null>(null);
  const [messages, setMessages] = useState<CoachMsg[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [recNote, setRecNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

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

      // Verify coach role
      const { data: coachProfile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete, team_id")
        .eq("id", user.id)
        .single();

      if (!coachProfile?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }
      if (coachProfile?.role !== "coach") {
        router.replace("/dashboard");
        return;
      }

      setCoachId(user.id);
      setTeamId((coachProfile as { team_id?: string } | null)?.team_id ?? null);

      // Fetch player profile
      const { data: playerProfile } = await supabase
        .from("profiles")
        .select("first_name, position, level, throws, injury_history, goal, throw_frequency, pain_zones")
        .eq("id", params.id)
        .single();

      // Fetch player logs (14 days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
      const cutoff = fourteenDaysAgo.toISOString().split("T")[0];

      const { data: logsData } = await supabase
        .from("arm_logs")
        .select(
          "id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes"
        )
        .eq("user_id", params.id)
        .gte("date", cutoff)
        .order("date", { ascending: false });

      // Fetch active coach recommendation for this player
      const nowIso = new Date().toISOString();
      const { data: recData } = await supabase
        .from("coach_recommendations")
        .select("id, recommendation, created_at")
        .eq("player_id", params.id)
        .or(`expires_at.gt.${nowIso},expires_at.is.null`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveRec((recData as CoachRec | null) ?? null);

      // Fetch last 3 messages sent to this player by this coach
      const { data: msgData } = await supabase
        .from("coach_messages")
        .select("id, message, created_at")
        .eq("coach_id", user.id)
        .eq("player_id", params.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setMessages((msgData ?? []) as CoachMsg[]);

      setProfile(playerProfile ?? null);
      setLogs((logsData ?? []) as ArmLog[]);
      setLoading(false);
    }
    load();
  }, [router, params.id]);

  async function handleSendRec() {
    if (!selectedOption || !coachId) return;
    setSending(true);
    const combined = recNote.trim()
      ? `${selectedOption} — ${recNote.trim()}`
      : selectedOption;
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (activeRec) {
      await supabase
        .from("coach_recommendations")
        .update({ recommendation: combined, expires_at: endOfDay.toISOString() })
        .eq("id", activeRec.id);
      setActiveRec({ ...activeRec, recommendation: combined });
    } else {
      const { data } = await supabase
        .from("coach_recommendations")
        .insert({
          coach_id: coachId,
          player_id: params.id,
          recommendation: combined,
          expires_at: endOfDay.toISOString(),
        })
        .select("id, recommendation, created_at")
        .single();
      if (data) setActiveRec(data as CoachRec);
    }

    setSending(false);
    setSendSuccess(true);
    setSelectedOption(null);
    setRecNote("");
    setTimeout(() => setSendSuccess(false), 2000);
  }

  async function handleSendMsg() {
    if (!msgText.trim() || !coachId || !teamId) return;
    setSendingMsg(true);
    const { data } = await supabase
      .from("coach_messages")
      .insert({
        coach_id: coachId,
        team_id: teamId,
        player_id: params.id,
        message: msgText.trim(),
      })
      .select("id, message, created_at")
      .single();
    if (data) {
      setMessages([data as CoachMsg, ...messages].slice(0, 3));
    }
    setMsgText("");
    setSendingMsg(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  const readiness = calculateEstimatedReadiness(logs.slice(0, 7));
  const readinessMeta = readiness !== null ? getReadinessState(readiness) : null;

  const logs14Asc = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = logs14Asc.map((l) => ({
    date: formatDateShort(l.date),
    Pain: l.pain_level,
    Soreness: l.soreness_level,
    Stiffness: l.stiffness_level,
  }));

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center gap-3 bg-black px-5 py-4"
        style={{ borderBottom: "1px solid #111111" }}
      >
        <button
          onClick={() => router.push("/coach/dashboard")}
          className="flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
          style={{ color: "#555555" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Roster
        </button>
        <span className="text-white/20">/</span>
        <span className="text-sm font-semibold text-white truncate">
          {profile?.first_name ?? "Player"}
        </span>
      </nav>

      <div className="mx-auto max-w-2xl px-5 pt-8">
        {/* ── Player header ────────────────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
            Player Detail
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3">
            {profile?.first_name ?? "Player"}
          </h1>

          <div className="flex flex-wrap gap-2">
            {profile?.position && (
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaaaaa" }}
              >
                {profile.position}
              </span>
            )}
            {profile?.level && (
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaaaaa" }}
              >
                {profile.level}
              </span>
            )}
            {profile?.throws && (
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaaaaa" }}
              >
                Throws {profile.throws}
              </span>
            )}
            {profile?.goal && (
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#60a5fa",
                }}
              >
                {profile.goal}
              </span>
            )}
            {profile?.injury_history && profile.injury_history !== "never" && (
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#F59E0B",
                }}
              >
                Injury history
              </span>
            )}
            {(profile?.pain_zones ?? []).map((zone) => (
              <span
                key={zone}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                }}
              >
                {zone}
              </span>
            ))}
          </div>

          {/* Current readiness */}
          {readiness !== null && readinessMeta && (
            <div className="mt-4 flex items-center gap-3">
              <span
                className="text-3xl font-black tabular-nums"
                style={{ color: readinessMeta.color }}
              >
                {readiness.toFixed(1)}
              </span>
              <div>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: readinessMeta.bg,
                    border: `1px solid ${readinessMeta.border}`,
                    color: readinessMeta.color,
                  }}
                >
                  {readinessMeta.label}
                </span>
                <p className="text-[10px] mt-0.5" style={{ color: "#555555" }}>
                  Estimated readiness based on recent logs
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── 14-Day Trend Chart ───────────────────────────────────────────── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="mb-4">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#111111", border: "1px solid #222222", boxShadow: "0 0 24px rgba(59,130,246,0.07)" }}
          >
            <p className="text-sm font-bold text-white mb-4">14-Day Trend</p>
            {chartMounted && chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={200}>
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
                  <Line
                    type="monotone"
                    dataKey="Pain"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ef4444" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Soreness"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#f59e0b" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Stiffness"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <p className="text-sm font-semibold text-white">Not enough data</p>
                <p className="text-xs" style={{ color: "#555555" }}>
                  Need at least 2 logs to show a trend.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Log History ──────────────────────────────────────────────────── */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
          <p className="text-sm font-bold text-white mb-3">Session History</p>

          {logs.length === 0 ? (
            <div
              className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
              style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
            >
              <p className="text-sm font-semibold text-white">No logs yet</p>
              <p className="text-xs" style={{ color: "#555555" }}>
                This player hasn&apos;t logged any sessions in the last 14 days.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log, i) => (
                <ReadOnlyLogRow key={log.id} log={log} index={i} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Recommendation Panel ─────────────────────────────────────── */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mt-6">
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: "#3B82F6" }} />
              <p className="text-sm font-bold text-white">Send Recommendation</p>
            </div>

            {/* Active rec display */}
            {activeRec && (
              <div
                className="rounded-xl px-4 py-3 flex flex-col gap-1"
                style={{ backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3B82F6" }}>
                  Active today
                </p>
                <p className="text-sm text-white leading-relaxed">{activeRec.recommendation}</p>
              </div>
            )}

            {/* Quick-select grid */}
            {(() => {
              const OPTIONS = [
                "Full session — arm looks ready",
                "Light throwing only today",
                "Flat ground or catch only",
                "Recovery day recommended",
                "Monitor closely — check in before practice",
                "Cleared to pitch",
              ];
              return (
                <div className="grid grid-cols-2 gap-2">
                  {OPTIONS.map((opt) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setSelectedOption(isSelected ? null : opt)}
                        className="rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? "rgba(59,130,246,0.15)" : "#0d0d0d",
                          border: isSelected ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1e1e1e",
                          color: isSelected ? "#60a5fa" : "#888888",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Note input */}
            <textarea
              value={recNote}
              onChange={(e) => setRecNote(e.target.value.slice(0, 200))}
              placeholder="Add a note (optional)"
              rows={2}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150"
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid #1e1e1e",
                color: "#ffffff",
                caretColor: "#3B82F6",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
            />
            <p className="text-[10px] -mt-2" style={{ color: "#444444" }}>
              {recNote.length}/200
            </p>

            {/* Send button */}
            <button
              onClick={handleSendRec}
              disabled={!selectedOption || sending}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: sendSuccess ? "rgba(34,197,94,0.15)" : "#3B82F6",
                border: sendSuccess ? "1px solid rgba(34,197,94,0.3)" : "none",
                color: sendSuccess ? "#22C55E" : "#ffffff",
                boxShadow: sendSuccess ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
              }}
            >
              {sendSuccess ? (
                "Recommendation sent"
              ) : (
                <>
                  <Send size={14} />
                  {activeRec ? "Update Recommendation" : "Send to Player"}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Message Panel ────────────────────────────────────────────── */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mt-4 mb-4">
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} style={{ color: "#555555" }} />
              <p className="text-sm font-bold text-white">Send Message</p>
            </div>

            {/* Input + Send */}
            <div className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value.slice(0, 300))}
                placeholder={`Message to ${profile?.first_name ?? "player"}...`}
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150"
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #1e1e1e",
                  color: "#ffffff",
                  caretColor: "#3B82F6",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMsg()}
              />
              <button
                onClick={handleSendMsg}
                disabled={!msgText.trim() || sendingMsg}
                className="rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>

            {/* Recent messages */}
            {messages.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#444444" }}>
                  Recent messages
                </p>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl px-4 py-3 flex flex-col gap-1"
                    style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}
                  >
                    <p className="text-xs text-white leading-relaxed">{msg.message}</p>
                    <p className="text-[10px]" style={{ color: "#444444" }}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <CoachBottomNav />
    </div>
  );
}
