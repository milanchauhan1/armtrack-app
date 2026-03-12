"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

// ── Easing ─────────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── Hero fade (mount-based) ────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Scroll fade (below-fold sections) ─────────────────────────────────────────

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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Phone Mockup ───────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div
      style={{
        width: 264,
        height: 508,
        borderRadius: 48,
        backgroundColor: "#060606",
        border: "1px solid #1e1e1e",
        boxShadow:
          "0 56px 100px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 90px rgba(59,130,246,0.1)",
        padding: "32px 18px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 76,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#141414",
        }}
      />

      {/* App header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}
        >
          Arm<span style={{ color: "#3B82F6" }}>Track</span>
        </span>
        <span
          style={{
            fontSize: 9,
            color: "#444",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Today
        </span>
      </div>

      {/* Readiness score block */}
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 16,
          padding: "14px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <p
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "#3a3a3a",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            margin: 0,
          }}
        >
          Estimated Readiness
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            {/* Green glow behind score */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)",
                filter: "blur(14px)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                fontSize: 62,
                fontWeight: 900,
                color: "#22C55E",
                lineHeight: 1,
                position: "relative",
                display: "block",
              }}
            >
              8.2
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{ fontSize: 11, color: "#2e2e2e", fontWeight: 500, lineHeight: 1 }}
            >
              /10
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.22)",
                color: "#22C55E",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {(
          [
            ["Pain", "1", "#22C55E"],
            ["Soreness", "2", "#22C55E"],
            ["Stiffness", "1", "#22C55E"],
          ] as [string, string, string][]
        ).map(([label, val, color]) => (
          <div
            key={label}
            style={{
              backgroundColor: "#0c0c0c",
              border: "1px solid #1a1a1a",
              borderRadius: 10,
              padding: "8px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color }}>{val}</span>
            <span
              style={{
                fontSize: 7,
                color: "#383838",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderLeft: "2px solid #22C55E",
          borderRadius: 10,
          padding: "9px 11px",
        }}
      >
        <p style={{ fontSize: 10, color: "#666", lineHeight: 1.55, margin: 0 }}>
          You&rsquo;re good to throw today. Normal intensity.
        </p>
      </div>

      {/* Log button */}
      <div
        style={{
          backgroundColor: "#3B82F6",
          borderRadius: 13,
          padding: "11px",
          textAlign: "center",
          marginTop: "auto",
          boxShadow: "0 4px 20px rgba(59,130,246,0.45)",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Log Today →</span>
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
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 text-sm font-semibold transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg text-sm font-bold text-white transition-all duration-150 hover:bg-blue-400"
            style={{
              backgroundColor: "#3B82F6",
              padding: "8px 18px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
            }}
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-24 pb-16 sm:px-10">

        {/* Background radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-start justify-center"
          style={{ paddingTop: "15%" }}
        >
          <div
            style={{
              width: 720,
              height: 560,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.05) 45%, transparent 70%)",
              filter: "blur(16px)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col md:flex-row md:items-center md:gap-16 gap-8">

          {/* Left: text */}
          <div className="flex flex-col gap-5 md:flex-1">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <span
                className="inline-flex items-center text-[10px] md:text-xs font-semibold"
                style={{
                  border: "1px solid #222",
                  color: "#888",
                  padding: "4px 10px",
                  borderRadius: 6,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                Baseball &amp; Softball Arm Care
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="font-black tracking-tight text-white leading-[1.05]"
              style={{ fontSize: "clamp(30px, 9vw, 72px)" }}
            >
              Know if your arm is<br />
              ready to throw today.
            </motion.h1>

            {/* Mobile mockup — between headline and CTA on small screens */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.2, ease }}
              className="flex justify-center md:hidden"
            >
              <PhoneMockup />
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease }}
              className="hidden md:block text-lg leading-relaxed max-w-lg"
              style={{ color: "#aaaaaa" }}
            >
              Log pain, soreness, stiffness, and throwing load in under 30 seconds.
              Get an estimated readiness level and a clear recommendation — every day.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white transition-all duration-200 hover:bg-blue-400"
                style={{
                  backgroundColor: "#3B82F6",
                  padding: "16px 32px",
                  minHeight: 56,
                  boxShadow: "0 4px 32px rgba(59,130,246,0.48)",
                }}
              >
                Start Free
              </a>
              <a
                href="#how-it-works"
                className="hidden md:inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all duration-200 hover:bg-white/[0.04]"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  padding: "16px 32px",
                  minHeight: 56,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust bullets */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease }}
              className="hidden md:flex flex-col gap-2"
            >
              {[
                "Log in under 30 seconds",
                "Based on your actual recent throwing data",
                "Built for players, not generic wellness apps",
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-2">
                  <Check
                    size={14}
                    strokeWidth={2.5}
                    style={{ color: "#3B82F6", flexShrink: 0 }}
                  />
                  <span className="text-sm" style={{ color: "#555" }}>
                    {bullet}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: phone mockup (desktop only — mobile version is inline above) */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
            className="hidden md:flex justify-end flex-shrink-0"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Bar ────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 pb-8">
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-0 rounded-2xl px-6 py-5"
              style={{ backgroundColor: "#080808", border: "1px solid #1e1e1e" }}
            >
              {[
                "500+ players tracking their arm",
                "High school to college level",
                "Free for every athlete",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5"
                  style={{ flex: i === 1 ? "0 0 auto" : 1, justifyContent: "center" }}
                >
                  {i > 0 && (
                    <span
                      className="hidden sm:block"
                      style={{ color: "#222", fontSize: 20, lineHeight: 1 }}
                    >
                      |
                    </span>
                  )}
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#555" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── Problem Section ─────────────────────────────────────────────────── */}
      <section id="problem" className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-3xl">
          <ScrollFade>
            <div className="text-center mb-4">
              <h2
                className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight"
              >
                Most arm injuries show warning signs first.
              </h2>
            </div>
          </ScrollFade>

          <ScrollFade delay={0.08}>
            <p
              className="text-center text-lg mb-12 mt-4"
              style={{ color: "#555" }}
            >
              The problem is players don&rsquo;t have a system to catch them.
            </p>
          </ScrollFade>

          <div className="flex flex-col gap-3 mb-10">
            {[
              "Throwing without knowing your recovery status",
              "Missing early soreness trends before they become injuries",
              "No data when talking to coaches or athletic trainers",
            ].map((problem, i) => (
              <ScrollFade key={i} delay={i * 0.1}>
                <div
                  className="flex items-center gap-4 rounded-2xl"
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #141414",
                    borderLeft: "3px solid rgba(239,68,68,0.6)",
                    padding: "18px 20px",
                  }}
                >
                  <p className="text-base font-semibold text-white leading-snug">{problem}</p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade delay={0.35}>
            <p
              className="text-center text-xl font-black tracking-tight"
              style={{ color: "#3B82F6" }}
            >
              ArmTrack gives you that system.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-5xl">
          <ScrollFade>
            <div className="text-center mb-16">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#3B82F6" }}
              >
                How It Works
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Three steps. Under a minute.
              </h2>
            </div>
          </ScrollFade>

          <div className="flex flex-col sm:flex-row gap-4">
            {[
              {
                n: "01",
                title: "Log your arm",
                desc: "Rate pain, soreness, and stiffness. Add throws and intensity. Done in 30 seconds.",
              },
              {
                n: "02",
                title: "Get your readiness score",
                desc: "A weighted estimate based on your recent logs and throwing load. Not a medical diagnosis — a daily signal.",
              },
              {
                n: "03",
                title: "Know before you throw",
                desc: "Green means go. Amber means be careful. Red means rest. Clear, every day.",
              },
            ].map((step, i) => (
              <ScrollFade key={step.n} delay={i * 0.12} className="flex-1">
                <div
                  className="flex flex-col gap-5"
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #141414",
                    borderRadius: 20,
                    padding: "28px 24px",
                    height: "100%",
                    boxShadow: "0 0 32px rgba(59,130,246,0.04)",
                  }}
                >
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: 48, color: "#1a3050", letterSpacing: "-0.02em" }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <h3
                      className="text-xl font-extrabold text-white mb-2 tracking-tight leading-snug"
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
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
      <section className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-5xl">
          <ScrollFade>
            <div className="text-center mb-16">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#3B82F6" }}
              >
                The Reality
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                The stakes are real.
              </h2>
            </div>
          </ScrollFade>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {[
              {
                stat: "1 in 4",
                label: "baseball players suffer a significant arm injury during their career",
                color: "#EF4444",
                glow: "rgba(239,68,68,0.07)",
              },
              {
                stat: "38.8%",
                label: "of MLB pitchers have undergone Tommy John surgery",
                color: "#F59E0B",
                glow: "rgba(245,158,11,0.07)",
              },
              {
                stat: "Days before",
                label: "most serious injuries show warning signs that go untracked",
                color: "#60a5fa",
                glow: "rgba(59,130,246,0.07)",
              },
            ].map((item, i) => (
              <ScrollFade key={i} delay={i * 0.1} className="flex-1">
                <div
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #141414",
                    borderRadius: 20,
                    padding: "28px 24px",
                    height: "100%",
                    boxShadow: `0 0 32px ${item.glow}`,
                  }}
                >
                  <p
                    className="font-black leading-none mb-3 tracking-tight"
                    style={{ fontSize: 40, color: item.color }}
                  >
                    {item.stat}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                    {item.label}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade delay={0.32}>
            <p className="text-center text-lg font-bold text-white">
              ArmTrack helps you be in the{" "}
              <span style={{ color: "#22C55E" }}>3 in 4.</span>
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <div
              className="relative overflow-hidden text-center"
              style={{
                backgroundColor: "#04101f",
                border: "1px solid #0d2440",
                borderRadius: 28,
                padding: "72px 32px",
              }}
            >
              {/* Background glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div
                  style={{
                    width: 480,
                    height: 320,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)",
                    filter: "blur(10px)",
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2
                  className="font-black tracking-tight text-white leading-[1.05]"
                  style={{ fontSize: "clamp(32px, 7vw, 58px)" }}
                >
                  Your arm is your career.
                  <br />
                  Track it like one.
                </h2>
                <p className="text-base" style={{ color: "#555" }}>
                  Free for every athlete. 30 seconds a day. No guessing.
                </p>
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl text-base font-bold text-white transition-all duration-200 hover:bg-blue-400"
                  style={{
                    backgroundColor: "#3B82F6",
                    padding: "16px 40px",
                    boxShadow: "0 4px 40px rgba(59,130,246,0.55)",
                    marginTop: 4,
                  }}
                >
                  Get Started Free →
                </a>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-6 sm:px-10"
        style={{ borderTop: "1px solid #222" }}
      >
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm" style={{ color: "#3a3a3a" }}>
            ArmTrack © 2025
          </span>
          <span
            className="text-sm text-center sm:text-right"
            style={{ color: "#333" }}
          >
            Built for players who take their arm seriously.
          </span>
        </div>
      </footer>

    </div>
  );
}
