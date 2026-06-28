"use client";

import Link from "next/link";
import { T } from "./primitives";

export default function Footer() {
  return (
    <footer style={{ position: "relative", zIndex: 2, background: T.bg, borderTop: `1px solid ${T.line}`, padding: "26px 24px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: T.ink2, fontSize: 13 }}>ArmTrack © 2026</span>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/blog" style={{ color: T.ink2, fontSize: 13, textDecoration: "none" }}>Guides</Link>
          <Link href="/methodology" style={{ color: T.ink2, fontSize: 13, textDecoration: "none" }}>Methodology</Link>
          <Link href="/privacy" style={{ color: T.ink2, fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: T.ink2, fontSize: 13, textDecoration: "none" }}>Terms</Link>
        </div>
        <span style={{ color: T.ink2, fontSize: 13 }}>Built for baseball &amp; softball</span>
      </div>
    </footer>
  );
}
