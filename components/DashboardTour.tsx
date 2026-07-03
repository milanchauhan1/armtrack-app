"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOUR_KEY = "armtrack_tour_v1";
const SPOT_PAD = 8;
const TOOLTIP_H = 190; // rough tooltip height used to decide above/below placement

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
];

export default function DashboardTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

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
        localStorage.setItem(TOUR_KEY, "1");
        return null;
      }
      return s + 1;
    });
  }, []);

  const measure = useCallback(() => {
    if (step === null) return;
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    if (!el) {
      next();
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [step, next]);

  useEffect(() => {
    if (step === null) return;
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    if (!el) {
      const skip = setTimeout(next, 0);
      return () => clearTimeout(skip);
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, measure, next]);

  if (step === null) return null;

  const isLast = step === STEPS.length - 1;
  const placeBelow = rect ? rect.bottom + SPOT_PAD + TOOLTIP_H < window.innerHeight : true;

  return (
    <AnimatePresence>
      <motion.div
        key="tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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

        {/* Tooltip */}
        {rect && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: placeBelow ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 right-4 mx-auto max-w-sm rounded-2xl p-5"
            style={{
              top: placeBelow ? rect.bottom + SPOT_PAD + 12 : undefined,
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
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
