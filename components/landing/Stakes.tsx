"use client";

import { ScrollFade, Eyebrow, T } from "./primitives";

const STATS = [
  { num: "1 in 4", label: "youth pitchers report arm pain serious enough to stop throwing" },
  { num: "36×", label: "higher injury risk when pitchers throw with fatigue" },
  { num: "~50%", label: "of these injuries are overuse — meaning preventable" },
];

export default function Stakes() {
  return (
    <section style={{ position: "relative", zIndex: 2, background: T.panel, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "52px 24px" }}>
        <ScrollFade>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <Eyebrow color={T.red}>The stakes</Eyebrow>
          </div>
          <p style={{ textAlign: "center", color: T.ink2, fontSize: 15, margin: "0 0 30px" }}>
            The arm rarely fails overnight. It fails quietly — one ignored day at a time.
          </p>
        </ScrollFade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
          {STATS.map(({ num, label }, i) => (
            <ScrollFade key={num} delay={i * 0.08}>
              <div style={{ textAlign: "center", padding: "10px 18px" }}>
                <div className="font-display" style={{ fontWeight: 700, fontSize: "clamp(34px, 4.6vw, 46px)", color: T.ink, letterSpacing: "-0.01em", lineHeight: 1 }}>
                  {num}
                </div>
                <p style={{ color: T.ink2, fontSize: 13.5, lineHeight: 1.45, margin: "10px auto 0", maxWidth: 240 }}>{label}</p>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}
