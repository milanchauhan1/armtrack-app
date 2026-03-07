"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Role = "player" | "coach";

interface FormData {
  role: Role | null;
  first_name: string;
  position: string;
  level: string;
  throws: string;
  sport: string;
  team_name: string;
}

const easing = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "65%" : "-65%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-65%" : "65%", opacity: 0 }),
};

// ── TapCard ───────────────────────────────────────────────────────────────────

interface TapCardProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  padY?: string;
}

function TapCard({ icon, label, subtitle, selected, onClick, padY = "py-7" }: TapCardProps) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ scale: selected ? 1.03 : 1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.13, ease: "easeOut" }}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl ${padY} px-4 cursor-pointer text-center outline-none w-full`}
      style={{
        backgroundColor: selected ? "rgba(59,130,246,0.10)" : "#111111",
        border: selected ? "2px solid #3B82F6" : "2px solid #1f1f1f",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
    >
      <span className="leading-none">{icon}</span>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {selected && (
        <div
          className="absolute top-2.5 right-2.5 rounded-full bg-blue-500 flex items-center justify-center"
          style={{ width: 18, height: 18 }}
        >
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3 5.5L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </motion.button>
  );
}

// ── BigInput ──────────────────────────────────────────────────────────────────

function BigInput({
  value,
  onChange,
  onEnter,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder: string;
}) {
  return (
    <input
      autoFocus
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim() && onEnter) onEnter();
      }}
      placeholder={placeholder}
      className="w-full rounded-xl px-5 py-4 text-center text-xl font-bold text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
      style={{ backgroundColor: "#141414", border: "2px solid #252525" }}
    />
  );
}

// ── ContinueButton ────────────────────────────────────────────────────────────

function ContinueButton({
  disabled,
  onClick,
  label = "Continue",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className="rounded-xl bg-blue-500 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-colors duration-150 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {label}
    </motion.button>
  );
}

// ── SummaryRow ────────────────────────────────────────────────────────────────

function SummaryRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={last ? {} : { borderBottom: "1px solid #1f1f1f" }}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    role: null,
    first_name: "",
    position: "",
    level: "",
    throws: "",
    sport: "",
    team_name: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();
      if (profile?.onboarding_complete) {
        router.replace("/dashboard");
        return;
      }
      setAuthChecking(false);
    });
  }, [router]);

  const totalSteps = formData.role === "coach" ? 5 : 6;

  function update(key: keyof FormData, value: string | null) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handleComplete() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const payload: Record<string, unknown> = {
      id: user.id,
      first_name: formData.first_name.trim(),
      role: formData.role,
      onboarding_complete: true,
    };

    if (formData.role === "player") {
      payload.position = formData.position;
      payload.level = formData.level;
      payload.throws = formData.throws;
    } else {
      payload.sport = formData.sport;
      payload.team_name = formData.team_name.trim();
    }

    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) {
      console.error("Failed to save profile:", error.message);
      setSaving(false);
      return;
    }

    router.replace(formData.role === "player" ? "/log" : "/dashboard");
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Step renderer ────────────────────────────────────────────────────────────

  function renderStepContent() {
    // ── Step 0: Role ─────────────────────────────────────────────────────────
    if (step === 0) {
      return (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
            I&apos;m a...
          </h1>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <TapCard
              icon={<span className="text-3xl">⚾</span>}
              label="Player"
              subtitle="Track my arm"
              selected={formData.role === "player"}
              onClick={() => update("role", "player")}
              padY="py-10"
            />
            <TapCard
              icon={<span className="text-3xl">📋</span>}
              label="Coach"
              subtitle="Manage my team"
              selected={formData.role === "coach"}
              onClick={() => update("role", "coach")}
              padY="py-10"
            />
          </div>
          <ContinueButton disabled={!formData.role} onClick={goNext} />
        </>
      );
    }

    // ── Step 1: First name (shared) ──────────────────────────────────────────
    if (step === 1) {
      return (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
            What&apos;s your first name?
          </h1>
          <div className="w-full max-w-xs">
            <BigInput
              value={formData.first_name}
              onChange={(v) => update("first_name", v)}
              onEnter={() => formData.first_name.trim() && goNext()}
              placeholder="Enter your name"
            />
          </div>
          <ContinueButton disabled={!formData.first_name.trim()} onClick={goNext} />
        </>
      );
    }

    // ── Player track ─────────────────────────────────────────────────────────
    if (formData.role === "player") {
      if (step === 2) {
        const positions = [
          { label: "Pitcher", icon: "🔥" },
          { label: "Catcher", icon: "🧤" },
          { label: "Infielder", icon: "🏃" },
          { label: "Outfielder", icon: "🌿" },
          { label: "Two-Way", icon: "⚡" },
          { label: "Other", icon: "🎯" },
        ];
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              What&apos;s your position?
            </h1>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {positions.map(({ label, icon }) => (
                <TapCard
                  key={label}
                  icon={<span className="text-2xl">{icon}</span>}
                  label={label}
                  selected={formData.position === label}
                  onClick={() => update("position", label)}
                  padY="py-5"
                />
              ))}
            </div>
            <ContinueButton disabled={!formData.position} onClick={goNext} />
          </>
        );
      }

      if (step === 3) {
        const levels = [
          { label: "Youth", icon: "🌱" },
          { label: "High School", icon: "🏫" },
          { label: "College", icon: "🎓" },
          { label: "Recreational", icon: "😄" },
        ];
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              What level do you play?
            </h1>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {levels.map(({ label, icon }) => (
                <TapCard
                  key={label}
                  icon={<span className="text-2xl">{icon}</span>}
                  label={label}
                  selected={formData.level === label}
                  onClick={() => update("level", label)}
                  padY="py-6"
                />
              ))}
            </div>
            <ContinueButton disabled={!formData.level} onClick={goNext} />
          </>
        );
      }

      if (step === 4) {
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              Which arm do you throw with?
            </h1>
            <div className="grid grid-cols-2 gap-5 w-full max-w-xs">
              <TapCard
                icon={
                  <span
                    className="font-black text-blue-400"
                    style={{ fontSize: 52, lineHeight: 1, fontFamily: "inherit" }}
                  >
                    L
                  </span>
                }
                label="Left"
                subtitle="Southpaw"
                selected={formData.throws === "Left"}
                onClick={() => update("throws", "Left")}
                padY="py-10"
              />
              <TapCard
                icon={
                  <span
                    className="font-black text-blue-400"
                    style={{ fontSize: 52, lineHeight: 1, fontFamily: "inherit" }}
                  >
                    R
                  </span>
                }
                label="Right"
                subtitle="Traditional"
                selected={formData.throws === "Right"}
                onClick={() => update("throws", "Right")}
                padY="py-10"
              />
            </div>
            <ContinueButton disabled={!formData.throws} onClick={goNext} />
          </>
        );
      }

      if (step === 5) {
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              You&apos;re all set,{" "}
              <span className="text-blue-400">{formData.first_name}</span>.
            </h1>
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ backgroundColor: "#0e0e0e", border: "1px solid #1f1f1f" }}
            >
              <SummaryRow label="Role" value="Player" />
              <SummaryRow label="Position" value={formData.position} />
              <SummaryRow label="Level" value={formData.level} />
              <SummaryRow label="Throws" value={`${formData.throws}-Handed`} last />
            </div>
            <ContinueButton
              disabled={saving}
              onClick={handleComplete}
              label={saving ? "Saving…" : "Log my first session →"}
            />
          </>
        );
      }
    }

    // ── Coach track ──────────────────────────────────────────────────────────
    if (formData.role === "coach") {
      if (step === 2) {
        const sports = [
          { label: "Baseball", icon: "⚾" },
          { label: "Softball", icon: "🥎" },
          { label: "Both", icon: "🏅" },
        ];
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              What sport do you coach?
            </h1>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {sports.map(({ label, icon }) => (
                <TapCard
                  key={label}
                  icon={<span className="text-2xl">{icon}</span>}
                  label={label}
                  selected={formData.sport === label}
                  onClick={() => update("sport", label)}
                  padY="py-5"
                />
              ))}
            </div>
            <ContinueButton disabled={!formData.sport} onClick={goNext} />
          </>
        );
      }

      if (step === 3) {
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              What&apos;s your team name?
            </h1>
            <div className="w-full max-w-xs">
              <BigInput
                value={formData.team_name}
                onChange={(v) => update("team_name", v)}
                onEnter={() => formData.team_name.trim() && goNext()}
                placeholder="Enter team name"
              />
            </div>
            <ContinueButton disabled={!formData.team_name.trim()} onClick={goNext} />
          </>
        );
      }

      if (step === 4) {
        return (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-center sm:text-4xl">
              Welcome, Coach{" "}
              <span className="text-blue-400">{formData.first_name}</span>.
            </h1>
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ backgroundColor: "#0e0e0e", border: "1px solid #1f1f1f" }}
            >
              <SummaryRow label="Role" value="Coach" />
              <SummaryRow label="Sport" value={formData.sport} />
              <SummaryRow label="Team" value={formData.team_name.trim()} last />
            </div>
            <ContinueButton
              disabled={saving}
              onClick={handleComplete}
              label={saving ? "Saving…" : "Go to my dashboard →"}
            />
          </>
        );
      }
    }

    return null;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: 2, backgroundColor: "#1a1a1a" }}
      >
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-4 sm:px-10">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <span className="text-sm font-medium text-gray-600 tabular-nums">
          {step + 1} / {totalSteps}
        </span>
      </header>

      {/* Back button row — reserves height to avoid layout shift */}
      <div className="px-6 sm:px-10" style={{ minHeight: 30 }}>
        <AnimatePresence>
          {step > 0 && (
            <motion.button
              key="back-btn"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
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
              Back
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main — animated step content */}
      <main className="flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: easing, duration: 0.3 }}
            className="w-full"
          >
            <div className="flex flex-col items-center gap-8 px-6 pb-16 w-full max-w-lg mx-auto">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
