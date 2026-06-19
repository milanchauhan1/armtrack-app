"use client";

import { Smartphone, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { ScrollFade, Eyebrow, T } from "./primitives";

const STEPS = [
  { num: "01", icon: Smartphone, title: "Open ArmTrack", desc: "From your home screen. No login required after setup." },
  { num: "02", icon: SlidersHorizontal, title: "Rate your arm", desc: "Three sliders, a throw count, activity type. Done." },
  { num: "03", icon: ShieldCheck, title: "Get your call", desc: "Your readiness score and today’s recommendation, instantly." },
];

export default function HowItWorks() {
  return (
    <section style={{ position: "relative", zIndex: 2, maxWidth: 1080, margin: "0 auto", padding: "70px 24px" }}>
      <ScrollFade>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Eyebrow>How it works</Eyebrow>
        </div>
        <h2
          className="font-display"
          style={{ textAlign: "center", fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(26px, 3.6vw, 40px)", letterSpacing: "-0.01em", margin: "0 auto 12px", maxWidth: 640 }}
        >
          Log your arm in 60 seconds
        </h2>
        <p style={{ textAlign: "center", color: T.ink2, fontSize: 16, lineHeight: 1.6, margin: "0 auto 48px", maxWidth: 480 }}>
          Two taps in the morning. A clear answer the moment you finish.
        </p>
      </ScrollFade>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
        {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
          <ScrollFade key={num} delay={i * 0.1}>
            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.line}`,
                borderRadius: 18,
                padding: "26px 24px",
                height: "100%",
                boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 10px 24px rgba(16,24,40,.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div
                  className="font-display"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: T.blue,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: "0 6px 16px rgba(46,107,255,.32)",
                  }}
                >
                  {num}
                </div>
                <Icon size={20} style={{ color: T.blue }} />
              </div>
              <p style={{ color: T.ink, fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{title}</p>
              <p style={{ color: T.ink2, fontSize: 14, lineHeight: 1.5, margin: 0 }}>{desc}</p>
            </div>
          </ScrollFade>
        ))}
      </div>
    </section>
  );
}
