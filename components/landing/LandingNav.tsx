"use client";

import Link from "next/link";
import Image from "next/image";
import { T } from "./primitives";

export default function LandingNav() {
  return (
    <nav
      className="lp-nav"
      style={{
        position: "relative",
        zIndex: 5,
        maxWidth: 1180,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "18px 24px",
      }}
    >
      <Link href="/" className="lp-nav-logo" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
        <Image
          src="/icons/icon-192.png"
          width={44}
          height={44}
          alt="ArmTrack"
          className="lp-nav-icon"
          style={{ borderRadius: 12, boxShadow: "0 5px 14px rgba(46,107,255,.28)" }}
        />
        <span className="font-display lp-nav-word" style={{ fontWeight: 700, fontSize: 25, letterSpacing: "0.01em" }}>
          <span style={{ color: T.ink }}>Arm</span>
          <span style={{ color: T.blue }}>Track</span>
        </span>
      </Link>

      <div className="lp-nlinks" style={{ display: "flex", gap: 28, fontSize: 14, color: T.ink2, fontWeight: 500 }}>
        <Link href="#why" style={{ color: "inherit", textDecoration: "none" }}>Why ArmTrack</Link>
        <Link href="#coaches" style={{ color: "inherit", textDecoration: "none" }}>For coaches</Link>
        <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Guides</Link>
      </div>

      <div className="lp-nav-cta" style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <Link href="/login" className="lp-nav-login" style={{ fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: "none" }}>
          Log in
        </Link>
        <Link
          href="/signup"
          className="lp-nav-getstarted"
          style={{ background: T.ink, color: "#fff", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 99, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
