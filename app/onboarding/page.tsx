"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
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

// ── Constants ────────────────────────────────────────────────────────────────

const easing = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

const microCopy: Record<number, string> = {
  0: "Takes 60 seconds. Built for serious players.",
  1: "Your data stays private and is only used to personalize your experience.",
  2: "Position affects how we read your workload and soreness patterns.",
  3: "Your goal shapes every recommendation ArmTrack gives you.",
  4: "Throw frequency helps us detect when your arm needs recovery.",
  5: "Injury history helps ArmTrack flag concerning patterns earlier.",
  6: "Knowing your problem zones helps ArmTrack give smarter feedback.",
  7: "Level helps us contextualize your workload.",
  8: "Almost there — your profile is nearly complete.",
  9: "",
  10: "Your team's arm health starts here.",
  11: "We'll use this to personalize your coaching dashboard.",
  12: "",
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
  padY: _padY,
}: TapCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.13, ease: "easeOut" }}
      className="relative flex items-center gap-4 cursor-pointer outline-none w-full text-left"
      style={{
        minHeight: 72,
        paddingLeft: 20,
        paddingRight: selected ? 48 : 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderRadius: 16,
        backgroundColor: selected ? "#0f1f30" : "#0d0d0d",
        border: selected ? "1.5px solid rgba(59,130,246,0.5)" : "1.5px solid #1e1e1e",
        borderLeft: selected ? "3px solid #3B82F6" : "1.5px solid #1e1e1e",
        boxShadow: selected ? "0 0 20px rgba(59,130,246,0.15)" : "none",
        transition: "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <span className="flex-shrink-0" style={{ color: selected ? "#3B82F6" : "#555555" }}>
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold text-white">{label}</p>
        {subtitle && (
          <p className="text-xs" style={{ color: "#555555" }}>
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
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className="w-full rounded-2xl bg-blue-500 text-base font-bold text-white transition-colors duration-150 hover:bg-blue-400 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
      style={{ maxWidth: 340, height: 56, boxShadow: "0 4px 28px rgba(59,130,246,0.38)" }}
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

  function set<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setDirection(1);
    setStep((s) => {
      // Coach track: after name (step 1), skip player steps and go to coach steps
      if (data.role === "coach" && s === 1) return 10;
      return s + 1;
    });
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => {
      // Coach track: back from first coach step returns to name
      if (data.role === "coach" && s === 10) return 1;
      return s - 1;
    });
  }

  // ── Auth loading ──────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
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
    // Player has 10 steps: 0–9
    return ((step + 1) / 10) * 100;
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

      const handleFinish = async () => {
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
          router.push("/log");
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
                <button onClick={handleFinish} className="underline cursor-pointer">
                  Try again
                </button>
              </p>
            )}

            <ContinueButton
              disabled={saving}
              onClick={handleFinish}
              label={saving ? "Saving..." : "Log My First Session →"}
            />

            <p className="text-xs" style={{ color: "#444444" }}>
              Your personalized recommendations start after your first log.
            </p>
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
          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            first_name: data.name,
            role: data.role,
            team_name: data.teamName,
            sport: data.sport,
            onboarding_complete: true,
          });
          if (error) throw error;
          router.push("/dashboard");
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

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3, backgroundColor: "#111111" }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: "#3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.9), 0 0 20px rgba(59,130,246,0.4)" }}
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: easing }}
        />
      </div>

      {/* Micro-copy bar */}
      <div
        className="fixed top-3 left-0 right-0 z-40 flex items-center justify-center px-4"
        style={{ height: 28 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-xs italic text-center"
            style={{ color: "#888888" }}
          >
            {microCopy[step] ?? ""}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Back button */}
      <div className="fixed top-12 left-0 z-40 px-5" style={{ height: 36 }}>
        <AnimatePresence>
          {step > 0 && (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: "#555555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
            >
              <ChevronLeft size={16} strokeWidth={2} />
              Back
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center overflow-hidden pt-20 pb-10">
        <div className="w-full" style={{ maxWidth: 560 }}>
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
              <div className="flex flex-col items-center gap-6 px-5">
                {/* Question */}
                {question && (
                  <div className="text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight sm:text-4xl">
                      {question}
                    </h1>
                    {subText && (
                      <p className="mt-2 text-sm" style={{ color: "#666666" }}>
                        {subText}
                      </p>
                    )}
                  </div>
                )}

                {/* Cards / input */}
                <div className="w-full">{content}</div>

                {/* Continue button (hidden on confirmation steps that have their own) */}
                {!hideContinue && (
                  <ContinueButton disabled={!canContinue} onClick={goNext} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
