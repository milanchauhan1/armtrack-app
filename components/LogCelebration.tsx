"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const MILESTONES = new Set([7, 14, 21, 30, 60, 100]);

function getStreakMessage(streak: number): string {
  if (streak === 1) return "Your arm health journey starts now.";
  if (streak === 2) return "Back again. Consistency is everything.";
  if (streak === 3) return "Three straight. You're building something real.";
  if (streak === 7) return "One week. Most players never make it here.";
  if (streak === 14) return "Two weeks straight. Your data is telling a story.";
  if (streak === 30) return "30 days. Elite arm care.";
  if (streak === 60) return "60 days. Your arm has never been more protected.";
  return `Day ${streak}. Keep showing up.`;
}

// ── Particle type ─────────────────────────────────────────────────────────────

interface Particle {
  angle: number;
  dist: number;
  color: string;
  w: number;
  h: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 24 }, (_, i) => ({
    angle: (360 / 24) * i + (Math.random() * 8 - 4),
    dist: 42 + Math.random() * 36,
    color: i % 3 === 0 ? "#3B82F6" : "#ffffff",
    w: 1.5 + Math.random() * 2.5,
    h: 5 + Math.random() * 7,
  }));
}

// ── Pitcher SVG ───────────────────────────────────────────────────────────────
// Wind-up figure: arm draws in, then snaps to follow-through position.
// ViewBox 0 0 100 130, displayed at 92×120px.

function PitcherSVG() {
  const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
  const snap = [0.4, 0, 0.2, 1] as [number, number, number, number];
  const pop  = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

  const strokeProps = {
    stroke: "white",
    strokeWidth: 2.5,
    fill: "none",
    strokeLinecap: "round" as const,
  };

  return (
    <svg viewBox="0 0 100 130" width={92} height={120} style={{ overflow: "visible" }}>
      {/* Head */}
      <motion.circle
        cx={50} cy={10} r={8}
        {...strokeProps}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: "50px 10px" }}
        transition={{ duration: 0.28, ease: pop }}
      />

      {/* Torso */}
      <motion.path d="M 50 18 L 50 60"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease }} />

      {/* Shoulders */}
      <motion.path d="M 26 33 L 74 33"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease }} />

      {/* Back (support) leg */}
      <motion.path d="M 46 60 L 56 88 L 60 114"
        {...strokeProps} strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease }} />

      {/* Back foot */}
      <motion.path d="M 54 114 L 68 114"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.18, ease }} />

      {/* Lead leg — raised in wind-up */}
      <motion.path d="M 46 60 C 40 72 34 80 28 74"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease }} />

      {/* Lead foot */}
      <motion.path d="M 28 74 L 18 70"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: 0.14, ease }} />

      {/* Glove arm */}
      <motion.path d="M 26 33 C 14 42 10 52 8 60"
        {...strokeProps}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease }} />

      {/* Throwing arm — wind-up (arm up+back), draws in then fades out on throw */}
      <motion.path d="M 74 33 L 86 20 L 92 10"
        {...strokeProps} strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{
          pathLength: { duration: 0.45, ease },
          opacity: { delay: 0.38, duration: 0.1 },
        }} />

      {/* Throwing arm — follow-through (arm forward+down), snaps in at throw */}
      <motion.path d="M 74 33 L 60 54 L 56 70"
        {...strokeProps} strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: 0.38, duration: 0.22, ease: snap },
          opacity: { delay: 0.38, duration: 0.08 },
        }} />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LogCelebration({
  streakCount,
  firstName,
  onComplete,
}: {
  streakCount: number;
  firstName: string;
  onComplete: () => void;
}) {
  // firstName reserved for future personalization
  void firstName;

  const isMilestone = MILESTONES.has(streakCount);
  const streakColor = isMilestone ? "#F59E0B" : "#ffffff";

  // Stable particle set — won't re-generate on re-render
  const particles = useMemo<Particle[]>(makeParticles, []);

  useEffect(() => {
    const t = setTimeout(onComplete, 3500);
    return () => clearTimeout(t);
  }, [onComplete]);

  // ── Ball arc layout math ─────────────────────────────────────────────────
  // Pitcher SVG: 92×120px, placed at top:0 in a 220px-tall relative container.
  // Follow-through arm tip in SVG coords: (56, 70).
  //   display x: (56/100)×92 ≈ 51.5 px from SVG left edge → +5.5px from container center
  //   display y: (70/130)×120 ≈ 64.6 px from SVG top → ~65px from container top
  // Ball center starts at: left=calc(50%+2px), top=61px (accounting for 4px half-size margin).
  // Ball travels: Δx=+122px, Δy=+6px.
  // Impact center: left=calc(50%+124px), top=67px.

  const BALL_LEFT = "calc(50% + 6px)";  // ball left edge (center = +2px)
  const BALL_TOP  = 65;                  // ball top edge (center = 61px)
  const ARC_X     = [0, 35, 80, 122] as const;
  const ARC_Y     = [0, -14, -8, 6]  as const;
  const IMPACT_LEFT = "calc(50% + 124px)";
  const IMPACT_TOP  = 67;

  const trailDelays = [0.10, 0.15, 0.20, 0.25] as const;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Fade-to-black overlay — activates at 3.2s */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 0.3 }}
      />

      {/* Content column */}
      <div
        className="relative flex flex-col items-center w-full"
        style={{ paddingTop: "14vh" }}
      >

        {/* ── Pitcher + ball area ────────────────────────────────────────── */}
        <div className="relative w-full" style={{ height: 220 }}>

          {/* Pitcher — centered */}
          <div
            className="absolute top-0"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            <PitcherSVG />
          </div>

          {/* Trail dots — 4 semi-transparent discs that follow the arc slightly behind the ball */}
          {trailDelays.map((d, i) => {
            const size = Math.max(2, 6 - i * 1.2);
            const half = size / 2;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white pointer-events-none"
                style={{
                  left: BALL_LEFT,
                  top: BALL_TOP,
                  width: size,
                  height: size,
                  marginLeft: -half,
                  marginTop: -half,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.55 - i * 0.1, 0.3 - i * 0.06, 0],
                  x: [...ARC_X],
                  y: [...ARC_Y],
                }}
                transition={{
                  delay: 0.6 + d,
                  duration: 0.42,
                  ease: "easeOut",
                  times: [0, 0.25, 0.65, 1],
                }}
              />
            );
          })}

          {/* Ball */}
          <motion.div
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: BALL_LEFT,
              top: BALL_TOP,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [...ARC_X],
              y: [...ARC_Y],
            }}
            transition={{
              delay: 0.6,
              duration: 0.42,
              ease: "easeOut",
              times: [0, 0.08, 0.85, 1],
            }}
          />

          {/* Impact explosion — 24 particles radiate from ball's end position */}
          <div
            className="absolute pointer-events-none"
            style={{ left: IMPACT_LEFT, top: IMPACT_TOP }}
          >
            {particles.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const tx = Math.cos(rad) * p.dist;
              const ty = Math.sin(rad) * p.dist;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    width: p.w,
                    height: p.h,
                    backgroundColor: p.color,
                    top: -p.h / 2,
                    left: -p.w / 2,
                    rotate: p.angle,
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, tx * 0.4, tx],
                    y: [0, ty * 0.4, ty],
                    scale: [1.2, 1, 0],
                  }}
                  transition={{
                    delay: 1.0,
                    duration: 0.5,
                    ease: [0.2, 0, 0.8, 0.6] as [number, number, number, number],
                    times: [0, 0.25, 1],
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── Stats reveal ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mt-2 w-full px-8">

          {/* Blue horizontal rule */}
          <svg width="200" height="2" style={{ overflow: "visible" }}>
            <motion.line
              x1={0} y1={1} x2={200} y2={1}
              stroke="#3B82F6" strokeWidth={2} strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 0.3, ease: "easeOut" }}
            />
          </svg>

          {/* Session Logged */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.35,
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#ffffff",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            SESSION LOGGED
          </motion.p>

          {/* Streak row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.5,
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="flex items-center gap-2"
          >
            <Flame size={18} color="#3B82F6" style={{ fill: "none", flexShrink: 0 }} />
            <motion.span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: streakColor,
                letterSpacing: "0.05em",
              }}
              animate={isMilestone ? { scale: [1, 1.08, 1, 1.08, 1] } : {}}
              transition={isMilestone ? { delay: 1.65, duration: 0.8 } : {}}
            >
              {streakCount === 1 ? "Streak Started" : `${streakCount}-Day Streak`}
            </motion.span>
          </motion.div>
        </div>

        {/* ── Personalized message ───────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-center px-10 mt-5"
          style={{ color: "#888888", fontSize: 13, lineHeight: 1.55 }}
        >
          {getStreakMessage(streakCount)}
        </motion.p>
      </div>
    </motion.div>
  );
}
