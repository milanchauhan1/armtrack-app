"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

// Locked light sports-tech tokens (see docs/design-guide.md).
export const T = {
  bg: "#F6F7F9",
  panel: "#FFFFFF",
  ink: "#15171C",
  ink2: "#3C424D",
  line: "#E4E7EC",
  blue: "#2E6BFF",
  blue2: "#6E9BFF",
  green: "#10B981",
  green2: "#4FD8A8",
  amber: "#F59E0B",
  red: "#EF4444",
} as const;

export const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function ScrollFade({
  children,
  delay = 0,
  y = 22,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, color = T.blue }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="font-display"
      style={{
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: 13,
        color,
      }}
    >
      {children}
    </span>
  );
}

// Self-drawing trend line. `points` is an array of [x,y] in a 260×86 box.
export function Sparkline({ points, gradientId }: { points: [number, number][]; gradientId: string }) {
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const last = points[points.length - 1];
  return (
    <svg width="100%" height="86" viewBox="0 0 260 86" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={T.blue} />
          <stop offset="100%" stopColor={T.blue2} />
        </linearGradient>
      </defs>
      <path
        className="lp-draw"
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="lp-dot" cx={last[0]} cy={last[1]} r={4.5} fill={T.blue} />
    </svg>
  );
}
