"use client";

import { Quote } from "lucide-react";
import { ScrollFade, Eyebrow, T } from "./primitives";

export default function FounderStory() {
  return (
    <section style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto", padding: "70px 24px" }}>
      <ScrollFade>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Eyebrow>Why ArmTrack exists</Eyebrow>
        </div>
      </ScrollFade>
      <ScrollFade delay={0.05}>
        <div
          style={{
            position: "relative",
            background: T.panel,
            border: `1px solid ${T.line}`,
            borderRadius: 24,
            padding: "clamp(30px, 5vw, 46px)",
            boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 18px 44px rgba(16,24,40,.06)",
            overflow: "hidden",
          }}
        >
          <Quote size={28} style={{ color: T.blue, marginBottom: 20, opacity: 0.9 }} />
          <p style={{ fontSize: "clamp(18px, 2.4vw, 23px)", lineHeight: 1.55, color: T.ink, fontWeight: 500, margin: "0 0 18px", letterSpacing: "-0.01em" }}>
            I’ve played baseball most of my life. As I started throwing harder, elbow pain just became part of the
            routine. Ibuprofen before practice, telling myself I was fine. I never tracked my throwing volume,
            my soreness, or how I was recovering.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: T.ink2, margin: "0 0 16px" }}>
            Eventually it caught up with me. I built ArmTrack so the next player doesn’t have to learn it the hard way.
            I made it free, with no ads and no selling your data, because this isn’t about money.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 26 }}>
            <div
              className="font-display"
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                background: `linear-gradient(145deg, ${T.blue}, #1d4ed8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(46,107,255,.4)",
              }}
            >
              M
            </div>
            <div>
              <p style={{ color: T.ink, fontSize: 15, fontWeight: 700, margin: 0 }}>Milan</p>
              <p style={{ color: T.ink2, fontSize: 13, margin: 0 }}>Founder, ArmTrack</p>
            </div>
          </div>
        </div>
      </ScrollFade>
    </section>
  );
}
