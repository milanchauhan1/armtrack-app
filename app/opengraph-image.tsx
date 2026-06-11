import { ImageResponse } from "next/og";

// Branded 1200×630 social card. Generated as a static PNG at build time
// (works with output: 'export').
export const dynamic = "force-static";
export const alt = "ArmTrack — Make smarter throwing decisions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* blue bloom */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.18) 45%, rgba(0,0,0,0) 72%)",
            display: "flex",
          }}
        />

        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#f5f5f5" }}>Arm</span>
          <span style={{ color: "#3B82F6" }}>Track</span>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              color: "#f5f5f5",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Make smarter throwing decisions.
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#a1a1aa", maxWidth: 860, lineHeight: 1.4 }}>
            Small arm issues become big problems when nobody&apos;s tracking them.
          </div>
        </div>

        {/* footer tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#71717a" }}>
          <span>Arm health for baseball &amp; softball</span>
          <span style={{ color: "#3f3f46" }}>•</span>
          <span>Log in 60 seconds</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
