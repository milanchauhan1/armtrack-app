"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.18,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const steps = [
  {
    number: "01",
    icon: "📝",
    title: "Log Daily",
    description:
      "Check in every day in under 60 seconds. Track pain, soreness, workload, and recovery.",
  },
  {
    number: "02",
    icon: "📊",
    title: "See Your Trends",
    description:
      "Your dashboard reveals patterns over time — what causes flare-ups, what helps you recover.",
  },
  {
    number: "03",
    icon: "🛡️",
    title: "Stay Healthy",
    description:
      "Get smart warnings before overuse becomes injury. Protect your arm and your career.",
  },
];

const features = [
  {
    icon: "📋",
    title: "Daily Arm Log",
    description:
      "Track pain, soreness, and workload in under 60 seconds. Build a habit that protects your career.",
  },
  {
    icon: "📈",
    title: "Trend Dashboard",
    description:
      "See how your arm responds to workload over time. Spot patterns before they become injuries.",
  },
  {
    icon: "👥",
    title: "Team Insights",
    description:
      "Coaches monitor every player's arm health in one place. Get alerts before problems escalate.",
  },
];

const stats = [
  { value: "15M", label: "players in baseball" },
  { value: "1 in 4", label: "pitchers get injured" },
  { value: "36×", label: "higher risk when fatigued" },
  { value: "38.8%", label: "of MLB pitchers had Tommy John surgery" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-white/80 transition-colors duration-150 hover:text-white"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-150 hover:bg-blue-400"
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden" style={{ minHeight: "calc(100vh - 68px)" }}>
        {/* Glow orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            style={{
              width: 820,
              height: 820,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(59,130,246,0.18) 35%, rgba(59,130,246,0.06) 60%, transparent 75%)",
              filter: "blur(8px)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center">
          {/* Eyebrow */}
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400"
          >
            Built for baseball. Built for longevity.
          </motion.p>

          {/* H1 */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 text-6xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Protect the arm.
            <br />
            Extend the career.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-10 max-w-xl text-lg leading-relaxed text-gray-400 sm:text-xl"
          >
            ArmTrack helps coaches and players track workload, soreness, and
            recovery — stopping arm injuries before they start.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-10 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-400"
              style={{ boxShadow: "0 4px 32px rgba(59,130,246,0.45)" }}
            >
              Get Started Free
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/[0.05]"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="w-full max-w-4xl px-0"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              {stats.map((stat) => (
                <div
                  key={stat.value}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl p-6 text-center"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #222222",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 0 24px rgba(59,130,246,0.1)",
                  }}
                >
                  <span className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="text-xs leading-snug text-gray-500 sm:text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 w-full py-16 px-6">
        <div className="mx-auto w-full max-w-5xl">
          {/* Section header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400"
            >
              Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
            >
              Everything your arm needs
            </motion.h2>
          </div>

          {/* Feature cards */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  borderLeft: "3px solid #3B82F6",
                  borderRadius: "12px",
                  padding: "32px",
                  boxShadow: "0 0 28px rgba(59,130,246,0.09)",
                }}
                className="flex flex-1 flex-col"
              >
                <div
                  className="mb-5 inline-flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: "#1e3a5f",
                    borderRadius: "8px",
                    padding: "12px",
                    width: "fit-content",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 w-full px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400"
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
            >
              Three steps to a healthier arm
            </motion.h2>
          </div>

          {/* Steps */}
          <div className="relative flex flex-col gap-12 sm:flex-row sm:gap-0">
            {/* Dashed connector line (desktop only) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 top-[2.75rem] hidden sm:block"
            >
              <div
                style={{
                  margin: "0 12.5%",
                  borderTop: "2px dashed rgba(59,130,246,0.25)",
                }}
              />
            </div>

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.14,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="relative flex flex-1 flex-col items-center px-6 text-center"
              >
                {/* Step number */}
                <span className="mb-3 text-5xl font-extrabold leading-none tracking-tight text-blue-500 opacity-90">
                  {step.number}
                </span>
                {/* Icon */}
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-3xl ring-1 ring-white/10">
                  {step.icon}
                </div>
                {/* Text */}
                <h3 className="mb-2 text-xl font-extrabold text-white">
                  {step.title}
                </h3>
                <p className="max-w-[220px] text-sm leading-relaxed text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 w-full px-6 py-28 text-center">
        {/* Subtle glow behind CTA */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            style={{
              width: 500,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            className="mb-8 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Start protecting your arm today.
          </motion.h2>
          <motion.a
            href="/signup"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              delay: 0.12,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-10 py-5 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all duration-200 hover:bg-blue-400 hover:shadow-blue-400/40"
          >
            Get Started Free
          </motion.a>
        </div>
      </section>
    </div>
  );
}
