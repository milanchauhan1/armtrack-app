"use client";

import { useMemo, useState } from "react";
import { computeLogScore, getReadinessState, getPrimaryRecommendation, type ArmLog } from "@/lib/readiness";
import { T } from "./primitives";

const SLIDERS: { key: "pain" | "soreness" | "stiffness"; label: string }[] = [
  { key: "pain", label: "Pain" },
  { key: "soreness", label: "Soreness" },
  { key: "stiffness", label: "Stiffness" },
];

function sev(v: number): string {
  return v <= 3 ? T.green : v <= 6 ? T.amber : T.red;
}

// Demo defaults land on a green "Good to Go".
const DEFAULTS = { pain: 2, soreness: 3, stiffness: 2 };

export default function ReadinessDemo() {
  const [vals, setVals] = useState(DEFAULTS);

  // Use the real product math so the demo matches the live app exactly.
  const { score, state, recommendation } = useMemo(() => {
    const log = {
      id: "demo",
      date: "2026-01-01",
      pain_level: vals.pain,
      soreness_level: vals.soreness,
      stiffness_level: vals.stiffness,
      throws_count: 0,
      activity_type: null,
      recovery_done: null,
      notes: null,
    } as ArmLog;
    const s = computeLogScore(log);
    return { score: s, state: getReadinessState(s), recommendation: getPrimaryRecommendation(s, "Pitcher") };
  }, [vals]);

  return (
    <div style={{ flex: "1 1 320px", minWidth: 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span
          className="font-display"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.blue }}
        >
          <span className="lp-pulse" style={{ width: 7, height: 7, borderRadius: 99, background: T.blue }} />
          Move the sliders
        </span>
        <span style={{ fontSize: 11, color: T.ink2 }}>/ 10</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 54, lineHeight: 1, color: state.color, transition: "color .25s" }}>
          {score.toFixed(1)}
        </div>
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 99,
              color: state.color,
              background: `${state.color}1f`,
              transition: "all .25s",
            }}
          >
            {state.label}
          </span>
          <div style={{ fontSize: 12, color: T.ink2, marginTop: 6, lineHeight: 1.45 }}>{recommendation}</div>
        </div>
      </div>

      {SLIDERS.map(({ key, label }) => {
        const v = vals[key];
        const c = sev(v);
        return (
          <div key={key} style={{ marginTop: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
              <label htmlFor={`demo-${key}`} style={{ color: T.ink, fontWeight: 500 }}>
                {label}
              </label>
              <span className="font-display" style={{ fontWeight: 700, color: c }}>
                {v}
              </span>
            </div>
            <input
              id={`demo-${key}`}
              className="at-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={v}
              aria-label={`${label} level, ${v} out of 10`}
              onChange={(e) => setVals((s) => ({ ...s, [key]: Number(e.target.value) }))}
              style={{ background: `linear-gradient(to right, ${c} ${v * 10}%, #EAECF0 ${v * 10}%)` }}
            />
          </div>
        );
      })}
    </div>
  );
}
