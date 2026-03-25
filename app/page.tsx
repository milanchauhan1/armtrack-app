"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Zap,
  AlertTriangle,
  TrendingDown,
  EyeOff,
  Smartphone,
  Sliders,
  CheckCircle,
  ClipboardList,
  BarChart2,
  MessageSquare,
  Activity,
  TrendingUp,
  Bell,
  Flame,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── ScrollFade — fires once when element enters viewport ──────────────────────

function ScrollFade({
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── CSS iPhone frame ───────────────────────────────────────────────────────────

function IPhoneFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 240,
        borderRadius: 44,
        background: "#1a1a1a",
        border: "2px solid #333333",
        padding: 12,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 24,
          background: "#1a1a1a",
          borderRadius: "0 0 16px 16px",
          zIndex: 10,
        }}
      />
      {/* Screen */}
      <div
        style={{
          borderRadius: 36,
          overflow: "hidden",
          background: "#000000",
          width: "100%",
          minHeight: 480,
          position: "relative",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 11, fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
              {[6, 9, 12, 15].map((h, i) => (
                <div
                  key={i}
                  style={{ width: 3, height: h, background: i < 3 ? "#ffffff" : "#555555", borderRadius: 1 }}
                />
              ))}
            </div>
            <div
              style={{
                width: 22,
                height: 11,
                border: "1.5px solid #ffffff",
                borderRadius: 3,
                position: "relative",
                marginLeft: 2,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  top: 2,
                  width: "70%",
                  height: "calc(100% - 4px)",
                  background: "#ffffff",
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 2.5,
                  height: 5,
                  background: "#ffffff",
                  borderRadius: "0 1px 1px 0",
                }}
              />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Player dashboard mockup ────────────────────────────────────────────────────

function PlayerScreen() {
  return (
    <div style={{ padding: "0 14px 20px" }}>
      <p style={{ color: "#888888", fontSize: 10, marginBottom: 12 }}>Good morning, Jake</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ color: "#22C55E", fontSize: 42, fontWeight: 900, lineHeight: 1 }}>7.8</span>
        <span style={{ color: "#555555", fontSize: 14, fontWeight: 500 }}>/10</span>
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 99,
          padding: "3px 10px",
          fontSize: 10,
          fontWeight: 700,
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.25)",
          color: "#22C55E",
          marginBottom: 14,
        }}
      >
        Good to Go
      </span>
      <div
        style={{
          background: "#111111",
          border: "1px solid #222222",
          borderLeft: "3px solid #22C55E",
          borderRadius: 12,
          padding: "10px 12px",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            color: "#888888",
            fontSize: 9,
            marginBottom: 4,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Today&apos;s Recommendation
        </p>
        <p style={{ color: "#ffffff", fontSize: 10, lineHeight: 1.5 }}>
          Normal session today — stay within your plan.
        </p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {(
          [
            ["P", 3, "#22c55e"],
            ["S", 4, "#f59e0b"],
            ["St", 2, "#22c55e"],
          ] as [string, number, string][]
        ).map(([label, val, color]) => (
          <span
            key={label}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 700,
              background: `${color}15`,
              color,
            }}
          >
            {label}
            {val}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Coach dashboard mockup ─────────────────────────────────────────────────────

const COACH_ROWS: { name: string; pos: string; score: string | null; label: string; color: string }[] = [
  { name: "Jake M.", pos: "Pitcher", score: "8.4", label: "Ready", color: "#22C55E" },
  { name: "Carlos R.", pos: "Pitcher", score: "7.1", label: "Good to Go", color: "#22C55E" },
  { name: "Devon T.", pos: "Catcher", score: "5.8", label: "Caution", color: "#F59E0B" },
  { name: "Malik W.", pos: "Infielder", score: null, label: "Not logged", color: "#555555" },
];

function CoachScreen() {
  return (
    <div style={{ padding: "0 14px 20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
      >
        <p style={{ color: "#ffffff", fontSize: 12, fontWeight: 700 }}>Team Readiness</p>
        <p style={{ color: "#888888", fontSize: 9 }}>5 players</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {COACH_ROWS.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.08, ease }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#111111",
              border: "1px solid #1e1e1e",
              borderLeft: `3px solid ${row.color}`,
              borderRadius: 10,
              padding: "7px 10px",
            }}
          >
            <div>
              <p style={{ color: "#ffffff", fontSize: 10, fontWeight: 600, lineHeight: 1.2 }}>
                {row.name}
              </p>
              <p style={{ color: "#555555", fontSize: 9 }}>{row.pos}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {row.score && (
                <p style={{ color: row.color, fontSize: 12, fontWeight: 900 }}>{row.score}</p>
              )}
              <p style={{ color: row.color, fontSize: 9, fontWeight: 600 }}>{row.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <button
        style={{
          marginTop: 12,
          width: "100%",
          padding: "8px 0",
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.35)",
          borderRadius: 10,
          color: "#60a5fa",
          fontSize: 10,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Notify Team
      </button>
    </div>
  );
}

// ── Feature row helper ─────────────────────────────────────────────────────────

function FeatureRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(59,130,246,0.10)",
          border: "1px solid rgba(59,130,246,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} style={{ color: "#3B82F6" }} />
      </div>
      <div>
        <p style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{title}</p>
        <p style={{ color: "#888888", fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Blue label pill ────────────────────────────────────────────────────────────

function BluePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#3B82F6",
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.2)",
        padding: "5px 12px",
        borderRadius: 99,
        marginBottom: 20,
        textTransform: "uppercase" as const,
      }}
    >
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        background: "#000000",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ─────────────────────────────────── responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hero-nav-center { display: none !important; }
          .hero-text-block { padding: 24px 24px 16px !important; gap: 24px !important; flex-direction: column !important; }
          .hero-headline { font-size: 38px !important; }
          .hero-right-col { max-width: 100% !important; }
          .hero-mockup-block { padding: 0 12px !important; }
        }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .problem-cards { flex-direction: column !important; }
          .steps-row { flex-direction: column !important; align-items: center !important; }
          .steps-line { display: none !important; }
          .how-columns { flex-direction: column !important; }
          .coach-section { flex-direction: column-reverse !important; align-items: center !important; }
          .player-section { flex-direction: column-reverse !important; align-items: center !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 4px !important; text-align: center !important; }
          .cta-row { flex-direction: column !important; align-items: stretch !important; }
          .cta-row a { text-align: center !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(0,0,0,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 0.25s ease, backdrop-filter 0.25s ease",
          padding: "20px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
          <Image src="/icons/icon-192.png" width={52} height={52} alt="ArmTrack" style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#f5f5f5" }}>Arm</span>
            <span style={{ color: "#3B82F6" }}>Track</span>
          </span>
        </Link>
        <div className="hero-nav-center" style={{ display: "flex", alignItems: "center", gap: 24, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 20px", backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.04)" }}>
          {["Features", "For Coaches", "For Players"].map((label) => (
            <Link key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", whiteSpace: "nowrap", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{label}</Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Link href="/login" className="hide-mobile"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >Log in</Link>
          <Link href="/signup" style={{ background: "#ffffff", color: "#000000", fontSize: 13, fontWeight: 600, textDecoration: "none", padding: "8px 16px", borderRadius: 999, whiteSpace: "nowrap" }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "#000", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

        {/* Image — centered, top 52% of viewport, black space around it */}
        <div style={{ position: "relative", height: "52vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Image src="/hero-pitcher.png" width={900} height={520} priority alt="" style={{ objectFit: "contain", objectPosition: "center", height: "100%", width: "auto" }} />
          {/* Edge fades */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000 0%, transparent 15%, transparent 70%, #000 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, transparent 20%, transparent 80%, #000 100%)", pointerEvents: "none" }} />
        </div>

        {/* Text — overlaps slightly with bottom of image */}
        <div className="hero-text-block" style={{ position: "relative", zIndex: 2, marginTop: "-40px", padding: "0 64px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 80, marginBottom: 48 }}>
          <motion.div style={{ maxWidth: 480 }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="hero-headline" style={{ fontSize: 60, fontWeight: 550, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#f5f5f5", margin: 0 }}>
              Know when to throw.<br />Know when to recover.
            </h1>
          </motion.div>
          <motion.div className="hero-right-col" style={{ maxWidth: 360, paddingTop: 8, flexShrink: 0 }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={{ color: "#999", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
              ArmTrack gives players and coaches the visibility they need — arm readiness, workload, and recovery data — so every throwing decision is smarter.
            </p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", gap: 12 }}
            >
              <a href="/signup" style={{ background: "white", color: "#000", padding: "12px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", textDecoration: "none", display: "inline-block" }}>
                Get Started Free
              </a>
              <a href="#product" style={{ background: "transparent", color: "white", padding: "11px 27px", borderRadius: 999, fontSize: 15, fontWeight: 500, border: "1.5px solid rgba(255,255,255,0.3)", textDecoration: "none", display: "inline-block", backdropFilter: "blur(4px)" }}>
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* MacBook + Phone mockup — directly below text */}
        <motion.div id="product" className="hero-mockup-block"
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", padding: "0 48px" }}
        >
          {/* MacBook outer body */}
          <div style={{ background: "linear-gradient(180deg, #2d2d2d 0%, #1e1e1e 100%)", borderRadius: "16px 16px 0 0", padding: "14px 14px 0", boxShadow: "0 0 0 1px #3a3a3a, 0 -8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative" }}>
            {/* Screen bezel */}
            <div style={{ background: "#0a0a0a", borderRadius: "10px 10px 0 0", overflow: "hidden", border: "1px solid #2a2a2a", minHeight: 360 }}>
              {/* macOS chrome */}
              <div style={{ padding: "12px 16px", background: "#141414", borderBottom: "1px solid #1f1f1f", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
              </div>
              {/* Split screen */}
              <div style={{ display: "flex", minHeight: 320 }}>
                {/* Left — player */}
                <div style={{ width: "50%", padding: 24, background: "#0d0d0d" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#3B82F6", textTransform: "uppercase", marginBottom: 12 }}>For Players</p>
                  <p style={{ color: "#444444", fontSize: 13, marginBottom: 8 }}>Good morning, Jake</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 48, fontWeight: 700, color: "#22C55E", lineHeight: 1 }}>7.8</span>
                    <span style={{ fontSize: 20, color: "#333333", marginBottom: 4 }}>/10</span>
                    <span style={{ fontSize: 11, background: "#052e16", color: "#22C55E", padding: "2px 8px", borderRadius: 99, marginBottom: 6, marginLeft: 8 }}>Good to Go</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#333333", marginBottom: 12 }}>Based on your recent logs</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[["P 2","#0a1f0a","#22C55E"],["S 4","#1f1500","#F59E0B"],["St 1","#0a1f0a","#22C55E"]].map(([l,b,c]) => (
                      <span key={l} style={{ fontSize: 11, background: b, color: c, padding: "4px 8px", borderRadius: 6 }}>{l}</span>
                    ))}
                  </div>
                  <div style={{ height: 1, background: "#1a1a1a", marginBottom: 12 }} />
                  <div style={{ background: "#080808", borderLeft: "2px solid #3B82F6", paddingLeft: 12, paddingTop: 8, paddingBottom: 8, paddingRight: 12, borderRadius: "0 6px 6px 0", marginBottom: 12 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#3B82F6", textTransform: "uppercase", marginBottom: 4 }}>Today&apos;s Recommendation</p>
                    <p style={{ fontSize: 13, color: "#f5f5f5" }}>Normal session today — stay within your pitch count plan.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Flame size={13} style={{ color: "#3B82F6" }} />
                    <span style={{ fontSize: 13, color: "#555555" }}>5-day streak</span>
                  </div>
                </div>
                {/* Right — coach */}
                <div style={{ width: "50%", padding: 24, background: "#0d0d0d", borderLeft: "1px solid #1a1a1a" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#3B82F6", textTransform: "uppercase", marginBottom: 12 }}>For Coaches</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f5" }}>Team Readiness</span>
                    <span style={{ fontSize: 11, color: "#444444" }}>Today</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#444444", marginBottom: 12 }}>4 of 5 players logged</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {[
                      { name: "Jake M.", pos: "Pitcher", score: "8.4", label: "Ready", color: "#22C55E", opacity: 1 },
                      { name: "Carlos R.", pos: "Pitcher", score: "7.1", label: "Good to Go", color: "#22C55E", opacity: 1 },
                      { name: "Devon T.", pos: "Catcher", score: "5.8", label: "Caution", color: "#F59E0B", opacity: 1 },
                      { name: "Malik W.", pos: "Infielder", score: null, label: "Not logged", color: "#333333", opacity: 0.4 },
                    ].map((row) => (
                      <div key={row.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111111", borderRadius: 10, padding: "10px 12px", border: "1px solid #1a1a1a", opacity: row.opacity }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#f5f5f5" }}>{row.name}</span>
                          <span style={{ fontSize: 10, color: "#555555", background: "#1a1a1a", padding: "2px 8px", borderRadius: 99, marginLeft: 8 }}>{row.pos}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {row.score && <span style={{ fontSize: 13, fontWeight: 700, color: row.color, marginRight: 4 }}>{row.score}</span>}
                          <span style={{ fontSize: 11, color: row.color }}>{row.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: "100%", background: "#3B82F6", color: "#ffffff", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 10, padding: "8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Bell size={14} />Notify Team
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* MacBook base/chin */}
          <div style={{ height: 24, background: "linear-gradient(180deg, #262626 0%, #1a1a1a 100%)", borderRadius: "0 0 6px 6px", boxShadow: "0 1px 0 #111, 0 4px 20px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 56, height: 3, background: "#333", borderRadius: 2 }} />
          </div>

          {/* Phone mockup — overlapping MacBook bottom-left */}
          <div style={{ position: "absolute", bottom: 24, left: 56, zIndex: 10, width: 152, borderRadius: 32, background: "#1c1c1e", border: "1.5px solid #3a3a3a", boxShadow: "0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)", overflow: "hidden" }}>
            {/* Dynamic island */}
            <div style={{ height: 36, background: "#0a0a0a", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
              <div style={{ width: 72, height: 20, background: "#1c1c1e", borderRadius: 999 }} />
            </div>
            {/* Status bar */}
            <div style={{ padding: "4px 16px 8px", background: "#0d0d0d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#f5f5f5", fontWeight: 600 }}>9:41</span>
              <span style={{ fontSize: 11, color: "#f5f5f5" }}>▮▮▮</span>
            </div>
            {/* Screen content */}
            <div style={{ padding: 12, background: "#0a0a0a" }}>
              <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 700, marginBottom: 8 }}>ArmTrack</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#22C55E", lineHeight: 1 }}>7.8 <span style={{ fontSize: 14, color: "#333" }}>/10</span></div>
              <div style={{ display: "inline-block", background: "#052e16", color: "#22C55E", fontSize: 10, padding: "2px 8px", borderRadius: 999, marginTop: 6, marginBottom: 12 }}>Good to Go</div>
              <div style={{ background: "#3B82F6", color: "white", fontSize: 11, fontWeight: 600, padding: 8, borderRadius: 8, textAlign: "center" }}>Log Today</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ────────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "100px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                padding: "5px 12px",
                borderRadius: 99,
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              The Problem
            </span>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                color: "#ffffff",
                margin: 0,
                marginBottom: 48,
              }}
            >
              Coaches are making throwing decisions blind.
            </h2>
          </ScrollFade>

          <div className="problem-cards" style={{ display: "flex", gap: 20, marginBottom: 48 }}>
            {[
              { icon: AlertTriangle, text: "Players say 'I\u2019m fine' even when they're not" },
              { icon: TrendingDown, text: "One fatigued arm away from a season-ending injury" },
              { icon: EyeOff, text: "No visibility into how your roster actually feels" },
            ].map(({ icon: Icon, text }, i) => (
              <ScrollFade key={text} delay={i * 0.1} className="flex-1">
                <div
                  style={{
                    background: "#111111",
                    border: "1px solid #222222",
                    borderLeft: "3px solid #EF4444",
                    borderRadius: 16,
                    padding: "24px 20px",
                    textAlign: "left",
                    height: "100%",
                  }}
                >
                  <Icon size={22} style={{ color: "#EF4444", marginBottom: 12 }} />
                  <p
                    style={{
                      color: "#ffffff",
                      fontSize: 15,
                      lineHeight: 1.5,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade>
            <p style={{ color: "#888888", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
              ArmTrack changes that. 60 seconds of daily logging gives coaches and players the data
              to make smarter decisions — before injuries happen.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── HOW FAST ───────────────────────────────────────────────────────── */}
      <section style={{ background: "#0a0a0a", padding: "100px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <BluePill>Designed for Athletes</BluePill>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                color: "#ffffff",
                margin: 0,
                marginBottom: 60,
              }}
            >
              Log your arm in 60 seconds. Seriously.
            </h2>
          </ScrollFade>

          <div
            className="steps-row"
            style={{
              display: "flex",
              alignItems: "flex-start",
              position: "relative",
              marginBottom: 32,
            }}
          >
            {/* Dashed connector */}
            <div
              className="steps-line"
              style={{
                position: "absolute",
                top: 24,
                left: "calc(16.67% + 24px)",
                right: "calc(16.67% + 24px)",
                height: 1,
                borderTop: "2px dashed rgba(59,130,246,0.25)",
                zIndex: 0,
              }}
            />
            {[
              {
                num: "01",
                icon: Smartphone,
                title: "Open ArmTrack",
                desc: "From your home screen. No login required after setup.",
              },
              {
                num: "02",
                icon: Sliders,
                title: "Rate your arm",
                desc: "Three sliders. Throws count. Activity type. Done.",
              },
              {
                num: "03",
                icon: Shield,
                title: "Get your call",
                desc: "Your readiness score and today's recommendation. Instantly.",
              },
            ].map(({ num, icon: Icon, title, desc }, i) => (
              <ScrollFade key={num} delay={i * 0.12} className="flex-1">
                <div
                  style={{ textAlign: "center", padding: "0 16px", position: "relative", zIndex: 1 }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 99,
                      background: "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 800 }}>{num}</span>
                  </div>
                  <Icon size={22} style={{ color: "#3B82F6", marginBottom: 10 }} />
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                    {title}
                  </p>
                  <p style={{ color: "#888888", fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade>
            <p style={{ color: "#555555", fontSize: 13, fontStyle: "italic" }}>
              Most players log in under 45 seconds.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "80px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            className="stats-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
          >
            {[
              { stat: "1 in 4", label: "pitchers suffer a career arm injury" },
              { stat: "36x", label: "higher risk when throwing fatigued" },
              { stat: "38.8%", label: "of MLB pitchers have had Tommy John" },
              { stat: "60 sec", label: "average time to log with ArmTrack" },
            ].map(({ stat, label }, i) => (
              <ScrollFade key={stat} delay={i * 0.1}>
                <div
                  style={{
                    background: "#111111",
                    border: "1px solid #222222",
                    borderRadius: 16,
                    padding: "28px 20px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#3B82F6",
                      letterSpacing: "-0.02em",
                      marginBottom: 6,
                    }}
                  >
                    {stat}
                  </p>
                  <p style={{ color: "#888888", fontSize: 13, lineHeight: 1.4 }}>{label}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{ background: "#0a0a0a", padding: "100px 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <ScrollFade>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  color: "#ffffff",
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                Built for the whole program
              </h2>
              <p style={{ color: "#888888", fontSize: 16, margin: 0 }}>
                Coaches get visibility. Players get accountability. Everyone gets healthier arms.
              </p>
            </div>
          </ScrollFade>

          <div className="how-columns" style={{ display: "flex", gap: 24 }}>
            <ScrollFade delay={0} className="flex-1">
              <div
                style={{
                  background: "#111111",
                  border: "1px solid #222222",
                  borderLeft: "3px solid #3B82F6",
                  borderRadius: 20,
                  padding: "32px 28px",
                  height: "100%",
                }}
              >
                <p style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, marginBottom: 28 }}>
                  For Coaches
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <FeatureRow
                    icon={ClipboardList}
                    title="Create your team"
                    desc="Set up in 60 seconds. Invite your roster with one link."
                  />
                  <FeatureRow
                    icon={BarChart2}
                    title="See your roster's readiness"
                    desc="Every player's arm health score, color coded, before practice."
                  />
                  <FeatureRow
                    icon={MessageSquare}
                    title="Send recommendations"
                    desc="Tell players to push or rest — right on their dashboard."
                  />
                </div>
              </div>
            </ScrollFade>

            <ScrollFade delay={0.1} className="flex-1">
              <div
                style={{
                  background: "#111111",
                  border: "1px solid #222222",
                  borderLeft: "3px solid #3B82F6",
                  borderRadius: 20,
                  padding: "32px 28px",
                  height: "100%",
                }}
              >
                <p style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, marginBottom: 28 }}>
                  For Players
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <FeatureRow
                    icon={Activity}
                    title="Log in 60 seconds"
                    desc="Pain, soreness, stiffness, throws. Fast and effortless."
                  />
                  <FeatureRow
                    icon={Shield}
                    title="Get your recommendation"
                    desc="ArmTrack estimates your readiness based on your recent trend."
                  />
                  <FeatureRow
                    icon={TrendingUp}
                    title="Track your arm over time"
                    desc="14-day trend chart. Spot patterns before they become injuries."
                  />
                </div>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* ── COACH FEATURE ──────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "100px 20px" }}>
        <div
          className="coach-section"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 60,
          }}
        >
          <div style={{ flex: 1 }}>
            <ScrollFade>
              <BluePill>Coach Dashboard</BluePill>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  color: "#ffffff",
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                Your entire roster. One screen.
              </h2>
              <p
                style={{ color: "#888888", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}
              >
                See which players are ready to throw, which need a light day, and who hasn&apos;t
                logged yet — before practice starts.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Readiness scores for every player, updated daily",
                  "Subsections by position — pitchers, catchers, position players",
                  "Recommendations and team messages in one tap",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <CheckCircle
                      size={16}
                      style={{ color: "#3B82F6", flexShrink: 0, marginTop: 2 }}
                    />
                    <span style={{ color: "#cccccc", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#3B82F6",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "13px 22px",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                Start as a Coach →
              </Link>
            </ScrollFade>
          </div>

          <ScrollFade delay={0.1} className="flex-shrink-0">
            <IPhoneFrame>
              <CoachScreen />
            </IPhoneFrame>
          </ScrollFade>
        </div>
      </section>

      {/* ── PLAYER FEATURE ─────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "100px 20px" }}>
        <div
          className="player-section"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 60,
          }}
        >
          <ScrollFade delay={0.1} className="flex-shrink-0">
            <IPhoneFrame>
              <PlayerScreen />
            </IPhoneFrame>
          </ScrollFade>

          <div style={{ flex: 1 }}>
            <ScrollFade>
              <BluePill>For Players</BluePill>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  color: "#ffffff",
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                Know when to push. Know when to rest.
              </h2>
              <p
                style={{ color: "#888888", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}
              >
                Log your arm daily and get a personalized recommendation based on your pain,
                soreness, stiffness, and recent throwing load.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Weighted readiness score — pain counts more than stiffness",
                  "Position-aware recommendations for your role",
                  "14-day trend chart to catch patterns early",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <CheckCircle
                      size={16}
                      style={{ color: "#3B82F6", flexShrink: 0, marginTop: 2 }}
                    />
                    <span style={{ color: "#cccccc", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#3B82F6",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "13px 22px",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                Start Tracking Free →
              </Link>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "80px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#3B82F6",
                opacity: 0.3,
                lineHeight: 1,
                marginBottom: 8,
                fontFamily: "Georgia, serif",
              }}
            >
              &ldquo;
            </div>
            <p
              style={{
                fontSize: 22,
                color: "#ffffff",
                fontStyle: "italic",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Finally know which arms are ready before practice. This changes how I make throwing
              decisions every single day.
            </p>
            <p style={{ color: "#888888", fontSize: 14 }}>
              — High school pitching coach, Illinois
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#0a0a0a", padding: "100px 20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#ffffff",
                margin: 0,
                marginBottom: 16,
              }}
            >
              Protect your program. Start today.
            </h2>
            <p style={{ color: "#888888", fontSize: 16, lineHeight: 1.6, marginBottom: 36 }}>
              Free for every player. Built for coaches who care about keeping their roster healthy.
            </p>
            <div
              className="cta-row"
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <Link
                href="/signup"
                style={{
                  background: "#3B82F6",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "14px 24px",
                  borderRadius: 14,
                  boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                Get Started as a Coach
              </Link>
              <Link
                href="/signup"
                style={{
                  background: "#111111",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "14px 24px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up as a Player
              </Link>
            </div>
            <p style={{ color: "#555555", fontSize: 13 }}>
              No app download required. Works on any device.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        style={{ background: "#000000", borderTop: "1px solid #111111", padding: "24px 20px" }}
      >
        <div
          className="footer-inner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#444444", fontSize: 13 }}>ArmTrack &copy; 2026</span>
          <span style={{ color: "#444444", fontSize: 13 }}>Built for baseball &amp; softball</span>
        </div>
      </footer>
    </div>
  );
}
