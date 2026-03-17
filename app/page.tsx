"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── ScrollFade — fires once on viewport entry ──────────────────────────────────

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
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.48, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Phone Mockup ───────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.28, ease }}
      style={{
        backgroundColor: "#0a0a0a",
        borderRadius: 44,
        border: "1px solid #2a2a2a",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03), 0 0 60px rgba(59,130,246,0.12)",
        width: "100%",
        maxWidth: 340,
        aspectRatio: "9 / 19.5",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
      }}
    >
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 13, paddingBottom: 5, flexShrink: 0 }}>
        <div style={{ width: 54, height: 5, backgroundColor: "#1a1a1a", borderRadius: 999 }} />
      </div>

      {/* Nav */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "5px 16px 8px",
          borderBottom: "1px solid #111111",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
          Arm<span style={{ color: "#3B82F6" }}>Track</span>
        </span>
        <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5, padding: "2px 6px" }}>
          Sign out
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "11px 13px 14px", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 8, fontWeight: 600, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 3px" }}>
            Good morning, Alex
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
              Arm Health Dashboard
            </p>
            <span
              style={{
                display: "inline-flex", alignItems: "center",
                backgroundColor: "rgba(249,115,22,0.10)",
                border: "1px solid rgba(249,115,22,0.25)",
                color: "#fb923c",
                fontSize: 7, fontWeight: 700,
                padding: "2px 5px", borderRadius: 999, whiteSpace: "nowrap",
              }}
            >
              5-day streak
            </span>
          </div>
        </div>

        {/* Score Card */}
        <div
          style={{
            backgroundColor: "#111111",
            border: "1px solid #222222",
            borderRadius: 14,
            padding: "11px 12px",
            boxShadow: "0 0 20px rgba(59,130,246,0.07)",
            display: "flex", flexDirection: "column", gap: 9,
          }}
        >
          {/* Amber alert line */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 5,
              backgroundColor: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 7,
              padding: "4px 7px",
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#F59E0B", flexShrink: 0 }} />
            <p style={{ fontSize: 7.5, fontWeight: 600, color: "#F59E0B", margin: 0, lineHeight: 1.3 }}>
              Readiness down after back-to-back throwing days
            </p>
          </div>

          {/* Score row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: "50%", left: "40%",
                  transform: "translate(-50%,-50%)",
                  width: 64, height: 64, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)",
                  filter: "blur(10px)", pointerEvents: "none",
                }}
              />
              <span style={{ fontSize: 48, fontWeight: 900, color: "#F59E0B", lineHeight: 1, display: "block", fontVariantNumeric: "tabular-nums", position: "relative" }}>
                6.1
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>/10</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#F59E0B",
                  fontSize: 9, fontWeight: 700,
                  padding: "3px 7px", borderRadius: 999, whiteSpace: "nowrap",
                }}
              >
                Proceed with Caution
              </span>
              <span style={{ fontSize: 7.5, color: "#6b7280" }}>Based on your recent logs</span>
            </div>
          </div>

          {/* Score badges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
            {(
              [["Pain", 2, "#22C55E"], ["Soreness", 4, "#F59E0B"], ["Stiffness", 3, "#22C55E"]] as [string, number, string][]
            ).map(([label, val, color]) => (
              <div
                key={label}
                style={{
                  backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e",
                  borderRadius: 9, padding: "6px 3px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {val}
                </span>
                <span style={{ fontSize: 7.5, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 7.5, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>
            Estimated from pain, soreness, stiffness, and recent throwing load.
          </p>
        </div>

        {/* Recommendation card */}
        <div
          style={{
            backgroundColor: "#111111",
            border: "1px solid #222222",
            borderLeft: "3px solid #F59E0B",
            borderRadius: 14,
            padding: "10px 12px",
            boxShadow: "0 0 20px rgba(59,130,246,0.07)",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          <p style={{ fontSize: 8.5, fontWeight: 700, color: "#fff", margin: 0 }}>
            Today&apos;s Recommendation
          </p>
          <p style={{ fontSize: 8.5, fontWeight: 600, color: "#d1d5db", margin: 0, lineHeight: 1.45 }}>
            Light catch only today. Monitor soreness trend.
          </p>
          <p style={{ fontSize: 7.5, color: "#555555", margin: 0, lineHeight: 1.4 }}>
            ArmTrack tracks patterns to support your decisions — not to diagnose injuries.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div style={{ backgroundColor: "#3B82F6", borderRadius: 10, padding: "9px 0", textAlign: "center", boxShadow: "0 3px 12px rgba(59,130,246,0.35)" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Log Today</span>
          </div>
          <div style={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: 10, padding: "9px 0", textAlign: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>View History</span>
          </div>
        </div>

      </div>
    </motion.div>
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
          backgroundColor: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
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
            style={{ backgroundColor: "#3B82F6", padding: "8px 18px", boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6")}
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col justify-start md:justify-center overflow-hidden px-6 pt-20 pb-8 sm:px-10 md:pt-24 md:pb-12">

        {/* Background seam texture */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <path d="M 200 -50 C 300 100 320 300 280 500 C 260 600 240 650 220 700" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 180 -50 C 280 100 300 300 260 500 C 240 600 220 650 200 700" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {[0,1,2,3,4,5,6,7].map(i => (
              <line key={`a${i}`} x1={175 - i * 4} y1={-20 + i * 92} x2={205 + i * 4} y2={-10 + i * 92} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            ))}
            {[0,1,2,3,4,5,6,7].map(i => (
              <line key={`b${i}`} x1={155 - i * 4} y1={10 + i * 92} x2={185 + i * 4} y2={20 + i * 92} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            ))}
          </svg>
        </div>

        {/* Radial glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 65% 40%, rgba(59,130,246,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col md:flex-row md:items-center md:gap-10">

          {/* Left: copy */}
          <div className="flex flex-col gap-5 md:w-[54%] md:pr-6">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center",
                  fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#888", border: "1px solid #2a2a2a",
                  padding: "4px 10px", borderRadius: 6, fontWeight: 600,
                }}
              >
                ARM CARE &bull; BASEBALL &amp; SOFTBALL
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.07, ease }}
              className="font-bold text-white"
              style={{ fontSize: "clamp(28px, 7vw, 52px)", lineHeight: 1.08, letterSpacing: "-0.025em" }}
            >
              Track arm stress before it turns into shutdown time.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease }}
              style={{ color: "#aaa", fontSize: 15, lineHeight: 1.65, maxWidth: 460 }}
            >
              Log pain, soreness, stiffness, and throwing load in 30 seconds. Get a daily readiness score and a clear recommendation so you know when to push, scale back, or rest.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white transition-all duration-150"
                style={{
                  backgroundColor: "#3B82F6",
                  height: 56,
                  boxShadow: "0 4px 28px rgba(59,130,246,0.42)",
                  flex: "1 1 auto",
                  maxWidth: "100%",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 36px rgba(59,130,246,0.55)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(59,130,246,0.42)";
                }}
              >
                Start Free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all duration-150"
                style={{ border: "1px solid #2a2a2a", color: "#aaa", height: 56, padding: "0 28px" }}
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

            {/* Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3, ease }}
              className="flex flex-col gap-2"
            >
              {[
                "Daily check-ins in 30 seconds",
                "Built for baseball and softball throwers",
                "Readiness score based on your recent logs",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <Check size={13} strokeWidth={2.5} style={{ color: "#3B82F6", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#bbb" }}>{item}</span>
                </div>
              ))}
              <p className="mt-1 italic" style={{ fontSize: 12, color: "#555" }}>
                Used by 500+ players from high school to college
              </p>
            </motion.div>
          </div>

          {/* Right: phone mockup */}
          <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
            <PhoneMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span style={{ color: "#333", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown style={{ color: "#333", width: 18, height: 18 }} />
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Strip ──────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", backgroundColor: "#080808" }}>
        <ScrollFade>
          <div className="mx-auto max-w-5xl px-6 sm:px-10 py-4 md:py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              {[
                "500+ players tracking their arm",
                "High school to college level",
                "Daily logs in 30 seconds",
                "Built for throwers, not generic wellness",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 flex-1 justify-center">
                  {i > 0 && (
                    <span className="hidden sm:block" style={{ color: "#1e1e1e", fontSize: 16, userSelect: "none" }}>|</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.13em" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>

      {/* ── Problem Section ─────────────────────────────────────────────────── */}
      <section id="problem" className="px-6 sm:px-10 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-3"
              style={{ fontSize: "clamp(24px, 4.5vw, 30px)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            >
              Most arm problems do not come out of nowhere.
            </h2>
          </ScrollFade>

          <ScrollFade delay={0.08}>
            <p className="text-center mb-10 max-w-lg mx-auto" style={{ color: "#999", fontSize: 15, lineHeight: 1.65 }}>
              Pain, soreness, and throwing load usually trend wrong before players miss time. Most athletes just do not have a system to catch it early.
            </p>
          </ScrollFade>

          <div className="flex flex-col gap-3 mb-10">
            {[
              {
                title: "Throwing blind",
                desc: "If you are not tracking how your arm feels, every throwing day is a guess.",
              },
              {
                title: "Warning signs get missed",
                desc: "Soreness and workload trends often build before a real problem shows up.",
              },
              {
                title: "No baseline, bad decisions",
                desc: "Without daily check-ins, it is harder to know when to push, back off, or rest.",
              },
            ].map((card, i) => (
              <ScrollFade key={i} delay={i * 0.1}>
                <div
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #222222",
                    borderLeft: "3px solid #EF4444",
                    borderRadius: 16,
                    padding: "18px 20px",
                  }}
                >
                  <p className="font-bold text-white mb-1" style={{ fontSize: 14, lineHeight: 1.4 }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.55 }}>
                    {card.desc}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade delay={0.32}>
            <p className="text-center font-bold text-white" style={{ fontSize: 19, letterSpacing: "-0.01em" }}>
              ArmTrack gives you that system.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 sm:px-10 py-12 md:py-20" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-10"
              style={{ fontSize: "clamp(24px, 4.5vw, 30px)", letterSpacing: "-0.02em" }}
            >
              A simple daily system for smarter throwing decisions.
            </h2>
          </ScrollFade>

          <div className="flex flex-col sm:flex-row gap-4">
            {[
              {
                n: "01",
                title: "Log your arm",
                desc: "Track pain, soreness, stiffness, and throwing load in a fast daily check-in.",
              },
              {
                n: "02",
                title: "See your trends",
                desc: "Spot rising soreness, fatigue patterns, and workload changes before they get ignored.",
              },
              {
                n: "03",
                title: "Know what today looks like",
                desc: "Get a readiness score and a recommendation that helps guide throw, recovery, or rest decisions.",
              },
            ].map((step, i) => (
              <ScrollFade key={step.n} delay={i * 0.1} className="flex-1">
                <div
                  className="relative flex flex-col gap-3 h-full p-5 md:p-6"
                  style={{ backgroundColor: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 18, overflow: "hidden" }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute font-black leading-none select-none"
                    style={{ fontSize: 72, color: "rgba(59,130,246,0.1)", top: 6, right: 14, letterSpacing: "-0.04em", lineHeight: 1 }}
                  >
                    {step.n}
                  </span>
                  <div className="relative">
                    <p className="font-bold text-white mb-2" style={{ fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Actually Get ───────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-12 md:py-20" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-3"
              style={{ fontSize: "clamp(24px, 4.5vw, 30px)", letterSpacing: "-0.02em" }}
            >
              More than logs. A clearer answer for today.
            </h2>
          </ScrollFade>
          <ScrollFade delay={0.08}>
            <p className="text-center mb-10 max-w-xl mx-auto" style={{ color: "#999", fontSize: 15, lineHeight: 1.65 }}>
              ArmTrack turns daily check-ins into useful context. Instead of guessing based on how your arm felt in warmups, you can look at your recent trends and make a better decision.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Daily readiness score", desc: "A weighted number from 0–10 based on recent pain, soreness, stiffness, and workload." },
              { title: "Trend tracking over time", desc: "See how your arm responds across sessions, weeks, and throwing phases." },
              { title: "Fast arm status check-ins", desc: "Log in under 30 seconds, every day, on your phone." },
              { title: "Better throw and rest conversations with coaches", desc: "Show a coach your log data instead of trying to describe how you feel." },
            ].map((card, i) => (
              <ScrollFade key={i} delay={i * 0.08}>
                <div
                  style={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid #1e1e1e",
                    borderRadius: 16,
                    padding: "20px 22px",
                    height: "100%",
                  }}
                >
                  <p className="font-bold text-white mb-2" style={{ fontSize: 14, lineHeight: 1.3 }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It Is For ───────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-12 md:py-20" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-10"
              style={{ fontSize: "clamp(24px, 4.5vw, 30px)", letterSpacing: "-0.02em" }}
            >
              Built for throwers at every level.
            </h2>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "Pitchers",
                desc: "Manage soreness, recovery, and throwing load between outings.",
                accent: "#3B82F6",
              },
              {
                title: "Catchers",
                desc: "Track cumulative arm fatigue from high-volume throwing.",
                accent: "#3B82F6",
              },
              {
                title: "Position Players",
                desc: "Know when your arm is ready to air it out and when it needs recovery.",
                accent: "#3B82F6",
              },
              {
                title: "Parents and Coaches",
                desc: "Get better context around how an athlete is feeling day to day.",
                accent: "#3B82F6",
              },
            ].map((card, i) => (
              <ScrollFade key={i} delay={i * 0.08}>
                <div
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #222222",
                    borderLeft: "3px solid #3B82F6",
                    borderRadius: 16,
                    padding: "20px 22px",
                  }}
                >
                  <p className="font-bold text-white mb-1.5" style={{ fontSize: 15, letterSpacing: "-0.01em" }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section
        className="px-6 sm:px-10 py-12 md:py-20"
        style={{ backgroundColor: "#080b12", borderTop: "1px solid #1a2030" }}
      >
        <div className="mx-auto max-w-md flex flex-col items-center gap-5 text-center">
          <ScrollFade className="w-full flex flex-col items-center gap-5">
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(22px, 4.5vw, 28px)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            >
              Stop guessing what your arm can handle today.
            </h2>
            <p style={{ fontSize: 15, color: "#999", lineHeight: 1.6 }}>
              Track your arm in 30 seconds, catch warning signs earlier, and make better throwing decisions.
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
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6")}
            >
              Start Free
            </a>
            <p style={{ fontSize: 12, color: "#555" }}>
              Free to start. No complicated setup. Built for baseball and softball athletes.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid #1a1a1a" }}
      >
        <span style={{ fontSize: 13, color: "#555" }}>ArmTrack &copy; 2026</span>
        <span className="text-center sm:text-right" style={{ fontSize: 13, color: "#555" }}>
          Built for players who take their arm seriously.
        </span>
      </footer>

    </div>
  );
}
