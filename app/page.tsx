"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── Scroll fade — fires once when element enters viewport ──────────────────────

function ScrollFade({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div
      style={{
        borderRadius: 36,
        border: "1px solid #2a2a2a",
        boxShadow:
          "0 32px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03), 0 0 40px rgba(59,130,246,0.08)",
        width: "100%",
        aspectRatio: "9 / 19.5",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      className="bg-[#111] flex flex-col"
    >
      {/* Camera notch */}
      <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
        <div className="w-12 h-1 rounded-full bg-[#1e1e1e]" />
      </div>

      {/* Top bar */}
      <div className="flex justify-between px-4 pt-1 pb-3 border-b border-[#1a1a1a] flex-shrink-0">
        <span className="text-white font-bold text-sm">
          Arm<span className="text-[#3B82F6]">Track</span>
        </span>
        <span className="text-[#555] text-[10px] tracking-widest">TODAY</span>
      </div>

      {/* Center — score dominates */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <span className="text-[9px] tracking-widest text-[#555] uppercase mb-3">
          Estimated Readiness
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className="text-6xl font-bold text-[#22C55E]"
            style={{ filter: "drop-shadow(0 0 12px rgba(34,197,94,0.4))" }}
          >
            8.2
          </span>
          <span className="text-lg text-[#333]">/10</span>
        </div>
        <span className="text-xs bg-[#052e16] text-[#22C55E] px-3 py-1 rounded-full mt-2">
          Ready
        </span>
      </div>

      {/* Bottom section */}
      <div className="px-4 pb-4 space-y-2 flex-shrink-0">
        {/* Recommendation card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] border-l-2 border-l-[#22C55E] rounded-xl p-3">
          <p className="text-xs text-[#aaa]">You&apos;re good to throw today.</p>
        </div>
        {/* Log button */}
        <div className="bg-[#3B82F6] rounded-xl py-2.5 text-center">
          <span className="text-xs font-semibold text-white">Log Today →</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 text-sm font-semibold transition-colors duration-150"
            style={{ color: "#999" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg text-sm font-bold text-white transition-all duration-150"
            style={{
              backgroundColor: "#3B82F6",
              padding: "8px 18px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#60a5fa")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#3B82F6")
            }
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-start md:justify-center overflow-hidden px-6 pt-16 pb-6 md:pt-28 md:pb-20 sm:px-10 md:min-h-screen">

        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(59,130,246,0.1) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col md:flex-row md:items-center md:gap-12">

          {/* Left: text */}
          <div className="flex flex-col md:gap-5 md:w-[55%] md:pr-4">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <span
                className="inline-flex items-center font-semibold whitespace-nowrap"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#888",
                  border: "1px solid #2a2a2a",
                  padding: "4px 9px",
                  borderRadius: 6,
                }}
              >
                Arm Care · Baseball &amp; Softball
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease }}
              className="mt-3 md:mt-0 font-bold text-white"
              style={{
                fontSize: "clamp(30px, 8vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Know if your arm is ready to throw today.
            </motion.h1>

            {/* Subheadline — desktop only */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease }}
              className="hidden md:block text-base leading-relaxed max-w-md"
              style={{ color: "#aaa" }}
            >
              Log pain, soreness, and throwing load in 30 seconds. Get an
              estimated readiness level and a recommendation — every day.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease }}
              className="hidden md:flex md:flex-row gap-3"
            >
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white w-full md:w-auto py-4 px-8 transition-all duration-150"
                style={{
                  backgroundColor: "#3B82F6",
                  boxShadow: "0 4px 28px rgba(59,130,246,0.4)",
                  minWidth: 160,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 6px 36px rgba(59,130,246,0.55)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 28px rgba(59,130,246,0.4)";
                }}
              >
                Start Free
              </a>
              <a
                href="#how-it-works"
                className="hidden md:inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all duration-150"
                style={{
                  border: "1px solid #2a2a2a",
                  color: "#aaa",
                  padding: "0 28px",
                  height: 56,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#444";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                  (e.currentTarget as HTMLElement).style.color = "#aaa";
                }}
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust bullets — desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32, ease }}
              className="hidden md:flex flex-col gap-2"
            >
              {[
                "Log in under 30 seconds",
                "Based on your actual throwing data",
                "Built for players, not generic wellness apps",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check size={13} strokeWidth={2.5} style={{ color: "#3B82F6", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#aaa" }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            className="flex flex-col items-center md:flex-1 md:items-end mt-6 md:mt-0"
          >
            <div style={{ width: "min(72vw, 300px)" }} className="md:max-w-[280px]">
              <PhoneMockup />
            </div>
            {/* Mobile-only CTA — sits directly below mockup */}
            <a
              href="/signup"
              className="md:hidden mt-4 inline-flex items-center justify-center rounded-xl text-base font-bold text-white w-full py-4 transition-all duration-150"
              style={{
                width: "min(72vw, 300px)",
                backgroundColor: "#3B82F6",
                boxShadow: "0 4px 28px rgba(59,130,246,0.4)",
              }}
            >
              Start Free
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Bar ────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #1a1a1a",
          borderBottom: "1px solid #1a1a1a",
          backgroundColor: "#080808",
        }}
      >
        <ScrollFade>
          <div className="mx-auto max-w-4xl px-6 sm:px-10 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {[
              "500+ players tracking their arm",
              "High school to college level",
              "Free for every athlete",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {i > 0 && (
                  <span
                    className="hidden sm:block"
                    style={{ color: "#1e1e1e", fontSize: 18, userSelect: "none" }}
                  >
                    |
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </ScrollFade>
      </div>

      {/* ── Problem Section ─────────────────────────────────────────────────── */}
      <section id="problem" className="px-6 sm:px-10 py-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-4"
              style={{ fontSize: "clamp(26px, 5vw, 32px)", letterSpacing: "-0.01em" }}
            >
              Most arm injuries don&rsquo;t come out of nowhere.
            </h2>
          </ScrollFade>

          <ScrollFade delay={0.08}>
            <p className="text-center text-base mb-12 max-w-xl mx-auto" style={{ color: "#aaa" }}>
              They show up in the data first. Most players just don&rsquo;t have a
              system to see it.
            </p>
          </ScrollFade>

          <div className="flex flex-col gap-3 mb-12">
            {[
              {
                title: "Throwing without knowing your recovery status",
                desc: "Every session is a guess when you have no baseline.",
              },
              {
                title: "Missing soreness trends before they become injuries",
                desc: "Small signals compound. By the time it hurts, it's already late.",
              },
              {
                title: "No data when talking to coaches or trainers",
                desc: "Gut feel isn't a plan. A log is.",
              },
            ].map((card, i) => (
              <ScrollFade key={i} delay={i * 0.1}>
                <div
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid #222",
                    borderLeft: "3px solid #EF4444",
                    borderRadius: 16,
                    padding: "20px 22px",
                  }}
                >
                  <p
                    className="font-bold text-white mb-1"
                    style={{ fontSize: 15, lineHeight: 1.4 }}
                  >
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade delay={0.32}>
            <p
              className="text-center font-bold text-white"
              style={{ fontSize: 20, letterSpacing: "-0.01em" }}
            >
              ArmTrack gives you that system.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="px-6 sm:px-10 py-10 md:py-24"
        style={{ borderTop: "1px solid #111" }}
      >
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-16"
              style={{ fontSize: "clamp(26px, 5vw, 32px)", letterSpacing: "-0.01em" }}
            >
              Three steps. Under a minute.
            </h2>
          </ScrollFade>

          <div className="flex flex-col sm:flex-row gap-4">
            {[
              {
                n: "01",
                title: "Log your arm",
                desc: "Rate pain, soreness, stiffness. Add throws and intensity. 30 seconds.",
              },
              {
                n: "02",
                title: "Get your readiness score",
                desc: "A weighted estimate from your recent logs. A daily signal, not a diagnosis.",
              },
              {
                n: "03",
                title: "Know before you throw",
                desc: "Green means go. Amber means careful. Red means rest.",
              },
            ].map((step, i) => (
              <ScrollFade key={step.n} delay={i * 0.1} className="flex-1">
                <div
                  className="relative flex flex-col gap-4 h-full p-5 md:py-7 md:px-6"
                  style={{
                    backgroundColor: "#0c0c0c",
                    border: "1px solid #1a1a1a",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  {/* Large step number behind content */}
                  <span
                    aria-hidden="true"
                    className="absolute font-black leading-none select-none"
                    style={{
                      fontSize: 80,
                      color: "rgba(59,130,246,0.12)",
                      top: 8,
                      right: 16,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {step.n}
                  </span>
                  <div className="relative">
                    <p
                      className="font-bold text-white mb-2"
                      style={{ fontSize: 18, letterSpacing: "-0.01em", lineHeight: 1.3 }}
                    >
                      {step.title}
                    </p>
                    <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────────────────────────── */}
      <section
        className="px-6 sm:px-10 py-10 md:py-24"
        style={{ borderTop: "1px solid #111" }}
      >
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-14"
              style={{ fontSize: "clamp(26px, 5vw, 32px)", letterSpacing: "-0.01em" }}
            >
              The stakes are real.
            </h2>
          </ScrollFade>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {[
              {
                stat: "1 in 4",
                label: "baseball players suffer a significant arm injury",
                accent: "#EF4444",
              },
              {
                stat: "38.8%",
                label: "of MLB pitchers have had Tommy John surgery",
                accent: "#F59E0B",
              },
              {
                stat: "Days before",
                label: "injuries show warning signs in the data",
                accent: "#60a5fa",
              },
            ].map((item, i) => (
              <ScrollFade key={i} delay={i * 0.1} className="flex-1">
                <div
                  className="p-5 md:py-7 md:px-6"
                  style={{
                    backgroundColor: "#0c0c0c",
                    border: "1px solid #1a1a1a",
                    borderRadius: 20,
                    height: "100%",
                  }}
                >
                  <p
                    className="font-black leading-none mb-3"
                    style={{
                      fontSize: "clamp(32px, 5vw, 42px)",
                      color: item.accent,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.stat}
                  </p>
                  <p style={{ fontSize: 14, color: "#888", lineHeight: 1.55 }}>
                    {item.label}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade delay={0.32}>
            <p
              className="text-center italic"
              style={{ fontSize: 16, color: "#aaa" }}
            >
              ArmTrack helps you be in the{" "}
              <span style={{ color: "#22C55E", fontStyle: "normal", fontWeight: 700 }}>
                3 in 4.
              </span>
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section
        className="px-6 sm:px-10 py-10 md:py-24"
        style={{
          backgroundColor: "#0a0f1a",
          borderTop: "1px solid #1a2a3a",
        }}
      >
        <div className="mx-auto max-w-md flex flex-col items-center gap-6 text-center">
          <ScrollFade className="w-full flex flex-col items-center gap-6">
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(24px, 5vw, 32px)", letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              Your arm is your career.
              <br />
              Track it like one.
            </h2>
            <p style={{ fontSize: 15, color: "#888" }}>
              Free for every athlete. 30 seconds a day.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white w-full transition-all duration-150"
              style={{
                backgroundColor: "#3B82F6",
                height: 56,
                maxWidth: 320,
                boxShadow: "0 4px 32px rgba(59,130,246,0.45)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6";
              }}
            >
              Get Started Free →
            </a>
          </ScrollFade>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid #1a1a1a" }}
      >
        <span style={{ fontSize: 14, color: "#555" }}>ArmTrack © 2026</span>
        <span
          className="text-center sm:text-right"
          style={{ fontSize: 14, color: "#555" }}
        >
          Built for players who take their arm seriously.
        </span>
      </footer>

    </div>
  );
}
