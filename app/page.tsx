"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, ChevronDown, ArrowRight } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── ScrollFade ─────────────────────────────────────────────────────────────────

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

// ── Stats Card ─────────────────────────────────────────────────────────────────

function StatsCard() {
  const metrics: [string, string, string][] = [
    ["Pain",             "2 / 10",    "#22C55E"],
    ["Soreness",         "4 / 10",    "#F59E0B"],
    ["Stiffness",        "3 / 10",    "#F59E0B"],
    ["Throws yesterday", "85 pitches","#ffffff"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.28, ease }}
      className="w-full md:max-w-[400px]"
      style={{
        backgroundColor: "#0d0d0d",
        borderRadius: 20,
        border: "1px solid #222222",
        boxShadow:
          "0 32px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.025), 0 0 60px rgba(245,158,11,0.07)",
        overflow: "hidden",
      }}
    >
      {/* ── Alert bar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1a1000",
          borderBottom: "1px solid #2a2000",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#F59E0B",
            flexShrink: 0,
            boxShadow: "0 0 6px rgba(245,158,11,0.8)",
          }}
        />
        <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 500 }}>
          Soreness trending up — 3 day pattern
        </span>
      </div>

      {/* ── Score section ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 16px 16px",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#555555",
            fontWeight: 600,
          }}
        >
          ESTIMATED READINESS
        </span>

        <div style={{ position: "relative", lineHeight: 1 }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)",
              filter: "blur(18px)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#F59E0B",
              lineHeight: 1,
              display: "block",
              position: "relative",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            6.1
          </span>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.22)",
            color: "#F59E0B",
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: 999,
          }}
        >
          Proceed with Caution
        </span>
      </div>

      {/* ── Metric rows ────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #1a1a1a",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {metrics.map(([label, value, color]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, color: "#555555" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Recommendation ─────────────────────────────────────────────────── */}
      <div
        style={{
          margin: "4px 12px 12px",
          backgroundColor: "#0a0800",
          border: "1px solid #2a2000",
          borderLeft: "2px solid #F59E0B",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <p
          style={{
            fontSize: 8,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#555555",
            fontWeight: 600,
            margin: "0 0 5px",
          }}
        >
          TODAY&apos;S RECOMMENDATION
        </p>
        <p style={{ fontSize: 11, color: "#aaaaaa", lineHeight: 1.6, margin: 0 }}>
          Light catch only today. Monitor soreness trend closely.
        </p>
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
      <section className="relative flex flex-col justify-start md:justify-center overflow-hidden px-6 pt-12 pb-8 sm:px-10 md:pt-16 md:pb-12">

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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 65% 40%, rgba(59,130,246,0.09) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col md:flex-row md:items-center md:gap-8 lg:gap-12">

          {/* Left: copy */}
          <div className="flex flex-col gap-5 md:w-[54%] md:pr-4">

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
              style={{ fontSize: "clamp(32px, 7vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.025em" }}
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
                className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white transition-all duration-200"
                style={{
                  backgroundColor: "#3B82F6",
                  padding: "0 28px",
                  height: 56,
                  boxShadow: "0 4px 24px rgba(59,130,246,0.38)",
                  flex: "1 1 auto",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(59,130,246,0.55), 0 6px 36px rgba(59,130,246,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(59,130,246,0.38)";
                }}
              >
                Start Free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all duration-200"
                style={{ border: "1px solid #2a2a2a", color: "#aaa", height: 56, padding: "0 24px" }}
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
                <ArrowRight size={15} strokeWidth={2} />
              </a>
            </motion.div>

            {/* Trust line — directly under CTAs */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28, ease }}
              className="italic"
              style={{ fontSize: 12, color: "#555", marginTop: -4 }}
            >
              Used by 500+ players from high school to college
            </motion.p>

            {/* Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34, ease }}
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
            </motion.div>
          </div>

          {/* Right: stats card */}
          <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
            <StatsCard />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span style={{ color: "#2a2a2a", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown style={{ color: "#2a2a2a", width: 18, height: 18 }} />
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Strip ──────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", backgroundColor: "#080808" }}>
        <ScrollFade>
          <div className="mx-auto max-w-5xl px-6 sm:px-10 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              {[
                "500+ players tracking their arm",
                "High school to college level",
                "Daily logs in 30 seconds",
                "Built for throwers, not generic wellness",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 flex-1 justify-center">
                  {i > 0 && (
                    <span className="hidden sm:block" style={{ color: "#1a1a1a", fontSize: 16, userSelect: "none" }}>|</span>
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
      <section id="problem" className="px-6 sm:px-10 py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-3"
              style={{ fontSize: "clamp(22px, 4vw, 36px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Most arm problems do not come out of nowhere.
            </h2>
          </ScrollFade>

          <ScrollFade delay={0.08}>
            <p className="text-center mb-8 max-w-lg mx-auto" style={{ color: "#999", fontSize: 15, lineHeight: 1.65 }}>
              Pain, soreness, and throwing load usually trend wrong before players miss time. Most athletes just do not have a system to catch it early.
            </p>
          </ScrollFade>

          <div className="flex flex-col gap-4 mb-8">
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
                    border: "1px solid #1a1a1a",
                    borderLeft: "3px solid #EF4444",
                    borderRadius: 14,
                    padding: "16px 20px",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 4, lineHeight: 1.3 }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#777777", lineHeight: 1.6, margin: 0 }}>
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
      <section id="how-it-works" className="px-6 sm:px-10 py-10 md:py-16" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-9"
              style={{ fontSize: "clamp(22px, 4vw, 36px)", letterSpacing: "-0.02em" }}
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
                  style={{ backgroundColor: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute font-black leading-none select-none"
                    style={{ fontSize: 72, color: "rgba(59,130,246,0.09)", top: 6, right: 14, letterSpacing: "-0.04em", lineHeight: 1 }}
                  >
                    {step.n}
                  </span>
                  <div className="relative">
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 6, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 13, color: "#777777", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Actually Get ───────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-10 md:py-16" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-4xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-3"
              style={{ fontSize: "clamp(22px, 4vw, 36px)", letterSpacing: "-0.02em" }}
            >
              More than logs. A clearer answer for today.
            </h2>
          </ScrollFade>
          <ScrollFade delay={0.08}>
            <p className="text-center mb-8 max-w-xl mx-auto" style={{ color: "#999", fontSize: 15, lineHeight: 1.65 }}>
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
                    border: "1px solid #1a1a1a",
                    borderRadius: 14,
                    padding: "18px 20px",
                    height: "100%",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 6, lineHeight: 1.3 }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#777777", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It Is For ───────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-10 md:py-16" style={{ borderTop: "1px solid #111111" }}>
        <div className="mx-auto max-w-5xl">
          <ScrollFade>
            <h2
              className="font-bold text-white text-center mb-9"
              style={{ fontSize: "clamp(22px, 4vw, 36px)", letterSpacing: "-0.02em" }}
            >
              Built for throwers at every level.
            </h2>
          </ScrollFade>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                title: "Pitchers",
                desc: "Manage soreness, recovery, and throwing load between outings.",
              },
              {
                title: "Catchers",
                desc: "Track cumulative arm fatigue from high-volume throwing.",
              },
              {
                title: "Position Players",
                desc: "Know when your arm is ready to air it out and when it needs recovery.",
              },
              {
                title: "Parents and Coaches",
                desc: "Get better context around how an athlete is feeling day to day.",
              },
            ].map((card, i) => (
              <ScrollFade key={i} delay={i * 0.08}>
                <div
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #1a1a1a",
                    borderLeft: "3px solid #3B82F6",
                    borderRadius: 14,
                    padding: "18px 16px",
                    height: "100%",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 6, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#777777", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
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
              style={{ fontSize: "clamp(26px, 5vw, 38px)", letterSpacing: "-0.025em", lineHeight: 1.1 }}
            >
              Stop guessing what your arm can handle today.
            </h2>
            <p style={{ fontSize: 15, color: "#999", lineHeight: 1.6 }}>
              Track your arm in 30 seconds, catch warning signs earlier, and make better throwing decisions.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl text-base font-bold text-white w-full transition-all duration-200"
              style={{
                backgroundColor: "#3B82F6",
                height: 56,
                maxWidth: 320,
                boxShadow: "0 0 40px rgba(59,130,246,0.2), 0 4px 32px rgba(59,130,246,0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#60a5fa";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(59,130,246,0.35), 0 6px 40px rgba(59,130,246,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#3B82F6";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(59,130,246,0.2), 0 4px 32px rgba(59,130,246,0.4)";
              }}
            >
              Start Free
            </a>
            <p style={{ fontSize: 12, color: "#888888" }}>
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
