"use client";

// Lightweight "App Store" badge. For App Store marketing, Apple requires their
// official badge asset eventually (Apple Marketing Resources) — swap that in
// when convenient; this is a clean, compliant-looking placeholder for launch prep.
export default function AppStoreBadge({ live, href }: { live: boolean; href?: string }) {
  const topLine = live ? "Download on the" : "Coming soon to the";
  const target = live && href ? href : "#waitlist";

  return (
    <a
      href={target}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 11,
        background: "#000000",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: 12,
        padding: "10px 18px",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true">
        <path d="M17.05 12.04c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.97-.88-3.24-.86-1.67.03-3.21.97-4.07 2.46-1.73 3-.44 7.45 1.24 9.89.82 1.19 1.8 2.53 3.08 2.48 1.24-.05 1.71-.8 3.21-.8 1.5 0 1.92.8 3.23.78 1.33-.02 2.18-1.21 3-2.41.94-1.38 1.33-2.72 1.35-2.79-.03-.01-2.59-.99-2.62-3.93zM14.6 4.84c.69-.83 1.15-1.99 1.02-3.14-.99.04-2.19.66-2.9 1.49-.64.73-1.2 1.91-1.05 3.03 1.1.09 2.24-.56 2.93-1.38z" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, textAlign: "left" }}>
        <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>{topLine}</span>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>App&nbsp;Store</span>
      </span>
    </a>
  );
}
