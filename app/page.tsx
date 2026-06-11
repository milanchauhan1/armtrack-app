"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  EyeOff,
  Smartphone,
  Sliders,
  CheckCircle,
  Flame,
  Heart,
  RotateCcw,
  Gauge,
  Quote,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── Structured data (JSON-LD) — rich results + AI search ───────────────────────

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://armtrack.app/#organization",
      name: "ArmTrack",
      url: "https://armtrack.app",
      logo: "https://armtrack.app/icons/icon-512.png",
      founder: { "@type": "Person", name: "Milan" },
    },
    {
      "@type": "WebSite",
      "@id": "https://armtrack.app/#website",
      url: "https://armtrack.app",
      name: "ArmTrack",
      publisher: { "@id": "https://armtrack.app/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "ArmTrack",
      applicationCategory: "HealthApplication",
      operatingSystem: "iOS, Web",
      description:
        "Arm-health app for baseball and softball. Players log pain, soreness, stiffness, and throwing workload in about 60 seconds a day to get a readiness score and throwing recommendation. Coaches see their whole roster's readiness on one screen.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": "https://armtrack.app/#organization" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ArmTrack?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ArmTrack is an arm-health app for baseball and softball. Players log pain, soreness, stiffness, and throwing volume in about 60 seconds a day and get a readiness score and a throwing recommendation. Coaches see their whole roster's readiness on one screen before practice.",
          },
        },
        {
          "@type": "Question",
          name: "How long does a daily check-in take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most players finish a daily check-in in under 60 seconds — three sliders, a throw count, and an activity type.",
          },
        },
        {
          "@type": "Question",
          name: "Is ArmTrack free?",
          acceptedAnswer: { "@type": "Answer", text: "ArmTrack is free for players." },
        },
        {
          "@type": "Question",
          name: "Does ArmTrack prevent injuries?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. ArmTrack surfaces trends in pain, soreness, recovery, and throwing workload to help players and coaches make informed throwing decisions. It does not diagnose, treat, or prevent injuries, and it is not a substitute for a coach, athletic trainer, or doctor.",
          },
        },
        {
          "@type": "Question",
          name: "Who is ArmTrack for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Travel and high school baseball and softball coaches, baseball parents, and pitchers and position players ages 12–18.",
          },
        },
      ],
    },
  ],
};

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

// ── Phone status bar (shared) ──────────────────────────────────────────────────

function StatusBar() {
  return (
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
        </div>
      </div>
    </div>
  );
}

// ── CSS iPhone frame (compact) ─────────────────────────────────────────────────

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
        <StatusBar />
        {children}
      </div>
    </div>
  );
}

// ── Premium phone — glassy frame with blue bloom, for product showcase ──────────

function PremiumPhone({
  children,
  image,
  imageAlt,
  glow = true,
  style,
}: {
  children?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.40) 0%, rgba(59,130,246,0.20) 26%, rgba(59,130,246,0.07) 50%, transparent 72%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: 268,
          borderRadius: 52,
          background: "linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 60%, #141414 100%)",
          padding: 10,
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.12), 0 40px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ borderRadius: 44, overflow: "hidden", background: "#000", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 88,
              height: 26,
              background: "#000",
              borderRadius: 999,
              zIndex: 10,
            }}
          />
          {image ? (
            <Image
              src={image}
              width={268}
              height={580}
              alt={imageAlt || ""}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          ) : (
            <>
              <StatusBar />
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Daily check-in mockup (mirrors the real /log screen) ───────────────────────

const CHECKIN_SLIDERS: { label: string; value: number; color: string; caption: string }[] = [
  { label: "Pain", value: 2, color: "#22c55e", caption: "Feeling great" },
  { label: "Soreness", value: 4, color: "#f59e0b", caption: "Mild discomfort" },
  { label: "Stiffness", value: 1, color: "#22c55e", caption: "Feeling great" },
];

function CheckInScreen() {
  return (
    <div style={{ padding: "0 14px 18px" }}>
      <p style={{ color: "#ffffff", fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Daily Check-In</p>
      <p style={{ color: "#555555", fontSize: 9, marginBottom: 14 }}>Takes about 45 seconds</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
        {CHECKIN_SLIDERS.map(({ label, value, color, caption }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#cccccc", fontSize: 10, fontWeight: 600 }}>{label}</span>
              <span style={{ color, fontSize: 10, fontWeight: 700 }}>{caption}</span>
            </div>
            <div style={{ position: "relative", height: 5, borderRadius: 99, background: "#1e1e1e" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${value * 10}%`,
                  borderRadius: 99,
                  background: color,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `calc(${value * 10}% - 7px)`,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  borderRadius: 99,
                  background: "#fff",
                  border: `2px solid ${color}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "#888888", fontSize: 9, fontWeight: 600, marginBottom: 6 }}>How many throws today?</p>
      <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
        {[0, 25, 50, 75, 100].map((n) => {
          const active = n === 50;
          return (
            <span
              key={n}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "6px 0",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 700,
                background: active ? "#3B82F6" : "#181818",
                border: active ? "1px solid #3B82F6" : "1px solid #262626",
                color: active ? "#fff" : "#6b7280",
              }}
            >
              {n}
            </span>
          );
        })}
      </div>

      <div
        style={{
          width: "100%",
          padding: "10px 0",
          textAlign: "center",
          background: "#3B82F6",
          borderRadius: 10,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
        }}
      >
        Get my readiness
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
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.08, ease }}
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
      <div
        style={{
          marginTop: 12,
          width: "100%",
          padding: "8px 0",
          textAlign: "center",
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.35)",
          borderRadius: 10,
          color: "#60a5fa",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        Notify Team
      </div>
    </div>
  );
}

// ── Mini trend sparkline (decorative) ──────────────────────────────────────────

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 200;
  const h = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const id = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="48" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.length > 0 && (
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="3" fill={color} />
      )}
    </svg>
  );
}

// ── Blue label pill ────────────────────────────────────────────────────────────

function BluePill({ children, color = "#3B82F6" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color,
        background: `${color}14`,
        border: `1px solid ${color}33`,
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
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [unveiled, setUnveiled] = useState(false);
  const [nativeRedirecting, setNativeRedirecting] = useState(false);

  // The marketing landing page is for the website only. Native app users have
  // already installed — send them straight to login (or dashboard if signed in).
  // Authenticated web users also skip the landing page.
  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    if (native) setNativeRedirecting(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
      else if (native) router.replace("/login");
    });
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setUnveiled(true), 80);
    return () => clearTimeout(t);
  }, []);

  // On native, render nothing (matches the black splash) while redirecting,
  // so the marketing page never flashes inside the app.
  if (nativeRedirecting) {
    return <div style={{ minHeight: "100vh", background: "#000000" }} />;
  }

  return (
    <div
      style={{
        background: "#000000",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Structured data for rich results + AI search */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ── Loading veil — fades out on mount ──────────────────────────────── */}
      <AnimatePresence>
        {!unveiled && (
          <motion.div
            key="veil"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", inset: 0, background: "#000", zIndex: 200, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────── responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hero-nav-center { display: none !important; }
          .hero-brand-text { display: none !important; }
          .hero-nav-login { display: none !important; }
          .hero-logo-img { width: 40px !important; height: 40px !important; border-radius: 11px !important; }
          .hero-logo-word { display: inline-block !important; }
          .hero-headline { font-size: 44px !important; margin-bottom: 14px !important; }
          .hero-nav-btn { padding: 6px 14px !important; font-size: 12px !important; }
          .hero-section { position: relative !important; min-height: 700px !important; padding-top: 96px !important; }
          .hero-image-block { display: none !important; }
          .hero-text-block { margin-top: 0 !important; padding: 72px 24px 0 !important; text-align: left !important; position: static !important; max-width: 60% !important; }
          .hero-text-block > div { max-width: 100% !important; }
          .hero-headline { position: relative !important; z-index: 2 !important; }
          .hero-sub { font-size: 13px !important; max-width: 100% !important; }
          .hero-phone-float {
            position: absolute !important;
            right: 8px !important;
            left: auto !important;
            top: 156px !important;
            transform: none !important;
            margin: 0 !important;
            display: block !important;
            z-index: 1 !important;
            perspective: 1500px !important;
          }
          .hero-phone-float > div:first-child { width: 420px !important; height: 420px !important; }
          .hero-phone-frame {
            width: 180px !important;
            border-radius: 40px !important;
            transform: rotateY(-14deg) rotateX(4deg) rotate(2deg) !important;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.12), -20px 36px 56px rgba(0,0,0,0.82), inset 0 1px 0 rgba(255,255,255,0.08) !important;
          }
          .hero-phone-float .hero-phone-frame > div { border-radius: 32px !important; }
          .hero-cta-row {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 40px !important;
            z-index: 5 !important;
            padding: 0 24px !important;
          }
          .showcase-row { flex-direction: column !important; gap: 48px !important; }
          .coach-value-row { flex-direction: column-reverse !important; align-items: center !important; gap: 40px !important; }
          .founder-card { padding: 32px 24px !important; }
          .founder-quote { font-size: 19px !important; }
        }
        @media (max-width: 640px) {
          .hero-headline { font-size: 39px !important; line-height: 1.3 !important; letter-spacing: -0.02em !important; }
          .hero-sub { font-size: 12.5px !important; }
          .hero-cta-row { flex-direction: row !important; justify-content: center !important; align-items: center !important; gap: 10px !important; }
          .hero-cta-row a { text-align: center !important; }
          .problem-cards { flex-direction: column !important; }
          .steps-row { flex-direction: column !important; align-items: center !important; }
          .steps-line { display: none !important; }
          .reality-strip { gap: 0 !important; }
          .reality-stat { padding: 14px 8px !important; }
          .reality-stat .reality-num { font-size: 26px !important; }
          .footer-inner { flex-direction: column !important; gap: 4px !important; text-align: center !important; }
          .cta-row { flex-direction: column !important; align-items: stretch !important; }
          .cta-row a { text-align: center !important; }
          .testi-quote { font-size: 22px !important; }
        }
      `}</style>

      {/* ── ANNOUNCEMENT BANNER ─────────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 51, background: "#3B82F6", textAlign: "center", padding: "7px 16px", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "#ffffff" }}>
        Coming to the App Store Soon
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 34,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(0,0,0,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 0.25s ease, backdrop-filter 0.25s ease",
          padding: "6px 48px 6px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <Image src="/icons/icon-192.png" width={130} height={130} alt="ArmTrack" className="hero-logo-img" style={{ borderRadius: 24 }} />
          <span className="hero-logo-word" style={{ display: "none", fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#f5f5f5" }}>Arm</span>
            <span style={{ color: "#3B82F6" }}>Track</span>
          </span>
        </Link>
        <Link href="/" className="hero-brand-text" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none" }}>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#f5f5f5" }}>Arm</span>
            <span style={{ color: "#3B82F6" }}>Track</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Link href="/login"
            className="hero-nav-btn hero-nav-login"
            style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textDecoration: "none", padding: "8px 16px", borderRadius: 999, background: "#111111", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}
          >Log in</Link>
          <Link href="/signup"
            className="hero-nav-btn hero-nav-signup"
            style={{ background: "#3B82F6", color: "#ffffff", fontSize: 13, fontWeight: 600, textDecoration: "none", padding: "8px 16px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ background: "#000", minHeight: "90vh", position: "relative" }}>

        {/* Blue rim glow around pitcher image edges — very subtle */}
        <div style={{ position: "absolute", top: "4vh", left: "50%", transform: "translateX(-50%)", width: 700, height: 56, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.09) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "52vh", left: "50%", transform: "translateX(-50%)", width: 700, height: 56, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.09) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Pitcher image — fades + scales in */}
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease }}
          className="hero-image-block"
          style={{ position: "relative", height: "52vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 72, zIndex: 1 }}
        >
          <Image src="/hero-pitcher.png" width={900} height={520} priority alt="" style={{ objectFit: "contain", objectPosition: "center 30%", height: "100%", width: "auto" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000 0%, transparent 22%, transparent 65%, #000 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, transparent 18%, transparent 60%, rgba(0,0,0,0.4) 80%, #000 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 70%, #000 100%)", pointerEvents: "none" }} />
        </motion.div>

        {/* Text block */}
        <div className="hero-text-block" style={{ position: "relative", zIndex: 2, marginTop: "-85px", padding: "0 64px 60px 4%" }}>
          <div style={{ maxWidth: 540 }}>

            <motion.h1
              className="hero-headline"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.55, ease }}
              style={{ fontSize: 60, fontWeight: 350, letterSpacing: "-0.03em", lineHeight: 1.08, color: "#f5f5f5", margin: "0 0 18px" }}
            >
              Make smarter throwing decisions.
            </motion.h1>

            {/* "Why" subcopy — delivers the core message */}
            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease }}
              style={{ fontSize: 17, lineHeight: 1.6, color: "#a1a1aa", margin: "0 0 26px", maxWidth: 440, fontWeight: 400 }}
            >
              Small arm issues become big problems when nobody&apos;s tracking them. ArmTrack turns
              60 seconds a day into a readiness score you can actually act on.
            </motion.p>

            <motion.div
              className="hero-cta-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05, ease }}
              style={{ display: "flex", gap: 12 }}
            >
              <a href="/signup" style={{ background: "#3B82F6", color: "#ffffff", padding: "12px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", textDecoration: "none", display: "inline-block", whiteSpace: "nowrap", boxShadow: "0 0 24px rgba(59,130,246,0.5)" }}>
                Get Started Free
              </a>
              <a href="/login" style={{ background: "transparent", color: "white", padding: "11px 27px", borderRadius: 999, fontSize: 15, fontWeight: 500, border: "1.5px solid rgba(255,255,255,0.3)", textDecoration: "none", display: "inline-block", backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
                Log in
              </a>
            </motion.div>
          </div>
        </div>

        {/* iPhone — springs in from right */}
        <motion.div
          className="hero-phone-float"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.7 }}
          style={{ position: "absolute", right: 120, top: "37%", transform: "translateY(-50%)", zIndex: 3 }}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.38) 20%, rgba(59,130,246,0.18) 38%, rgba(59,130,246,0.07) 54%, rgba(59,130,246,0.02) 68%, transparent 82%)", pointerEvents: "none", zIndex: -1 }} />
          <div className="hero-phone-frame" style={{
            width: 280,
            borderRadius: 52,
            background: "linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 60%, #141414 100%)",
            padding: 10,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.12), -30px 50px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
            position: "relative",
            transform: "perspective(1600px) rotateY(-18deg) rotateX(5deg) rotate(2deg)",
          }}>
            <div style={{ position: "absolute", left: -3, top: 72, width: 3, height: 28, background: "#222", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 108, width: 3, height: 32, background: "#222", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 152, width: 3, height: 32, background: "#222", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", right: -3, top: 130, width: 3, height: 64, background: "#222", borderRadius: "0 2px 2px 0" }} />
            <div style={{ borderRadius: 44, overflow: "hidden", background: "#000", position: "relative" }}>
              <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 88, height: 28, background: "#000", borderRadius: 999, zIndex: 10 }} />
              <Image src="/dashboard-preview.png" width={260} height={562} alt="ArmTrack player dashboard" priority style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── REALITY STRIP — honest, citable stakes (above-the-fold social proof) ── */}
      <section style={{ background: "#0a0a0a", borderTop: "1px solid #141414", borderBottom: "1px solid #141414", padding: "44px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <ScrollFade>
            <p style={{ textAlign: "center", color: "#71717a", fontSize: 13, letterSpacing: "0.04em", margin: "0 0 26px" }}>
              The arm rarely fails overnight. It fails quietly — one ignored day at a time.
            </p>
          </ScrollFade>
          <div
            className="reality-strip"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "center" }}
          >
            {[
              { num: "1 in 4", label: "youth pitchers report arm pain serious enough to stop throwing" },
              { num: "36×", label: "higher injury risk when pitchers throw with fatigue" },
              { num: "38.8%", label: "of MLB pitchers have undergone Tommy John surgery" },
            ].map(({ num, label }, i) => (
              <ScrollFade key={num} delay={i * 0.08}>
                <div
                  className="reality-stat"
                  style={{
                    textAlign: "center",
                    padding: "8px 24px",
                    borderLeft: i === 0 ? "none" : "1px solid #1f1f1f",
                  }}
                >
                  <p className="reality-num" style={{ fontSize: 34, fontWeight: 900, color: "#f5f5f5", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                    {num}
                  </p>
                  <p style={{ color: "#71717a", fontSize: 12.5, lineHeight: 1.45, margin: 0, maxWidth: 230, marginInline: "auto" }}>
                    {label}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM — the core message ─────────────────────────────────── */}
      <section id="why" style={{ background: "#0a0a0a", padding: "110px 20px" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <BluePill color="#EF4444">The Problem</BluePill>
            <h2
              style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#ffffff",
                margin: 0,
                marginBottom: 52,
              }}
            >
              Small arm issues become major problems when nobody&apos;s tracking them.
            </h2>
          </ScrollFade>

          <div className="problem-cards" style={{ display: "flex", gap: 20, marginBottom: 44 }}>
            {[
              { icon: AlertTriangle, text: "Players say ‘I’m fine’ — even when they’re not" },
              { icon: TrendingDown, text: "One fatigued outing away from a season-ending injury" },
              { icon: EyeOff, text: "No visibility into how an arm actually feels day to day" },
            ].map(({ icon: Icon, text }, i) => (
              <ScrollFade key={text} delay={i * 0.1} className="flex-1">
                <div
                  style={{
                    background: "#111111",
                    border: "1px solid #222222",
                    borderLeft: "3px solid #EF4444",
                    borderRadius: 16,
                    padding: "26px 22px",
                    textAlign: "left",
                    height: "100%",
                  }}
                >
                  <Icon size={22} style={{ color: "#EF4444", marginBottom: 14 }} />
                  <p style={{ color: "#ffffff", fontSize: 15, lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                    {text}
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade>
            <p style={{ color: "#a1a1aa", fontSize: 17, lineHeight: 1.7, margin: "0 auto", maxWidth: 620 }}>
              ArmTrack makes the invisible visible. Sixty seconds of daily logging turns scattered
              aches into a clear pattern — on a screen, before it shows up in an injury.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE — bigger visuals (player side) ─────────────────── */}
      <section style={{ background: "#000000", padding: "120px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <ScrollFade>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <BluePill>The Product</BluePill>
            </div>
            <h2
              style={{
                textAlign: "center",
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#ffffff",
                margin: "0 auto 14px",
                maxWidth: 600,
              }}
            >
              Your arm, in focus — before you throw.
            </h2>
            <p style={{ textAlign: "center", color: "#a1a1aa", fontSize: 17, lineHeight: 1.6, margin: "0 auto 72px", maxWidth: 520 }}>
              Two taps in the morning. A clear answer the moment you finish.
            </p>
          </ScrollFade>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScrollFade>
              <div style={{ textAlign: "center" }}>
                <PremiumPhone image="/dashboard-preview.png" imageAlt="ArmTrack athlete dashboard" />
                <p style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: "34px 0 6px" }}>
                  Readiness dashboard
                </p>
                <p style={{ color: "#71717a", fontSize: 14, lineHeight: 1.5, maxWidth: 340, margin: "0 auto" }}>
                  Log pain, soreness, and throws — and get your score and today&apos;s recommendation
                  the moment you finish.
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* ── MORE THAN A DAILY CHECK-IN — trust / depth ─────────────────────── */}
      <section style={{ background: "#0a0a0a", padding: "110px 20px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <ScrollFade>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <BluePill>Under the Score</BluePill>
            </div>
            <h2
              style={{
                textAlign: "center",
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#ffffff",
                margin: "0 auto 14px",
                maxWidth: 560,
              }}
            >
              More than a daily check-in.
            </h2>
            <p style={{ textAlign: "center", color: "#a1a1aa", fontSize: 17, lineHeight: 1.6, margin: "0 auto 64px", maxWidth: 560 }}>
              Every log feeds four signals ArmTrack watches over time — so one rough day reads
              very differently than a rough week.
            </p>
          </ScrollFade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: Flame, color: "#EF4444", title: "Pain trends", desc: "Whether discomfort is fading or quietly climbing.", spark: [3, 4, 3, 5, 4, 6, 5] },
              { icon: Heart, color: "#F59E0B", title: "Soreness trends", desc: "How your arm responds to back-to-back workloads.", spark: [5, 4, 6, 5, 7, 6, 4] },
              { icon: RotateCcw, color: "#22C55E", title: "Recovery patterns", desc: "How quickly you bounce back between outings.", spark: [2, 5, 3, 6, 4, 7, 8] },
              { icon: Gauge, color: "#3B82F6", title: "Throwing workload", desc: "Throw counts and intensity, day over day.", spark: [4, 6, 5, 8, 6, 9, 7] },
            ].map(({ icon: Icon, color, title, desc, spark }, i) => (
              <ScrollFade key={title} delay={i * 0.08}>
                <div
                  style={{
                    background: "#0e0e0e",
                    border: "1px solid #1f1f1f",
                    borderRadius: 20,
                    padding: "26px 22px 18px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: `${color}14`,
                      border: `1px solid ${color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{title}</p>
                  <p style={{ color: "#71717a", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px", flex: 1 }}>{desc}</p>
                  <Sparkline points={spark} color={color} />
                </div>
              </ScrollFade>
            ))}
          </div>

          <ScrollFade>
            <p style={{ textAlign: "center", color: "#52525b", fontSize: 12.5, lineHeight: 1.6, margin: "40px auto 0", maxWidth: 560 }}>
              ArmTrack surfaces trends to help you make informed decisions. It doesn&apos;t diagnose
              injuries or replace a coach, athletic trainer, or doctor.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ── COACH VALUE ────────────────────────────────────────────────────── */}
      <section style={{ background: "#000000", padding: "120px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <BluePill>For Coaches</BluePill>
            <h2
              style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#ffffff",
                margin: "0 0 18px",
              }}
            >
              Know who&apos;s ready before practice starts.
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: 17, lineHeight: 1.6, margin: "0 auto 34px", maxWidth: 560 }}>
              Open one screen and see your whole roster at a glance — who&apos;s good to throw,
              who needs a light day, and who hasn&apos;t checked in yet.
            </p>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 38,
                textAlign: "left",
              }}
            >
              {[
                "Caution flags surface low-readiness arms automatically",
                "Readiness trends across your whole week",
                "Daily roster visibility — see who logged and who didn’t",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <CheckCircle size={17} style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: "#d4d4d8", fontSize: 15, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
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
                  padding: "14px 24px",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                Start as a Coach →
              </Link>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── HOW FAST — 60-second logging (a proven strength) ───────────────── */}
      <section style={{ background: "#0a0a0a", padding: "110px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <BluePill>Designed for Athletes</BluePill>
            <h2
              style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#ffffff",
                margin: "0 0 64px",
              }}
            >
              Log your arm in 60 seconds. Seriously.
            </h2>
          </ScrollFade>

          <div className="steps-row" style={{ display: "flex", alignItems: "flex-start", position: "relative", marginBottom: 32 }}>
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
              { num: "01", icon: Smartphone, title: "Open ArmTrack", desc: "From your home screen. No login required after setup." },
              { num: "02", icon: Sliders, title: "Rate your arm", desc: "Three sliders. Throws count. Activity type. Done." },
              { num: "03", icon: Shield, title: "Get your call", desc: "Your readiness score and today’s recommendation. Instantly." },
            ].map(({ num, icon: Icon, title, desc }, i) => (
              <ScrollFade key={num} delay={i * 0.12} className="flex-1">
                <div style={{ textAlign: "center", padding: "0 16px", position: "relative", zIndex: 1 }}>
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
                  <Icon size={22} style={{ color: "#3B82F6", display: "block", margin: "0 auto 10px" }} />
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</p>
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

      {/* ── WHY ARMTRACK EXISTS — founder story (Milan) ─────────────────────── */}
      <section style={{ background: "#000000", padding: "110px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <ScrollFade>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <BluePill>Why ArmTrack Exists</BluePill>
            </div>
          </ScrollFade>
          <ScrollFade delay={0.05}>
            <div
              className="founder-card"
              style={{
                position: "relative",
                background: "linear-gradient(160deg, #0e0e0e 0%, #0a0a0a 100%)",
                border: "1px solid #1f1f1f",
                borderRadius: 28,
                padding: "48px 52px",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

              <Quote size={28} style={{ color: "#3B82F6", marginBottom: 22, opacity: 0.9 }} />

              <p className="founder-quote" style={{ fontSize: 23, lineHeight: 1.55, color: "#f5f5f5", fontWeight: 400, margin: "0 0 20px", letterSpacing: "-0.01em" }}>
                I&apos;ve played baseball most of my life. As I started throwing harder, elbow pain
                just became part of the routine — ibuprofen before practice, telling myself I was
                fine. I never tracked my throwing volume, my soreness, or how I was recovering.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#a1a1aa", margin: "0 0 16px" }}>
                Eventually it caught up with me. I still deal with elbow pain that affects how I
                throw, and I think about how different it might be if I&apos;d paid attention sooner.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "#e5e5e5", fontWeight: 500, margin: "0 0 32px" }}>
                I built ArmTrack so the next player doesn&apos;t have to learn this the hard way.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    background: "linear-gradient(145deg, #3B82F6, #1d4ed8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
                  }}
                >
                  M
                </div>
                <div>
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, margin: 0 }}>Milan</p>
                  <p style={{ color: "#71717a", fontSize: 13, margin: 0 }}>Founder, ArmTrack</p>
                </div>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#0a0a0a", padding: "120px 20px" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
          <ScrollFade>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#ffffff",
                margin: "0 0 16px",
              }}
            >
              Start paying attention early.
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: 17, lineHeight: 1.6, marginBottom: 38 }}>
              Free for players and coaches. Built for the people who&apos;d rather catch it now
              than wonder later.
            </p>
            <div className="cta-row" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <Link
                href="/signup"
                style={{
                  background: "#3B82F6",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "15px 26px",
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
                  padding: "15px 26px",
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
      <footer style={{ background: "#000000", borderTop: "1px solid #111111", padding: "24px 20px" }}>
        <div
          className="footer-inner"
          style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span style={{ color: "#444444", fontSize: 13 }}>ArmTrack &copy; 2026</span>
          <Link href="/blog" style={{ color: "#888888", fontSize: 13, textDecoration: "none" }}>
            Guides
          </Link>
          <span style={{ color: "#444444", fontSize: 13 }}>Built for baseball &amp; softball</span>
        </div>
      </footer>
    </div>
  );
}
