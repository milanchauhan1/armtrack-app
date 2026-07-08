"use client";

import { useCallback, useEffect, useRef, useState } from "react";
const TOUR_KEY = "armtrack_tour_v1";
const SPOT_PAD = 8;
const TOOLTIP_H = 230; // approx tooltip height (title + body + buttons) used for placement
// Reserve room for the fixed bottom tab bar (~52px) plus the iOS home-indicator
// safe area, so the tooltip's action button never lands under the nav (unclickable).
const NAV_SAFE = 96;

interface TourStep {
  target: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    target: "readiness",
    title: "Your readiness score",
    body: "After you log, your estimated readiness for today shows here — based on your recent throwing and recovery. Green means go, amber means ease up, red means rest.",
  },
  {
    target: "log",
    title: "Log in under 30 seconds",
    body: "Tap Log Today every day — pain, soreness, stiffness, throws, done. Daily logs build your streak and make your readiness estimate smarter.",
  },
  {
    target: "trend",
    title: "Spot patterns early",
    body: "Your 14-day trend shows if pain or soreness is creeping up, so you can back off before it becomes a problem.",
  },
  {
    target: "profile",
    title: "Claim your profile",
    body: "Grab your username here — you get a public page with your streak, stats, and PRs to share with coaches and teammates.",
  },
];

export default function DashboardTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  // True once a step has actually been displayed. The "seen it" flag must
  // only ever be written after this — otherwise a slow load can silently
  // cascade through the steps, burn the flag, and the tour never shows again.
  const shownRef = useRef(false);

  // Start once, after the dashboard's entrance animations settle.
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setStep(0), 800);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setStep(null);
  }, []);

  const next = useCallback(() => {
    setRect(null);
    setStep((s) => {
      if (s === null) return null;
      if (s + 1 >= STEPS.length) {
        if (shownRef.current) localStorage.setItem(TOUR_KEY, "1");
        return null;
      }
      return s + 1;
    });
  }, []);

  const measure = useCallback(() => {
    if (step === null) return;
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    // Element momentarily missing mid-step (re-render): keep the last rect
    // rather than skipping ahead.
    if (!el) return;
    if (!shownRef.current) {
      shownRef.current = true;
      // The tour is on screen — mark it seen immediately so it only ever
      // plays once, even if the user navigates away mid-tour.
      localStorage.setItem(TOUR_KEY, "1");
    }
    setRect(el.getBoundingClientRect());
  }, [step]);

  useEffect(() => {
    if (step === null) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let tries = 0;

    // The dashboard loads its data asynchronously — on a slow connection the
    // target may not exist yet. Retry for ~2.5s before giving up; on give-up,
    // hide WITHOUT writing the flag so the tour re-attempts on the next visit.
    const attempt = () => {
      const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
      if (!el) {
        tries += 1;
        if (tries < 10) {
          timer = setTimeout(attempt, 250);
        } else {
          setStep(null);
        }
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      timer = setTimeout(measure, 400);
    };
    attempt();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, measure]);

  if (step === null) return null;

  const isLast = step === STEPS.length - 1;
  // Only place the tooltip below the target when it fits above the bottom nav;
  // otherwise flip it above so "Next"/"Let's go" is always reachable. (Fixes the
  // last step, where the tall trend graph pushed the button under the tab bar.)
  const usableBottom = window.innerHeight - NAV_SAFE;
  const placeBelow = rect ? rect.bottom + SPOT_PAD + TOOLTIP_H < usableBottom : true;

  return (
    // Plain div, no mount fade: the dimming layer must never depend on an
    // animation tween completing (throttled frames can strand it half-visible
    // with page content bleeding through the tooltip).
    <div
      className="fixed inset-0 z-[100]"
      style={{ touchAction: "none" }}
      role="dialog"
      aria-label="Dashboard tour"
    >
        {/* Spotlight — the giant shadow darkens everything except the target */}
        {rect && (
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              top: rect.top - SPOT_PAD,
              left: rect.left - SPOT_PAD,
              width: rect.width + SPOT_PAD * 2,
              height: rect.height + SPOT_PAD * 2,
              borderRadius: 20,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
              border: "1px solid rgba(59,130,246,0.5)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Tooltip — plain div with a solid background; its legibility must
            never depend on a JS animation tween finishing. */}
        {rect && (
          <div
            key={step}
            className="absolute left-4 right-4 mx-auto max-w-sm rounded-2xl p-5"
            style={{
              top: placeBelow
                ? Math.min(rect.bottom + SPOT_PAD + 12, usableBottom - TOOLTIP_H)
                : undefined,
              bottom: placeBelow ? undefined : window.innerHeight - rect.top + SPOT_PAD + 12,
              backgroundColor: "#111111",
              border: "1px solid #2a2a2a",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
              {step + 1} of {STEPS.length}
            </p>
            <p className="mt-1.5 text-base font-extrabold text-white">{STEPS[step].title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{STEPS[step].body}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === step ? 16 : 6,
                      backgroundColor: i === step ? "#3B82F6" : "#333333",
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {!isLast && (
                  <button
                    onClick={finish}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-300"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={next}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-400"
                >
                  {isLast ? "Let's go" : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
