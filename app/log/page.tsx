"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import LogCelebration from "@/components/LogCelebration";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  first_name: string;
  onboarding_complete: boolean;
}

interface LogForm {
  pain_level: number;
  soreness_level: number;
  stiffness_level: number;
  throws_count: number;
  activity_type: string[];
  recovery_done: string[];
  notes: string;
}

interface ArmLog extends LogForm {
  id: string;
  date: string;
  intensity: number;
}

interface PrevLog {
  date: string;
  pain_level: number;
  soreness_level: number;
  stiffness_level: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function sliderColor(v: number): string {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

function sliderLabel(v: number): string {
  if (v <= 2) return "Feeling great";
  if (v <= 4) return "Mild discomfort";
  if (v <= 6) return "Moderate soreness";
  if (v <= 8) return "Significant pain";
  return "Severe — consider rest";
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITIES = ["Bullpen", "Live BP", "Flat Ground", "Long Toss", "Game", "Catch", "Rest", "Other"];
const RECOVERIES = ["Ice", "Heat", "Band Work", "Stretching", "Massage", "Weighted Balls", "Nothing"];
const THROW_PRESETS = [0, 25, 50, 75, 100];

const DEFAULT_FORM: LogForm = {
  pain_level: 0,
  soreness_level: 0,
  stiffness_level: 0,
  throws_count: 0,
  activity_type: [],
  recovery_done: [],
  notes: "",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ArmSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const color = sliderColor(value);
  const pct = (value / 10) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">0 — Perfect</span>
        <span className="text-3xl font-black tabular-nums" style={{ color }}>
          {value}
          <span className="text-sm font-normal text-gray-600">/10</span>
        </span>
        <span className="text-xs text-gray-600">10 — Severe</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="arm-slider w-full"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, #252525 ${pct}%)`,
        }}
      />
      <motion.p
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="text-xs font-semibold"
        style={{ color }}
      >
        {sliderLabel(value)}
      </motion.p>
    </div>
  );
}

function MultiCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ scale: selected ? 1.04 : 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
      className="rounded-xl px-3 py-2.5 text-sm font-semibold cursor-pointer text-center outline-none"
      style={{
        backgroundColor: selected ? "rgba(59,130,246,0.12)" : "#111",
        border: selected ? "2px solid #3B82F6" : "2px solid #1e1e1e",
        color: selected ? "#93c5fd" : "#6b7280",
        boxShadow: selected ? "0 0 14px rgba(59,130,246,0.22)" : "none",
        transition: "background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      {label}
    </motion.button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a" }}
    >
      {children}
    </div>
  );
}

function QL({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#3B82F6" }}>{children}</p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayLog, setTodayLog] = useState<ArmLog | null>(null);
  const [prevLog, setPrevLog] = useState<PrevLog | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<LogForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const user = session.user;

      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, onboarding_complete")
        .eq("id", user.id)
        .single();

      if (!prof?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }

      setProfile(prof);
      setUserId(user.id);

      const today = getTodayString();

      const { data: existing } = await supabase
        .from("arm_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        setTodayLog(existing as ArmLog);
        setForm({
          pain_level: existing.pain_level,
          soreness_level: existing.soreness_level,
          stiffness_level: existing.stiffness_level,
          throws_count: existing.throws_count,
          activity_type: existing.activity_type ?? [],
          recovery_done: existing.recovery_done ?? [],
          notes: existing.notes ?? "",
        });
      }

      const { data: logs } = await supabase
        .from("arm_logs")
        .select("date")
        .eq("user_id", user.id);

      if (logs) setStreak(computeStreak(logs.map((l) => l.date)));

      const { data: prev } = await supabase
        .from("arm_logs")
        .select("date, pain_level, soreness_level, stiffness_level")
        .eq("user_id", user.id)
        .lt("date", today)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prev) setPrevLog(prev as PrevLog);

      setLoading(false);
    }
    loadData();
  }, [router]);

  function toggle(field: "activity_type" | "recovery_done", value: string) {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    const today = getTodayString();
    const intensity = Math.round(
      (form.pain_level + form.soreness_level + form.stiffness_level) / 3
    );

    const payload = {
      user_id: userId,
      date: today,
      pain_level: form.pain_level,
      soreness_level: form.soreness_level,
      stiffness_level: form.stiffness_level,
      throws_count: form.throws_count,
      intensity,
      activity_type: form.activity_type,
      recovery_done: form.recovery_done,
      notes: form.notes || null,
    };

    if (todayLog) {
      await supabase.from("arm_logs").update(payload).eq("id", todayLog.id);
      setSubmitting(false);
      router.replace("/dashboard");
    } else {
      await supabase.from("arm_logs").insert(payload);

      // Re-fetch logs after insert to get accurate post-insert streak
      const { data: freshLogs } = await supabase
        .from("arm_logs")
        .select("date")
        .eq("user_id", userId);
      const freshStreak = freshLogs
        ? computeStreak(freshLogs.map((l) => l.date))
        : streak;

      setSubmitting(false);
      setCelebrationStreak(freshStreak);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Celebration ────────────────────────────────────────────────────────────

  if (celebrationStreak !== null) {
    return (
      <LogCelebration
        streakCount={celebrationStreak}
        firstName={profile?.first_name ?? ""}
        onComplete={() => router.replace("/dashboard")}
      />
    );
  }

  const showReadOnly = todayLog && !editMode;
  const showForm = !todayLog || editMode;

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
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          Dashboard →
        </button>
      </nav>

      <div className="mx-auto max-w-lg px-5 pt-7">
        {/* ── Greeting ────────────────────────────────────────────────────── */}
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-0.5">
            {getGreeting()}, {profile?.first_name}
          </p>
          <p className="text-sm text-gray-500 mb-4">{formatDate(new Date())}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {streak > 0 && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: "rgba(249,115,22,0.10)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  color: "#fb923c",
                }}
              >
                🔥 {streak}-day streak
              </div>
            )}
            <p className="text-xs italic text-gray-600">Your arm health matters.</p>
          </div>
        </div>

        {/* ── Read-only view ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {showReadOnly && todayLog && (
            <motion.div
              key="readonly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold mb-2"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      color: "#4ade80",
                    }}
                  >
                    ✓ Logged today
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Today&apos;s Session</h2>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-1 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer"
                  style={{
                    backgroundColor: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    color: "#60a5fa",
                  }}
                >
                  Edit
                </button>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Pain", value: todayLog.pain_level },
                  { label: "Soreness", value: todayLog.soreness_level },
                  { label: "Stiffness", value: todayLog.stiffness_level },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-2xl py-5 gap-1"
                    style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a" }}
                  >
                    <span
                      className="text-4xl font-black tabular-nums"
                      style={{ color: sliderColor(value) }}
                    >
                      {value}
                    </span>
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* Detail rows */}
              <Card>
                <div className="flex flex-col divide-y" style={{ borderColor: "#161616" }}>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-400">Throws</span>
                    <span className="text-sm font-semibold text-white">{todayLog.throws_count}</span>
                  </div>
                  {(todayLog.activity_type ?? []).length > 0 && (
                    <div className="flex justify-between items-start gap-4 py-3">
                      <span className="text-sm text-gray-400 shrink-0">Activity</span>
                      <span className="text-sm font-semibold text-white text-right">
                        {todayLog.activity_type!.join(" · ")}
                      </span>
                    </div>
                  )}
                  {(todayLog.recovery_done ?? []).length > 0 && (
                    <div className="flex justify-between items-start gap-4 py-3">
                      <span className="text-sm text-gray-400 shrink-0">Recovery</span>
                      <span className="text-sm font-semibold text-white text-right">
                        {todayLog.recovery_done!.join(" · ")}
                      </span>
                    </div>
                  )}
                  {todayLog.notes ? (
                    <div className="flex flex-col gap-1.5 py-3">
                      <span className="text-sm text-gray-400">Notes</span>
                      <span className="text-sm text-gray-300 leading-relaxed">{todayLog.notes}</span>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Form ──────────────────────────────────────────────────────── */}
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Edit mode back button */}
              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors cursor-pointer self-start mb-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M9 11L5 7L9 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back to summary
                </button>
              )}

              {/* ── Previous session context bar ────────────────────────── */}
              {prevLog && (
                <div className="flex items-center gap-2 flex-wrap px-1 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a" }}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#444" }}>Last · {formatDateShort(prevLog.date)}:</span>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: `${sliderColor(prevLog.pain_level)}15`, color: sliderColor(prevLog.pain_level) }}
                  >
                    P{prevLog.pain_level}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: `${sliderColor(prevLog.soreness_level)}15`, color: sliderColor(prevLog.soreness_level) }}
                  >
                    S{prevLog.soreness_level}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: `${sliderColor(prevLog.stiffness_level)}15`, color: sliderColor(prevLog.stiffness_level) }}
                  >
                    St{prevLog.stiffness_level}
                  </span>
                </div>
              )}

              {/* ── Sliders ─────────────────────────────────────────────── */}
              <Card>
                <div className="flex flex-col gap-8">
                  <div>
                    <QL>How does your arm feel today?</QL>
                    <ArmSlider
                      value={form.pain_level}
                      onChange={(v) => setForm((p) => ({ ...p, pain_level: v }))}
                    />
                  </div>
                  <div
                    style={{ borderTop: "1px solid #181818", paddingTop: "1.75rem" }}
                  >
                    <QL>Soreness level</QL>
                    <ArmSlider
                      value={form.soreness_level}
                      onChange={(v) => setForm((p) => ({ ...p, soreness_level: v }))}
                    />
                  </div>
                  <div
                    style={{ borderTop: "1px solid #181818", paddingTop: "1.75rem" }}
                  >
                    <QL>Stiffness level</QL>
                    <ArmSlider
                      value={form.stiffness_level}
                      onChange={(v) => setForm((p) => ({ ...p, stiffness_level: v }))}
                    />
                  </div>
                </div>
              </Card>

              {/* ── Throws ──────────────────────────────────────────────── */}
              <Card>
                <QL>How many throws today?</QL>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {THROW_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setForm((prev) => ({ ...prev, throws_count: p }))}
                        className="rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-150"
                        style={{
                          backgroundColor: form.throws_count === p ? "#3B82F6" : "#181818",
                          border:
                            form.throws_count === p
                              ? "2px solid #3B82F6"
                              : "2px solid #252525",
                          color: form.throws_count === p ? "#fff" : "#6b7280",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setForm((prev) => ({ ...prev, throws_count: prev.throws_count < 135 ? 135 : prev.throws_count }))
                      }
                      className="rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-150"
                      style={{
                        backgroundColor: form.throws_count >= 135 ? "#3B82F6" : "#181818",
                        border:
                          form.throws_count >= 135
                            ? "2px solid #3B82F6"
                            : "2px solid #252525",
                        color: form.throws_count >= 135 ? "#fff" : "#6b7280",
                      }}
                    >
                      135+
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={form.throws_count}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        throws_count: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "#141414", border: "1px solid #252525" }}
                  />
                </div>
              </Card>

              {/* ── Activity type ────────────────────────────────────────── */}
              <Card>
                <QL>Activity type</QL>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {ACTIVITIES.map((a) => (
                    <MultiCard
                      key={a}
                      label={a}
                      selected={form.activity_type.includes(a)}
                      onClick={() => toggle("activity_type", a)}
                    />
                  ))}
                </div>
              </Card>

              {/* ── Recovery ─────────────────────────────────────────────── */}
              <Card>
                <QL>Recovery done today</QL>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {RECOVERIES.map((r) => (
                    <MultiCard
                      key={r}
                      label={r}
                      selected={form.recovery_done.includes(r)}
                      onClick={() => toggle("recovery_done", r)}
                    />
                  ))}
                </div>
              </Card>

              {/* ── Notes ────────────────────────────────────────────────── */}
              <Card>
                <QL>Notes</QL>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Anything else worth noting?"
                  rows={3}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: "#141414", border: "1px solid #252525" }}
                />
              </Card>

              {/* ── Submit ───────────────────────────────────────────────── */}
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileTap={submitting ? {} : { scale: 0.98 }}
                className="w-full rounded-2xl text-base font-bold text-white transition-colors duration-150 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: "#3B82F6", height: 56, boxShadow: "0 4px 28px rgba(59,130,246,0.4)" }}
              >
                {submitting
                  ? "Saving…"
                  : todayLog
                  ? "Update Today's Log"
                  : "Log Today's Session"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
