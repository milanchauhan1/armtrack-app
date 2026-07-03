"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import LogCelebration from "@/components/LogCelebration";
import { tapLight, tapMedium, notifySuccess, notifyError } from "@/lib/haptics";
import { playBlip } from "@/lib/sounds";
import { LogSkeleton } from "@/components/Skeleton";
import { computeStreak } from "@/lib/readiness";
import { todayString as getTodayString } from "@/lib/dates";
import { maybeRequestReview } from "@/lib/review";
import { Flame, Check, WifiOff } from "lucide-react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const color = sliderColor(value);
  const pct = (value / 10) * 100;

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const v = Math.round(ratio * 10);
    if (v !== value) {
      tapLight();
      onChange(v);
    }
  };

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
      {/* Custom pointer-driven slider: the native range input in the iOS webview
          only drags when the touch starts exactly on the thumb. Pointer capture
          lets the athlete press anywhere on the track and drag freely. */}
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        tabIndex={0}
        className="relative w-full cursor-pointer py-2.5 -my-2.5 outline-none"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          dragging.current = true;
          // Capture keeps move events flowing even when the finger wanders off
          // the track mid-drag. Not all engines grant it, so don't rely on it.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* non-fatal */
          }
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(10, value + 1));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0, value - 1));
          }
        }}
      >
        <div
          className="h-6 rounded-full"
          style={{ background: `linear-gradient(to right, ${color} ${pct}%, #252525 ${pct}%)` }}
        />
        <div
          className="pointer-events-none absolute top-1/2"
          style={{
            left: `${pct}%`,
            transform: `translate(-${pct}%, -50%)`,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#ffffff",
            border: "3px solid #000000",
            boxShadow: "0 1px 8px rgba(0, 0, 0, 0.6)",
          }}
        />
      </div>
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
      onClick={() => {
        tapLight();
        onClick();
      }}
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
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

      // These three reads are independent — fetch them in parallel.
      const [existingRes, logsRes, prevRes] = await Promise.all([
        supabase
          .from("arm_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle(),
        supabase.from("arm_logs").select("date").eq("user_id", user.id),
        supabase
          .from("arm_logs")
          .select("date, pain_level, soreness_level, stiffness_level")
          .eq("user_id", user.id)
          .lt("date", today)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const existing = existingRes.data;
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

      if (logsRes.data) setStreak(computeStreak(logsRes.data.map((l) => l.date)));

      if (prevRes.data) setPrevLog(prevRes.data as PrevLog);

      setLoading(false);
      } catch {
        setLoadError(true);
        setLoading(false);
      }
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
    tapMedium();
    setSaveError(null);
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
      const { error } = await supabase
        .from("arm_logs")
        .update(payload)
        .eq("id", todayLog.id);
      if (error) {
        notifyError();
        setSaveError("Couldn't save your log. Check your connection and try again.");
        setSubmitting(false);
        return;
      }
      notifySuccess();
      playBlip();
      setSubmitting(false);
      router.replace("/dashboard");
    } else {
      const { error } = await supabase.from("arm_logs").insert(payload);
      if (error) {
        notifyError();
        setSaveError("Couldn't save your log. Check your connection and try again.");
        setSubmitting(false);
        return;
      }

      // Re-fetch logs after insert to get accurate post-insert streak
      const { data: freshLogs } = await supabase
        .from("arm_logs")
        .select("date")
        .eq("user_id", userId);
      const freshStreak = freshLogs
        ? computeStreak(freshLogs.map((l) => l.date))
        : streak;

      notifySuccess();
      setSubmitting(false);
      setCelebrationStreak(freshStreak);

      // After a few logged sessions, ask for an App Store review (once, native).
      maybeRequestReview(freshLogs?.length ?? 0);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

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
          <p className="text-base font-bold text-white">Couldn&apos;t load the log screen</p>
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
    return <LogSkeleton />;
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
                <Flame size={13} strokeWidth={2.4} fill="currentColor" /> {streak}-day streak
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
                    <Check size={13} strokeWidth={2.5} /> Logged today
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
                        onClick={() => {
                          tapLight();
                          setForm((prev) => ({ ...prev, throws_count: p }));
                        }}
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
              {saveError && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium text-center"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#EF4444",
                  }}
                >
                  {saveError}
                </p>
              )}
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
