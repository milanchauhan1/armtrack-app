"use client";

import { ScrollFade, Eyebrow, T } from "./primitives";
import ReadinessDemo from "./ReadinessDemo";

export default function TryIt() {
  return (
    <section id="why" style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "46px 24px 70px" }}>
      <ScrollFade>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 40,
            background: T.panel,
            border: `1px solid ${T.line}`,
            borderRadius: 24,
            padding: 34,
            boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 18px 44px rgba(16,24,40,.06)",
          }}
        >
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            <div style={{ marginBottom: 8 }}>
              <Eyebrow>Try it</Eyebrow>
            </div>
            <h2
              className="font-display"
              style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(24px, 3.2vw, 34px)", lineHeight: 1.04, margin: "0 0 12px" }}
            >
              See your readiness
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.ink2, maxWidth: 380, margin: 0 }}>
              Drag the sliders — your score, state, and recommendation update instantly, using the exact same math the app uses.
            </p>
          </div>
          <ReadinessDemo />
        </div>
      </ScrollFade>
    </section>
  );
}
