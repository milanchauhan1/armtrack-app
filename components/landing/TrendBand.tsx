"use client";

import { ScrollFade, Eyebrow, Sparkline, T } from "./primitives";

const BARS = [40, 65, 52, 80, 60, 92, 72];
const PAIN_POINTS: [number, number][] = [
  [5, 62], [45, 52], [85, 57], [125, 38], [165, 45], [205, 22], [250, 31],
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.line}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 10px 24px rgba(16,24,40,.05)",
      }}
    >
      {children}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ink2, marginBottom: 5 };
const cap: React.CSSProperties = { fontSize: 13.5, color: T.ink, fontWeight: 600, marginBottom: 12 };

export default function TrendBand() {
  return (
    <section style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "6px 24px 30px" }}>
      <ScrollFade>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <Eyebrow>Under the score</Eyebrow>
          <h2
            className="font-display"
            style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(20px, 2.6vw, 28px)", letterSpacing: "-0.01em", margin: 0 }}
          >
            More than a daily check-in
          </h2>
        </div>
      </ScrollFade>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        <ScrollFade>
          <Card>
            <div style={lbl}>Pain trend · 7 days</div>
            <div style={cap}>Catch it climbing — quietly.</div>
            <Sparkline points={PAIN_POINTS} gradientId="trendPain" />
          </Card>
        </ScrollFade>

        <ScrollFade delay={0.08}>
          <Card>
            <div style={lbl}>Throwing workload</div>
            <div style={cap}>Throws &amp; intensity, day over day.</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 86 }}>
              {BARS.map((h, i) => (
                <div
                  key={i}
                  className="lp-bar"
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: "6px 6px 2px 2px",
                    background: `linear-gradient(${T.blue}, ${T.blue2})`,
                    boxShadow: "0 6px 14px rgba(46,107,255,.28)",
                    animationDelay: `${i * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </Card>
        </ScrollFade>

        <ScrollFade delay={0.16}>
          <Card>
            <div style={lbl}>Recovery</div>
            <div style={cap}>How fast you bounce back.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="font-display" style={{ fontWeight: 700, fontSize: 40, color: T.green, lineHeight: 1 }}>8.3</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0a7a55", background: "rgba(16,185,129,.12)", padding: "3px 10px", borderRadius: 99 }}>
                Good to Go
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: T.ink2, marginTop: 12, lineHeight: 1.5 }}>
              One rough day reads very differently than a rough week.
            </p>
          </Card>
        </ScrollFade>
      </div>
    </section>
  );
}
