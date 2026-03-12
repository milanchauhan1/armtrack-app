"use client";

import { motion } from "framer-motion";

// ── Animation ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

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

// ── Phone Mockup ───────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div
      style={{
        width: 224,
        height: 428,
        borderRadius: 44,
        backgroundColor: "#060606",
        border: "1px solid #1e1e1e",
        boxShadow:
          "0 48px 96px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(59,130,246,0.1)",
        padding: "28px 16px 22px",
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
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 72,
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
          style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}
        >
          Arm<span style={{ color: "#3B82F6" }}>Track</span>
        </span>
        <span style={{ fontSize: 9, color: "#444", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Today
        </span>
      </div>

      {/* Readiness score */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "#3a3a3a",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            margin: 0,
          }}
        >
          Estimated Readiness
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, position: "relative" }}>
          {/* Glow behind score */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: 24,
              transform: "translateY(-50%)",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(34,197,94,0.28) 0%, transparent 70%)",
              filter: "blur(12px)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: "#22C55E",
              lineHeight: 1,
              position: "relative",
            }}
          >
            8.2
          </span>
          <span style={{ fontSize: 14, color: "#2a2a2a", fontWeight: 500 }}>/10</span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.22)",
            color: "#22C55E",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            width: "fit-content",
          }}
        >
          Good to Go
        </span>
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
            <span style={{ fontSize: 17, fontWeight: 900, color }}>{val}</span>
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
          padding: "8px 10px",
        }}
      >
        <p style={{ fontSize: 9, color: "#666", lineHeight: 1.55, margin: 0 }}>
          Normal session today — stay within your pitch count plan.
        </p>
      </div>

      {/* Log button */}
      <div
        style={{
          backgroundColor: "#3B82F6",
          borderRadius: 12,
          padding: "10px",
          textAlign: "center",
          marginTop: "auto",
          boxShadow: "0 4px 18px rgba(59,130,246,0.45)",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Log Today →</span>
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
                "radial-gradient(ellipse, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.06) 45%, transparent 70%)",
              filter: "blur(16px)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col md:flex-row md:items-center md:gap-16 gap-14">

          {/* Left: text */}
          <div className="flex flex-col gap-7 md:flex-1">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#93c5fd",
                  padding: "6px 14px",
                }}
              >
                ⚾ Built for baseball &amp; softball pitchers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="font-black tracking-tight leading-[0.93]"
              style={{ fontSize: "clamp(62px, 15vw, 108px)" }}
            >
              <span className="block text-white">Your Arm.</span>
              <span className="block" style={{ color: "#60a5fa" }}>
                Protected.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease }}
              className="text-lg leading-relaxed max-w-md"
              style={{ color: "#777" }}
            >
              Know if your arm is ready before you throw —{" "}
              <span style={{ color: "#aaa" }}>every single day.</span>
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
                  padding: "15px 32px",
                  boxShadow: "0 4px 32px rgba(59,130,246,0.48)",
                }}
              >
                Start Free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl text-base font-semibold transition-all duration-200 hover:bg-white/[0.04]"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  padding: "15px 32px",
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
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
            className="flex justify-center md:justify-end md:flex-shrink-0"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Bar ────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 pb-6">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-0 rounded-2xl px-6 py-5"
              style={{ backgroundColor: "#080808", border: "1px solid #141414" }}
            >
              {[
                "500+ pitchers tracking their arm",
                "High school to college level athletes",
                "Free to start for every athlete",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5"
                  style={{ flex: i === 1 ? "0 0 auto" : 1, justifyContent: "center" }}
                >
                  {i > 0 && (
                    <span
                      className="hidden sm:block"
                      style={{ color: "#1e1e1e", fontSize: 20 }}
                    >
                      |
                    </span>
                  )}
                  <span className="text-sm font-medium" style={{ color: "#484848" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Problem Section ─────────────────────────────────────────────────── */}
      <section id="problem" className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight text-center leading-tight mb-14"
            >
              <span className="text-white">Most arm injuries are </span>
              <span style={{ color: "#60a5fa" }}>preventable.</span>
            </h2>
          </FadeUp>

          <div className="flex flex-col gap-3 mb-10">
            {[
              "Throwing without knowing your recovery status",
              "Missing early warning signs of overuse",
              "No data when talking to coaches or trainers",
            ].map((problem, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div
                  className="flex items-center gap-4 rounded-2xl"
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #141414",
                    padding: "18px 20px",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>❌</span>
                  <p className="text-base font-semibold text-white leading-snug">{problem}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.32}>
            <p
              className="text-center text-xl font-black tracking-tight"
              style={{ color: "#3B82F6" }}
            >
              ArmTrack fixes all three.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="text-center mb-16">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#3B82F6" }}
              >
                How It Works
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Three steps. Thirty seconds.
              </h2>
            </div>
          </FadeUp>

          <div className="flex flex-col sm:flex-row gap-4">
            {[
              {
                n: "01",
                title: "Log in 30 seconds",
                desc: "Pain, soreness, stiffness. Quick daily check-in — takes less time than your warm-up.",
              },
              {
                n: "02",
                title: "Get your readiness score",
                desc: "Built from your actual throwing load and recovery data. Not a guess. Your data.",
              },
              {
                n: "03",
                title: "Know before you throw",
                desc: "Color-coded guidance. Green means go. No more guessing how your arm will hold up.",
              },
            ].map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.12} className="flex-1">
                <div
                  className="flex flex-col gap-5"
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #141414",
                    borderRadius: 20,
                    padding: "28px 24px",
                    height: "100%",
                    boxShadow: "0 0 32px rgba(59,130,246,0.05)",
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
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="text-center mb-16">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: "#3B82F6" }}
              >
                The Reality
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                The problem is real.
              </h2>
            </div>
          </FadeUp>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {[
              {
                stat: "1 in 4",
                label: "pitchers suffer a significant arm injury",
                color: "#EF4444",
                glow: "rgba(239,68,68,0.08)",
              },
              {
                stat: "38.8%",
                label: "of MLB pitchers have had Tommy John surgery",
                color: "#F59E0B",
                glow: "rgba(245,158,11,0.08)",
              },
              {
                stat: "Most",
                label: "injuries show warning signs days before they get serious",
                color: "#60a5fa",
                glow: "rgba(59,130,246,0.08)",
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1} className="flex-1">
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
                    style={{ fontSize: 44, color: item.color }}
                  >
                    {item.stat}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                    {item.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <p className="text-center text-lg font-bold text-white">
              ArmTrack gives you the data to be in the{" "}
              <span style={{ color: "#22C55E" }}>3 in 4.</span>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-24">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
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
                      "radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)",
                    filter: "blur(10px)",
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2
                  className="font-black tracking-tight text-white leading-[1.0]"
                  style={{ fontSize: "clamp(36px, 8vw, 64px)" }}
                >
                  Protect the arm.
                  <br />
                  Extend the career.
                </h2>
                <p className="text-base" style={{ color: "#555" }}>
                  Free for every athlete. 30 seconds a day.
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
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-6 sm:px-10"
        style={{ borderTop: "1px solid #0f0f0f" }}
      >
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm" style={{ color: "#2e2e2e" }}>
            ArmTrack © 2025
          </span>
          <span
            className="text-sm text-center sm:text-right"
            style={{ color: "#252525" }}
          >
            Built for pitchers, by someone who cares about the game.
          </span>
        </div>
      </footer>

    </div>
  );
}
