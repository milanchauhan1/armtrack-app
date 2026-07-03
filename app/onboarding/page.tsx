"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { scheduleArmLogReminder } from "@/lib/notifications";
import { tapLight, tapMedium } from "@/lib/haptics";
import {
  User,
  Users,
  Target,
  Shield,
  Move,
  Maximize,
  Zap,
  MoreHorizontal,
  RefreshCw,
  BarChart2,
  Calendar,
  CalendarX,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Star,
  BookOpen,
  Award,
  Heart,
  ArrowLeft,
  ArrowRight,
  Activity,
  Disc,
  Layers,
  HeartPulse,
  MapPin,
  Trophy,
  Hand,
  type LucideIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnboardingData {
  role: "player" | "coach" | null;
  name: string;
  position: string;
  goal: string;
  throwFrequency: string;
  injuryHistory: string;
  painZones: string[];
  level: string;
  throws: string;
  teamName: string;
  sport: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Constants ────────────────────────────────────────────────────────────────

const easing = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

// ── Step icons ──────────────────────────────────────────────────────────────
// A distinct icon per step gives each screen its own identity.

const STEP_ICONS: Record<number, LucideIcon> = {
  0: Users,
  1: User,
  2: Activity,
  3: Target,
  4: Calendar,
  5: HeartPulse,
  6: MapPin,
  7: Trophy,
  8: Hand,
  9: CheckCircle,
  10: Disc,
  11: Users,
  12: CheckCircle,
  13: Users,
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -36 : 36, opacity: 0 }),
};

// Arm zones for pain diagram (front-facing right arm, shoulder → wrist)
const ARM_ZONES = [
  {
    id: "Shoulder",
    path: "M 42,75 C 40,48 55,14 90,10 C 125,14 140,48 138,75 Z",
    labelX: 90,
    labelY: 46,
  },
  {
    id: "Upper Arm",
    path: "M 42,75 L 44,175 L 136,175 L 138,75 Z",
    labelX: 90,
    labelY: 125,
  },
  {
    id: "Elbow Inner",
    path: "M 44,175 C 30,192 28,218 40,235 L 90,235 L 90,175 Z",
    labelX: 62,
    labelY: 206,
  },
  {
    id: "Elbow Outer",
    path: "M 90,175 L 90,235 L 140,235 C 152,218 150,192 136,175 Z",
    labelX: 118,
    labelY: 206,
  },
  {
    id: "Forearm",
    path: "M 40,235 L 44,325 L 136,325 L 140,235 Z",
    labelX: 90,
    labelY: 278,
  },
  {
    id: "Wrist",
    path: "M 44,325 C 43,345 46,365 52,374 L 128,374 C 134,365 137,345 136,325 Z",
    labelX: 90,
    labelY: 348,
  },
];

// ── TapCard ───────────────────────────────────────────────────────────────────

interface TapCardProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  padY?: string;
}

function TapCard({
  icon,
  label,
  subtitle,
  selected,
  onClick,
}: TapCardProps) {
  return (
    <motion.button
      onClick={() => {
        tapLight();
        onClick();
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.13, ease: "easeOut" }}
      className="relative flex items-center gap-3.5 cursor-pointer outline-none w-full text-left"
      style={{
        minHeight: 76,
        paddingLeft: 16,
        paddingRight: selected ? 44 : 16,
        paddingTop: 14,
        paddingBottom: 14,
        borderRadius: 18,
        backgroundImage: selected
          ? "linear-gradient(180deg, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.04) 100%)"
          : "linear-gradient(180deg, #181a20 0%, #101216 100%)",
        border: selected ? "1.5px solid rgba(59,130,246,0.65)" : "1px solid #262932",
        boxShadow: selected
          ? "0 0 30px rgba(59,130,246,0.22), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 2px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        transition: "all 0.18s ease",
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundImage:
            "linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 100%)",
          border: "1px solid rgba(59,130,246,0.28)",
          color: selected ? "#93c5fd" : "#60a5fa",
        }}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-white">{label}</p>
        {subtitle && (
          <p className="text-xs leading-snug" style={{ color: "#9aa0aa" }}>
            {subtitle}
          </p>
        )}
      </div>
      {selected && (
        <div
          className="absolute right-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
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
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <input
      ref={ref}
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
      onClick={() => {
        tapMedium();
        onClick();
      }}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className="w-full rounded-2xl text-base font-bold text-white transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
      style={{
        maxWidth: 360,
        height: 56,
        backgroundImage: "linear-gradient(180deg, #5398ff 0%, #3b82f6 100%)",
        boxShadow: "0 8px 38px rgba(59,130,246,0.6), 0 0 22px rgba(59,130,246,0.4)",
      }}
    >
      {label}
    </motion.button>
  );
}

// ── Animated checkmark ────────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <motion.svg
      viewBox="0 0 52 52"
      width={72}
      height={72}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M 14 27 L 22 35 L 38 17"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
      />
    </motion.svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [authChecking, setAuthChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [startingAnon, setStartingAnon] = useState(false);
  const [anonError, setAnonError] = useState(false);
  const [pendingTeamCode, setPendingTeamCode] = useState("");
  const [data, setData] = useState<OnboardingData>({
    role: null,
    name: "",
    position: "",
    goal: "",
    throwFrequency: "",
    injuryHistory: "",
    painZones: [],
    level: "",
    throws: "",
    teamName: "",
    sport: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      // No session yet → show the welcome screen. We create an anonymous account
      // only when they tap "Get started", so there's no login wall.
      if (!user) {
        setStep(-1);
        setAuthChecking(false);
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

  // Welcome → create an anonymous session, then drop into step 0. Their data
  // persists immediately and can be claimed later by adding email/Apple.
  async function startAnonymously() {
    setStartingAnon(true);
    setAnonError(false);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setAnonError(true);
      setStartingAnon(false);
      return;
    }
    setDirection(1);
    setStep(0);
    setStartingAnon(false);
  }

  function set<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Pre-fill team code from localStorage when reaching step 13.
  // Accept either key: the manual /join page uses "pending_team_code" while
  // the invite-link flow (JoinClient) stores "armtrack-pending-invite".
  useEffect(() => {
    if (step === 13) {
      const saved =
        localStorage.getItem("pending_team_code") ||
        localStorage.getItem("armtrack-pending-invite");
      if (saved) setPendingTeamCode(saved.toUpperCase());
    }
  }, [step]);

  // Player flow is intentionally short: role → name → position → goal →
  // injury history → level → confirmation. We skip throw-frequency (4),
  // pain-zones (6), throws (8), and the team-join step (13).
  function goNext() {
    setDirection(1);
    setStep((s) => {
      if (data.role === "coach" && s === 1) return 10;
      if (data.role === "player") {
        if (s === 3) return 5; // skip throw frequency
        if (s === 5) return 7; // skip pain zones
        if (s === 7) return 9; // skip throws
      }
      return s + 1;
    });
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => {
      if (data.role === "coach" && s === 10) return 1;
      if (data.role === "player") {
        if (s === 9) return 7;
        if (s === 7) return 5;
        if (s === 5) return 3;
      }
      return s - 1;
    });
  }

  // Player onboarding finishes at the confirmation screen — save the profile and
  // go straight to the first log (no team-join step).
  async function handlePlayerFinish() {
    setSaving(true);
    setSaveError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: data.name,
        role: data.role,
        position: data.position,
        goal: data.goal,
        injury_history: data.injuryHistory,
        level: data.level,
        onboarding_complete: true,
      });
      if (error) throw error;
      try { await scheduleArmLogReminder(); } catch { /* non-fatal */ }
      router.push("/log");
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  }

  // ── Auth loading ──────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
      </div>
    );
  }

  // ── Welcome (first open — no account yet) ─────────────────────────────────
  if (step === -1) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center overflow-hidden bg-black px-7"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 56px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)",
        }}
      >
        {/* Ambient glow — centered behind the tagline so the logo sits on pure
            black and blends (no visible square edge). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 620,
              height: 620,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 64%)",
              filter: "blur(30px)",
            }}
          />
        </div>

        {/* Logo — top, the real brand mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/logo.png"
          alt="ArmTrack"
          width={156}
          height={156}
          className="relative z-10"
        />

        {/* Tagline — centered in the middle of the screen */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <h1 className="text-center text-[34px] font-extrabold leading-[1.12] tracking-tight text-white">
            Protect the arm.
            <br />
            Extend the career.
          </h1>
        </div>

        {/* CTA — bottom */}
        <div className="relative z-10 flex w-full flex-col items-center text-center" style={{ maxWidth: 380 }}>
          {anonError && (
            <p className="mb-4 text-sm text-red-400">
              Couldn&apos;t start. Check your connection and try again.
            </p>
          )}

          <motion.button
            onClick={() => {
              tapMedium();
              startAnonymously();
            }}
            disabled={startingAnon}
            whileTap={startingAnon ? {} : { scale: 0.97 }}
            className="w-full rounded-2xl text-base font-bold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer"
            style={{
              height: 56,
              backgroundImage: "linear-gradient(180deg, #5398ff 0%, #3b82f6 100%)",
              boxShadow: "0 8px 38px rgba(59,130,246,0.55), 0 0 22px rgba(59,130,246,0.4)",
            }}
          >
            {startingAnon ? "Starting…" : "Get started"}
          </motion.button>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-sm cursor-pointer"
            style={{ color: "#7a818c" }}
          >
            I already have an account
          </button>
        </div>
      </div>
    );
  }

  // ── Progress bar calculation ──────────────────────────────────────────────

  function getProgressPct(): number {
    if (data.role === "coach") {
      // Coach has 5 effective steps: 0, 1, 10, 11, 12
      const coachOrder = [0, 1, 10, 11, 12];
      const idx = coachOrder.indexOf(step);
      const displayIdx = idx >= 0 ? idx : 2;
      return ((displayIdx + 1) / 5) * 100;
    }
    // Player has 11 effective steps: 0–9 + 13
    const playerOrder = [0, 1, 2, 3, 5, 7, 9];
    const idx = playerOrder.indexOf(step);
    return ((idx >= 0 ? idx + 1 : step + 1) / playerOrder.length) * 100;
  }

  const progressPct = getProgressPct();

  // ── Step content ──────────────────────────────────────────────────────────

  function renderStep(): {
    question: string;
    content: React.ReactNode;
    canContinue: boolean;
    subText?: string;
    hideContinue?: boolean;
  } {
    // Step 0 — Role
    if (step === 0) {
      return {
        question: "I am a...",
        content: (
          <div className="grid grid-cols-2 gap-4 w-full">
            <TapCard
              icon={<User size={28} strokeWidth={1.5} />}
              label="Player"
              subtitle="Track my own arm health"
              selected={data.role === "player"}
              onClick={() => set("role", "player")}
              padY="py-9"
            />
            <TapCard
              icon={<Users size={28} strokeWidth={1.5} />}
              label="Coach"
              subtitle="Manage my team's arm health"
              selected={data.role === "coach"}
              onClick={() => set("role", "coach")}
              padY="py-9"
            />
          </div>
        ),
        canContinue: !!data.role,
      };
    }

    // Step 1 — Name
    if (step === 1) {
      return {
        question: "What do we call you?",
        content: (
          <div className="w-full">
            <BigInput
              value={data.name}
              onChange={(v) => set("name", v)}
              onEnter={() => data.name.trim() && goNext()}
              placeholder="First name"
            />
          </div>
        ),
        canContinue: !!data.name.trim(),
      };
    }

    // Step 2 — Position
    if (step === 2) {
      const positions = [
        { label: "Pitcher", icon: <Target size={22} strokeWidth={1.5} /> },
        { label: "Catcher", icon: <Shield size={22} strokeWidth={1.5} /> },
        { label: "Infielder", icon: <Move size={22} strokeWidth={1.5} /> },
        { label: "Outfielder", icon: <Maximize size={22} strokeWidth={1.5} /> },
        { label: "Two-Way", icon: <Zap size={22} strokeWidth={1.5} /> },
        { label: "Other", icon: <MoreHorizontal size={22} strokeWidth={1.5} /> },
      ];
      return {
        question: "What's your position?",
        content: (
          <div className="grid grid-cols-2 gap-3 w-full">
            {positions.map(({ label, icon }) => (
              <TapCard
                key={label}
                icon={icon}
                label={label}
                selected={data.position === label}
                onClick={() => set("position", label)}
                padY="py-5"
              />
            ))}
          </div>
        ),
        canContinue: !!data.position,
      };
    }

    // Step 3 — Goal
    if (step === 3) {
      const goals = [
        {
          label: "Stay healthy and protect my arm",
          icon: <Shield size={22} strokeWidth={1.5} />,
          key: "stay-healthy",
        },
        {
          label: "Recover and get back to throwing",
          icon: <RefreshCw size={22} strokeWidth={1.5} />,
          key: "recover",
        },
        {
          label: "Build arm strength and gain velocity",
          icon: <Zap size={22} strokeWidth={1.5} />,
          key: "build-strength",
        },
        {
          label: "Track my workload for my coach or program",
          icon: <BarChart2 size={22} strokeWidth={1.5} />,
          key: "track-workload",
        },
      ];
      return {
        question: "What's your main goal with ArmTrack?",
        content: (
          <div className="flex flex-col gap-3 w-full">
            {goals.map(({ label, icon, key }) => (
              <TapCard
                key={key}
                icon={icon}
                label={label}
                selected={data.goal === key}
                onClick={() => set("goal", key)}
                padY="py-4"
              />
            ))}
          </div>
        ),
        canContinue: !!data.goal,
      };
    }

    // Step 4 — Throw frequency
    if (step === 4) {
      const freqs = [
        { label: "Every day", icon: <Calendar size={22} strokeWidth={1.5} />, key: "every-day" },
        { label: "4–5 times a week", icon: <Calendar size={22} strokeWidth={1.5} />, key: "4-5x-week" },
        { label: "2–3 times a week", icon: <Calendar size={22} strokeWidth={1.5} />, key: "2-3x-week" },
        { label: "Seasonally", icon: <CalendarX size={22} strokeWidth={1.5} />, key: "seasonally" },
      ];
      return {
        question: "How often do you throw?",
        content: (
          <div className="flex flex-col gap-3 w-full">
            {freqs.map(({ label, icon, key }) => (
              <TapCard
                key={key}
                icon={icon}
                label={label}
                selected={data.throwFrequency === key}
                onClick={() => set("throwFrequency", key)}
                padY="py-4"
              />
            ))}
          </div>
        ),
        canContinue: !!data.throwFrequency,
      };
    }

    // Step 5 — Injury history
    if (step === 5) {
      const injuries = [
        { label: "Never", icon: <CheckCircle size={22} strokeWidth={1.5} />, key: "never" },
        { label: "Minor soreness or strain", icon: <AlertCircle size={22} strokeWidth={1.5} />, key: "minor" },
        {
          label: "Yes — I've had a significant injury",
          icon: <AlertTriangle size={22} strokeWidth={1.5} />,
          key: "significant",
        },
        { label: "Currently recovering from one", icon: <RefreshCw size={22} strokeWidth={1.5} />, key: "recovering" },
      ];
      return {
        question: "Have you dealt with an arm injury before?",
        content: (
          <div className="flex flex-col gap-3 w-full">
            {injuries.map(({ label, icon, key }) => (
              <TapCard
                key={key}
                icon={icon}
                label={label}
                selected={data.injuryHistory === key}
                onClick={() => set("injuryHistory", key)}
                padY="py-4"
              />
            ))}
          </div>
        ),
        canContinue: !!data.injuryHistory,
      };
    }

    // Step 6 — Pain zones
    if (step === 6) {
      const toggleZone = (zone: string) => {
        set(
          "painZones",
          data.painZones.includes(zone)
            ? data.painZones.filter((z) => z !== zone)
            : [...data.painZones, zone]
        );
      };

      return {
        question: "Where do you typically feel discomfort?",
        subText: "Tap to select. You can choose multiple.",
        content: (
          <div className="flex flex-col items-center gap-4 w-full">
            <svg
              viewBox="0 0 180 390"
              width={180}
              height={390}
              style={{ overflow: "visible" }}
            >
              {/* Full arm outline for context */}
              <path
                d="M 42,75 C 40,48 55,14 90,10 C 125,14 140,48 138,75 L 136,175 C 150,192 152,218 140,235 L 136,325 C 135,345 132,362 128,374 L 52,374 C 48,362 45,345 44,325 L 40,235 C 28,218 30,192 44,175 Z"
                fill="none"
                stroke="#1e1e1e"
                strokeWidth={1.5}
              />
              {ARM_ZONES.map((zone) => {
                const sel = data.painZones.includes(zone.id);
                return (
                  <g key={zone.id} onClick={() => toggleZone(zone.id)} style={{ cursor: "pointer" }}>
                    <path
                      d={zone.path}
                      fill={sel ? "rgba(59,130,246,0.28)" : "#141414"}
                      stroke={sel ? "#3B82F6" : "#2a2a2a"}
                      strokeWidth={sel ? 1.5 : 1}
                      style={{
                        transition: "fill 0.2s ease, stroke 0.2s ease",
                        filter: sel ? "drop-shadow(0 0 8px rgba(59,130,246,0.6))" : "none",
                      }}
                    />
                    <text
                      x={zone.labelX}
                      y={zone.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontFamily="Inter, sans-serif"
                      fontWeight={600}
                      fill={sel ? "#ffffff" : "#4a4a4a"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {zone.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected zone badges */}
            {data.painZones.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {data.painZones.map((z) => (
                  <span
                    key={z}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(59,130,246,0.12)",
                      color: "#3B82F6",
                      border: "1px solid rgba(59,130,246,0.3)",
                    }}
                  >
                    {z}
                  </span>
                ))}
              </div>
            )}

            {/* None link */}
            <button
              onClick={() => {
                set("painZones", []);
                goNext();
              }}
              className="text-sm transition-colors cursor-pointer"
              style={{ color: "#555555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#aaaaaa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
            >
              None — I feel great
            </button>
          </div>
        ),
        canContinue: true,
      };
    }

    // Step 7 — Level
    if (step === 7) {
      const levels = [
        { label: "Youth", icon: <Star size={22} strokeWidth={1.5} />, key: "youth" },
        { label: "High School", icon: <BookOpen size={22} strokeWidth={1.5} />, key: "high-school" },
        { label: "College", icon: <Award size={22} strokeWidth={1.5} />, key: "college" },
        { label: "Recreational", icon: <Heart size={22} strokeWidth={1.5} />, key: "recreational" },
      ];
      return {
        question: "What level do you play?",
        content: (
          <div className="grid grid-cols-2 gap-3 w-full">
            {levels.map(({ label, icon, key }) => (
              <TapCard
                key={key}
                icon={icon}
                label={label}
                selected={data.level === key}
                onClick={() => set("level", key)}
                padY="py-6"
              />
            ))}
          </div>
        ),
        canContinue: !!data.level,
      };
    }

    // Step 8 — Throws arm
    if (step === 8) {
      return {
        question: "Which arm do you throw with?",
        content: (
          <div className="grid grid-cols-2 gap-4 w-full">
            <TapCard
              icon={<ArrowLeft size={40} strokeWidth={1.5} />}
              label="Left"
              selected={data.throws === "left"}
              onClick={() => set("throws", "left")}
              padY="py-10"
            />
            <TapCard
              icon={<ArrowRight size={40} strokeWidth={1.5} />}
              label="Right"
              selected={data.throws === "right"}
              onClick={() => set("throws", "right")}
              padY="py-10"
            />
          </div>
        ),
        canContinue: !!data.throws,
      };
    }

    // Step 9 — Player confirmation
    if (step === 9) {
      const goalMap: Record<string, string> = {
        "stay-healthy": "staying healthy",
        recover: "getting back to full strength",
        "build-strength": "building arm strength and gaining velocity",
        "track-workload": "tracking your workload",
      };
      const levelLabel: Record<string, string> = {
        youth: "Youth",
        "high-school": "High School",
        college: "College",
        recreational: "Recreational",
      };

      return {
        question: "",
        hideContinue: true,
        content: (
          <div className="flex flex-col items-center gap-6 w-full text-center">
            <AnimatedCheckmark />

            <div className="space-y-2">
              <p className="text-white font-bold text-xl leading-snug">
                You&apos;re a{" "}
                <span style={{ color: "#3B82F6" }}>{levelLabel[data.level] || data.level}</span>{" "}
                <span style={{ color: "#3B82F6" }}>{data.position}</span> focused on{" "}
                <span style={{ color: "#3B82F6" }}>{goalMap[data.goal] || data.goal}</span>.
              </p>
              <p className="text-sm" style={{ color: "#888888" }}>
                ArmTrack will track your arm every day and tell you exactly when to push and when to back off.
              </p>
            </div>

            {data.painZones.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555555" }}>
                  Zones to watch:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {data.painZones.map((z) => (
                    <span
                      key={z}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(59,130,246,0.12)",
                        color: "#3B82F6",
                        border: "1px solid rgba(59,130,246,0.3)",
                      }}
                    >
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.injuryHistory !== "never" && data.injuryHistory && (
              <p className="text-sm" style={{ color: "#F59E0B" }}>
                We&apos;ll keep a closer eye on your arm given your injury history.
              </p>
            )}

            {saveError && (
              <p className="text-sm text-red-400">
                Something went wrong.{" "}
                <button onClick={handlePlayerFinish} className="underline cursor-pointer">
                  Try again
                </button>
              </p>
            )}

            <ContinueButton
              disabled={saving}
              onClick={handlePlayerFinish}
              label={saving ? "Saving…" : "Start tracking →"}
            />

            <p className="text-xs" style={{ color: "#444444" }}>
              Your personalized recommendations start after your first log.
            </p>
          </div>
        ),
        canContinue: false,
      };
    }

    // Step 13 — Player: Join team (optional)
    if (step === 13) {
      const handleFinish = async (teamCode?: string) => {
        setSaving(true);
        setSaveError(false);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user");
          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            first_name: data.name,
            role: data.role,
            position: data.position,
            goal: data.goal,
            throw_frequency: data.throwFrequency,
            injury_history: data.injuryHistory,
            pain_zones: data.painZones,
            level: data.level,
            throws: data.throws,
            onboarding_complete: true,
          });
          if (error) throw error;

          // Join team if code provided
          if (teamCode?.trim()) {
            const { data: teamData } = await supabase
              .from("teams")
              .select("id")
              .eq("code", teamCode.trim().toUpperCase())
              .single();
            if (teamData) {
              await supabase
                .from("team_members")
                .upsert(
                  { team_id: teamData.id, player_id: user.id },
                  { onConflict: "team_id,player_id" }
                );
              // Keep profile.team_id in sync so coach/team messages reach this player.
              await supabase
                .from("profiles")
                .update({ team_id: teamData.id })
                .eq("id", user.id);
            }
            localStorage.removeItem("pending_team_code");
            localStorage.removeItem("armtrack-pending-invite");
          }

          try { await scheduleArmLogReminder(); } catch { /* non-fatal */ }
          router.push("/log");
        } catch {
          setSaveError(true);
          setSaving(false);
        }
      };

      return {
        question: "Join your team",
        subText: "Enter the code your coach gave you, or skip to continue.",
        hideContinue: true,
        content: (
          <div className="flex flex-col items-center gap-5 w-full">
            <input
              type="text"
              value={pendingTeamCode}
              onChange={(e) =>
                setPendingTeamCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && pendingTeamCode.trim().length === 6)
                  handleFinish(pendingTeamCode);
              }}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full rounded-xl px-5 py-4 text-center text-2xl font-black tracking-[0.3em] text-white placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "#141414", border: "2px solid #252525" }}
            />

            {saveError && (
              <p className="text-sm text-red-400">
                Something went wrong.{" "}
                <button onClick={() => handleFinish(pendingTeamCode)} className="underline cursor-pointer">
                  Try again
                </button>
              </p>
            )}

            <ContinueButton
              disabled={saving || pendingTeamCode.trim().length !== 6}
              onClick={() => handleFinish(pendingTeamCode)}
              label={saving ? "Saving..." : "Join Team and Start →"}
            />

            <button
              onClick={() => handleFinish("")}
              disabled={saving}
              className="text-sm transition-colors cursor-pointer disabled:opacity-40"
              style={{ color: "#555555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#aaaaaa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
            >
              Skip — I don&apos;t have a code
            </button>
          </div>
        ),
        canContinue: false,
      };
    }

    // ── Coach track ────────────────────────────────────────────────────────────

    // Step 10 — Coach: Sport
    if (step === 10) {
      const sports = [
        { label: "Baseball", icon: <Activity size={22} strokeWidth={1.5} />, key: "baseball" },
        { label: "Softball", icon: <Disc size={22} strokeWidth={1.5} />, key: "softball" },
        { label: "Both", icon: <Layers size={22} strokeWidth={1.5} />, key: "both" },
      ];
      return {
        question: "What sport do you coach?",
        content: (
          <div className="flex flex-col gap-3 w-full">
            {sports.map(({ label, icon, key }) => (
              <TapCard
                key={key}
                icon={icon}
                label={label}
                selected={data.sport === key}
                onClick={() => set("sport", key)}
                padY="py-5"
              />
            ))}
          </div>
        ),
        canContinue: !!data.sport,
      };
    }

    // Step 11 — Coach: Team name
    if (step === 11) {
      return {
        question: "What's your team name?",
        content: (
          <div className="w-full">
            <BigInput
              value={data.teamName}
              onChange={(v) => set("teamName", v)}
              onEnter={() => data.teamName.trim() && goNext()}
              placeholder="Team name"
            />
          </div>
        ),
        canContinue: !!data.teamName.trim(),
      };
    }

    // Step 12 — Coach: Confirmation
    if (step === 12) {
      const sportLabel: Record<string, string> = {
        baseball: "Baseball",
        softball: "Softball",
        both: "Baseball/Softball",
      };

      const handleCoachFinish = async () => {
        setSaving(true);
        setSaveError(false);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user");

          // 1. Save coach profile
          const { error: profileErr } = await supabase.from("profiles").upsert({
            id: user.id,
            first_name: data.name,
            role: data.role,
            team_name: data.teamName,
            sport: data.sport,
            onboarding_complete: true,
          });
          if (profileErr) throw profileErr;

          // 2. Create team
          const code = generateCode();
          const { data: team, error: teamErr } = await supabase
            .from("teams")
            .insert({ coach_id: user.id, name: data.teamName, sport: data.sport, code })
            .select()
            .single();

          // 3. Write team_id back to profile (best-effort — /coach/dashboard handles missing team gracefully)
          if (team && !teamErr) {
            await supabase.from("profiles").upsert({ id: user.id, team_id: team.id });
          }

          router.push("/coach/dashboard");
        } catch {
          setSaveError(true);
          setSaving(false);
        }
      };

      return {
        question: "",
        hideContinue: true,
        content: (
          <div className="flex flex-col items-center gap-6 w-full text-center">
            <AnimatedCheckmark />

            <div className="space-y-2">
              <p className="text-white font-bold text-base leading-snug">
                Welcome, Coach{" "}
                <span style={{ color: "#3B82F6" }}>{data.name}</span>.{" "}
                Your{" "}
                <span style={{ color: "#3B82F6" }}>{sportLabel[data.sport] || data.sport}</span>{" "}
                dashboard is ready.
              </p>
            </div>

            {saveError && (
              <p className="text-sm text-red-400">
                Something went wrong.{" "}
                <button onClick={handleCoachFinish} className="underline cursor-pointer">
                  Try again
                </button>
              </p>
            )}

            <ContinueButton
              disabled={saving}
              onClick={handleCoachFinish}
              label={saving ? "Saving..." : "Go to My Dashboard →"}
            />
          </div>
        ),
        canContinue: false,
      };
    }

    return { question: "", content: null, canContinue: false };
  }

  const { question, content, canContinue, subText, hideContinue } = renderStep();
  const StepIco = STEP_ICONS[step] ?? Activity;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      {/* Ambient gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute left-1/2 top-0"
          style={{
            width: 660,
            height: 660,
            transform: "translate(-50%, -52%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 62%)",
            filter: "blur(28px)",
          }}
        />
        <div
          className="absolute left-1/2 bottom-0"
          style={{
            width: 520,
            height: 420,
            transform: "translate(-50%, 58%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50" style={{ height: 3, backgroundColor: "#101010" }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: "#3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.9), 0 0 20px rgba(59,130,246,0.5)" }}
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: easing }}
        />
      </div>

      {/* Header: back · wordmark · step count */}
      <header
        className="relative z-40 flex shrink-0 items-center justify-between px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: 6 }}
      >
        <div style={{ width: 64 }}>
          <AnimatePresence>
            {step > 0 && (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                onClick={goBack}
                className="flex items-center gap-1 text-sm font-medium cursor-pointer"
                style={{ color: "#777777" }}
              >
                <ChevronLeft size={18} strokeWidth={2} />
                Back
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <span className="text-base font-extrabold tracking-tight text-white">
          Arm<span style={{ color: "#3B82F6" }}>Track</span>
        </span>

        <div style={{ width: 64 }} />
      </header>

      {/* Middle — icon + question + options, centered, no page scroll */}
      <main className="relative z-10 flex-1 overflow-y-auto px-5">
        <div className="flex min-h-full flex-col justify-center py-3">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
              className="mx-auto w-full"
              style={{ maxWidth: 480 }}
            >
              <div className="flex flex-col items-center gap-6">
                {question && (
                  <>
                    {/* Step icon chip */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: easing, delay: 0.05 }}
                      className="flex items-center justify-center"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        backgroundImage:
                          "linear-gradient(160deg, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0.06) 100%)",
                        border: "1px solid rgba(59,130,246,0.35)",
                        boxShadow: "0 0 30px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
                      }}
                    >
                      <StepIco size={26} strokeWidth={2} style={{ color: "#93c5fd" }} />
                    </motion.div>

                    {/* Question */}
                    <div className="text-center">
                      <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight text-white">
                        {question}
                      </h1>
                      {subText && (
                        <p className="mt-2.5 text-sm" style={{ color: "#8b8f98" }}>
                          {subText}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Options / input */}
                <div className="w-full">{content}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Continue — bottom */}
      {!hideContinue && (
        <div
          className="relative z-10 shrink-0 px-5 pt-2"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
        >
          <div className="mx-auto w-full" style={{ maxWidth: 480 }}>
            <ContinueButton disabled={!canContinue} onClick={goNext} />
          </div>
        </div>
      )}
    </div>
  );
}
