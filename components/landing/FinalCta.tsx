"use client";

import Link from "next/link";
import { ScrollFade, T } from "./primitives";

export default function FinalCta() {
  return (
    <section style={{ position: "relative", zIndex: 2, overflow: "hidden", background: T.panel, borderTop: `1px solid ${T.line}` }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,107,255,.12), transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "90px 24px", textAlign: "center" }}>
        <ScrollFade>
          <h2
            className="font-display"
            style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(30px, 5vw, 50px)", letterSpacing: "-0.01em", lineHeight: 1, margin: "0 0 16px", color: T.ink }}
          >
            Start paying attention early
          </h2>
          <p style={{ color: T.ink2, fontSize: 17, lineHeight: 1.6, margin: "0 0 34px" }}>
            Free for players. Built for the people who’d rather catch it now than wonder later.
          </p>
          <Link
            href="/signup"
            className="lp-shine"
            style={{
              position: "relative",
              overflow: "hidden",
              display: "inline-block",
              background: T.blue,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              padding: "16px 36px",
              borderRadius: 99,
              boxShadow: "0 10px 28px rgba(46,107,255,.4)",
            }}
          >
            Get your readiness, free
          </Link>
          <p style={{ color: T.ink2, fontSize: 13, marginTop: 18 }}>No download required. Works on any device.</p>
        </ScrollFade>
      </div>
    </section>
  );
}
