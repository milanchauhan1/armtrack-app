"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { ScrollFade, T } from "./primitives";

export default function CoachBand() {
  return (
    <section
      id="coaches"
      style={{ position: "relative", zIndex: 2, background: T.panel, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px" }}>
        <ScrollFade>
          <Link
            href="/signup"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(46,107,255,.1)",
                border: "1px solid rgba(46,107,255,.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={18} style={{ color: T.blue }} />
            </span>
            <span style={{ color: T.ink2, fontSize: 15.5, lineHeight: 1.4 }}>
              Coaching a team?{" "}
              <span style={{ color: T.ink, fontWeight: 700 }}>See your whole roster’s readiness on one screen before practice.</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: T.blue, fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap" }}>
              Start as a coach <ArrowRight size={15} />
            </span>
          </Link>
        </ScrollFade>
      </div>
    </section>
  );
}
