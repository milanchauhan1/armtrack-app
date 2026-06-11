import React from "react";
import Link from "next/link";

// ── Content model ──────────────────────────────────────────────────────────────
// Posts are authored as structured blocks (not markdown) so we get full styling
// control, server-rendered HTML for SEO, and AI-extractable structure (tables,
// numbered lists, definition-first paragraphs) with zero extra dependencies.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] }
  | { type: "callout"; variant?: "info" | "warn"; title?: string; text: string }
  | { type: "cta"; text?: string };

export interface FaqItem {
  q: string;
  a: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  keywords: string[];
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  author: string;
  readingMinutes: number;
  category: string;
  blocks: Block[];
  faq?: FaqItem[];
}

const SITE_URL = "https://armtrack.app";

// ── Inline formatting — supports **bold** and [text](url) ──────────────────────

export function renderInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Tokenize on links first, then bold within plain spans.
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  const pushPlain = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part) => {
      if (!part) return;
      if (part.startsWith("**") && part.endsWith("**")) {
        nodes.push(
          <strong key={`${keyPrefix}-b-${n++}`} style={{ color: "#ffffff", fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      } else {
        nodes.push(<React.Fragment key={`${keyPrefix}-t-${n++}`}>{part}</React.Fragment>);
      }
    });
  };
  while ((m = linkRe.exec(text)) !== null) {
    pushPlain(text.slice(last, m.index));
    const href = m[2];
    const external = /^https?:\/\//.test(href);
    nodes.push(
      <a
        key={`${keyPrefix}-l-${n++}`}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{ color: "#60a5fa", textDecoration: "underline", textUnderlineOffset: 2 }}
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  pushPlain(text.slice(last));
  return nodes;
}

// ── Block renderer (server component) ──────────────────────────────────────────

function CtaBlock({ text }: { text?: string }) {
  return (
    <div
      style={{
        margin: "32px 0",
        background: "linear-gradient(160deg, #0f1115 0%, #0a0a0a 100%)",
        border: "1px solid #1f1f1f",
        borderRadius: 18,
        padding: "26px 28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <p style={{ color: "#e5e5e5", fontSize: 15.5, lineHeight: 1.5, margin: 0, maxWidth: 420 }}>
        {text || "ArmTrack tracks throwing volume and soreness automatically — and turns it into a daily readiness score. Free for players and coaches."}
      </p>
      <Link
        href="/signup"
        style={{
          background: "#3B82F6",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          padding: "12px 20px",
          borderRadius: 12,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
        }}
      >
        Get Started Free →
      </Link>
    </div>
  );
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                style={{
                  color: "#ffffff",
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  margin: "44px 0 14px",
                }}
              >
                {renderInline(b.text, `h2-${i}`)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} style={{ color: "#f5f5f5", fontSize: 19, fontWeight: 700, margin: "28px 0 10px" }}>
                {renderInline(b.text, `h3-${i}`)}
              </h3>
            );
          case "p":
            return (
              <p key={i} style={{ color: "#c8c8cc", fontSize: 16.5, lineHeight: 1.75, margin: "0 0 18px" }}>
                {renderInline(b.text, `p-${i}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} style={{ margin: "0 0 18px", paddingLeft: 22, color: "#c8c8cc" }}>
                {b.items.map((it, j) => (
                  <li key={j} style={{ fontSize: 16.5, lineHeight: 1.7, marginBottom: 8 }}>
                    {renderInline(it, `ul-${i}-${j}`)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} style={{ margin: "0 0 18px", paddingLeft: 22, color: "#c8c8cc" }}>
                {b.items.map((it, j) => (
                  <li key={j} style={{ fontSize: 16.5, lineHeight: 1.7, marginBottom: 10 }}>
                    {renderInline(it, `ol-${i}-${j}`)}
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={i} style={{ margin: "8px 0 24px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th
                          key={j}
                          style={{
                            textAlign: "left",
                            color: "#fff",
                            fontWeight: 700,
                            padding: "10px 12px",
                            borderBottom: "1px solid #2a2a2a",
                            background: "#0e0e0e",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            style={{
                              color: "#c8c8cc",
                              padding: "10px 12px",
                              borderBottom: "1px solid #1a1a1a",
                            }}
                          >
                            {renderInline(cell, `td-${i}-${j}-${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {b.caption && (
                  <p style={{ color: "#71717a", fontSize: 12.5, margin: "8px 2px 0" }}>
                    {renderInline(b.caption, `cap-${i}`)}
                  </p>
                )}
              </div>
            );
          case "callout": {
            const warn = b.variant === "warn";
            const accent = warn ? "#F59E0B" : "#3B82F6";
            return (
              <div
                key={i}
                style={{
                  margin: "8px 0 24px",
                  background: warn ? "rgba(245,158,11,0.06)" : "rgba(59,130,246,0.06)",
                  border: `1px solid ${accent}33`,
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                {b.title && (
                  <p style={{ color: accent, fontSize: 13, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.02em" }}>
                    {b.title}
                  </p>
                )}
                <p style={{ color: "#cfcfd4", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
                  {renderInline(b.text, `co-${i}`)}
                </p>
              </div>
            );
          }
          case "cta":
            return <CtaBlock key={i} text={b.text} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// ── Posts ──────────────────────────────────────────────────────────────────────

export const POSTS: Post[] = [
  {
    slug: "youth-pitch-count-guidelines-by-age",
    title: "Youth Pitch Count Guidelines by Age (2026 Chart)",
    description:
      "Daily pitch count limits and required rest days for youth pitchers by age, based on MLB Pitch Smart. A clear chart for baseball parents and coaches.",
    excerpt:
      "How many pitches should a 9, 12, or 15-year-old throw? A clear, age-by-age chart of daily limits and required rest days — with the sources to back it up.",
    keywords: [
      "youth pitch count guidelines",
      "pitch count by age",
      "how many pitches should a 12 year old throw",
      "pitch smart guidelines",
      "pitcher rest days",
      "youth baseball pitch limits",
    ],
    datePublished: "2026-06-10",
    dateModified: "2026-06-10",
    author: "Milan",
    readingMinutes: 6,
    category: "Throwing Workload",
    blocks: [
      {
        type: "p",
        text: "Pitch counts are the simplest, most evidence-backed way to manage a young arm. **MLB's Pitch Smart program**, developed with the American Sports Medicine Institute (ASMI) and USA Baseball, sets daily pitch limits and required rest days by age — because overuse, not mechanics alone, is the biggest controllable risk factor for youth arm injuries.",
      },
      {
        type: "p",
        text: "Below is the at-a-glance chart, followed by how to read it and the limits of pitch counting on its own.",
      },
      { type: "h2", text: "Daily pitch count limits by age" },
      {
        type: "table",
        caption:
          "Maximum pitches in a single day. Source: [MLB Pitch Smart](https://www.mlb.com/pitch-smart/pitching-guidelines). Always confirm the current chart and your league's rules.",
        head: ["Age", "Daily max (pitches)"],
        rows: [
          ["7–8", "50"],
          ["9–10", "75"],
          ["11–12", "85"],
          ["13–14", "95"],
          ["15–16", "95"],
          ["17–18", "105"],
        ],
      },
      { type: "h2", text: "Required rest days by pitch count" },
      {
        type: "p",
        text: "Hitting the daily max isn't a green light to throw again tomorrow. Pitch Smart ties **days of rest** to how many pitches were thrown. Here are the thresholds for **ages 14 and under**:",
      },
      {
        type: "table",
        caption: "Rest required after a given day's pitch count, ages 14 & under. Source: MLB Pitch Smart.",
        head: ["Pitches in a day", "Rest required"],
        rows: [
          ["1–20", "None"],
          ["21–35", "1 day"],
          ["36–50", "2 days"],
          ["51–65", "3 days"],
          ["66+", "4 days"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Older age groups",
        text: "Rest thresholds are slightly higher for ages 15–18 (more pitches allowed before each rest tier). See the full [Pitch Smart guidelines](https://www.mlb.com/pitch-smart/pitching-guidelines) for the 15–16 and 17–18 charts.",
      },
      { type: "h2", text: "How to actually use these numbers" },
      {
        type: "ol",
        items: [
          "**Count every competitive pitch.** Warm-up throws and bullpens add load too, even if they don't count toward the game limit.",
          "**Respect the rest, not just the cap.** A pitcher who throws 66 pitches needs the full rest period before throwing again — including catch and long toss.",
          "**Watch the calendar, not just the game.** Back-to-back tournaments are where counts quietly pile up across a weekend.",
          "**Layer in how the arm feels.** Pitch counts are a workload ceiling, not a readiness signal. A tired arm at 60 pitches matters more than a fresh arm at 80.",
        ],
      },
      { type: "h2", text: "Where pitch counts fall short" },
      {
        type: "p",
        text: "Pitch counts measure **how much** a player threw — not **how the arm is responding**. Two pitchers can throw the same 80 pitches and recover completely differently. That's why soreness, recovery, and trends over time matter alongside the raw count.",
      },
      {
        type: "cta",
        text: "ArmTrack logs throwing volume and daily soreness in about 60 seconds, then turns the trend into a readiness score — so the count and the feel live in one place. Free for players and coaches.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "Not medical advice",
        text: "These are general workload guidelines, not a diagnosis or a guarantee against injury. Follow your league's rules and consult a physician or athletic trainer for any pain that lingers.",
      },
    ],
    faq: [
      {
        q: "How many pitches should a 12-year-old throw?",
        a: "Per MLB Pitch Smart, an 11–12 year old should throw a maximum of 85 pitches in a single day, with required rest days based on how many pitches were thrown (e.g., 4 days off after 66+ pitches).",
      },
      {
        q: "How many days of rest does a youth pitcher need?",
        a: "For ages 14 and under: no rest after 1–20 pitches, 1 day after 21–35, 2 days after 36–50, 3 days after 51–65, and 4 days after 66 or more pitches in a single day.",
      },
      {
        q: "Do warm-up pitches count toward the limit?",
        a: "Warm-up and bullpen throws usually don't count toward a game's official pitch limit, but they still add to the arm's total workload, so coaches should account for them.",
      },
    ],
  },
  {
    slug: "signs-of-a-tired-pitching-arm",
    title: "7 Signs of a Tired Pitching Arm (and What to Do)",
    description:
      "The most common signs a young pitcher's arm is fatigued — velocity drops, command loss, a lower arm slot, lingering soreness — and what coaches and parents should do.",
    excerpt:
      "Kids rarely say their arm is tired — but it shows. Seven signs of a fatigued throwing arm to watch for, and the simple steps to take when you spot them.",
    keywords: [
      "signs of a tired pitching arm",
      "fatigued throwing arm",
      "pitcher arm fatigue",
      "dead arm baseball",
      "arm sore after pitching",
      "when to rest a pitcher",
    ],
    datePublished: "2026-06-10",
    dateModified: "2026-06-10",
    author: "Milan",
    readingMinutes: 5,
    category: "Soreness & Recovery",
    blocks: [
      {
        type: "p",
        text: "A tired arm rarely announces itself. Young players want to stay in the game, so they say they're **fine** even when they aren't. The good news: arm fatigue almost always shows up in performance and body language first — if you know what to watch for.",
      },
      {
        type: "p",
        text: "Here are seven of the most common signs that a pitching arm is fatigued, followed by what to do when you notice them.",
      },
      { type: "h2", text: "7 signs of arm fatigue" },
      {
        type: "ol",
        items: [
          "**Velocity drops late in an outing.** A pitcher who sat at one speed early and fades a few mph is often running out of arm, not just gas.",
          "**Command gets erratic.** Balls sailing high or arm-side frequently is a classic fatigue tell — the arm can't repeat its slot.",
          "**The arm slot drops.** Dropping down or 'short-arming' to find velocity is the body compensating for a tired shoulder or elbow.",
          "**Recovery soreness lingers.** Normal next-day soreness that fades is expected; soreness that's still there two or three days later is a flag.",
          "**The release feels late or 'heavy.'** Players describe a tired arm as heavy, draggy, or a half-beat behind.",
          "**A dip in effort or enthusiasm.** Subtle disengagement late in a game can be the body protecting itself.",
          "**Soreness that moves toward the joint.** Muscle soreness is common; aching at the **inner elbow or front of the shoulder** deserves more attention.",
        ],
      },
      { type: "h2", text: "What to do when you see the signs" },
      {
        type: "ol",
        items: [
          "**Stop for the day.** Pulling a pitcher early is never the wrong call when the arm looks tired.",
          "**Ask, but don't rely on the answer.** Players underreport — pair what they say with what you see.",
          "**Protect recovery.** Honor rest days, ease back through catch and light long toss, and don't pile a bullpen on top of a heavy outing.",
          "**Track it over time.** One rough day is noise; the same signs across a week is a pattern worth acting on.",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "When to see a professional",
        text: "Sharp pain, pain at rest, numbness or tingling, or soreness that doesn't improve with rest is beyond 'tired.' Stop throwing and see a physician or athletic trainer. Fatigue management is not a substitute for medical care.",
      },
      { type: "h2", text: "Why tracking beats memory" },
      {
        type: "p",
        text: "Most of these signs are easy to miss in the moment and even easier to forget by next week. Writing down soreness, throwing volume, and how the arm felt — every day — turns scattered hunches into a trend you can actually see.",
      },
      {
        type: "cta",
        text: "ArmTrack makes that a 60-second habit: log pain, soreness, stiffness, and throws, and watch the trend so a tired week doesn't sneak up on you. Free for players and coaches.",
      },
    ],
    faq: [
      {
        q: "What are the signs of a tired pitching arm?",
        a: "Common signs include a late-outing velocity drop, erratic command, a dropping arm slot, soreness that lingers for several days, a 'heavy' or late-feeling arm, a dip in effort, and aching near the inner elbow or front of the shoulder.",
      },
      {
        q: "Is it normal for a pitcher's arm to be sore after throwing?",
        a: "Mild next-day muscle soreness that fades within a day or two is common. Soreness that lingers for several days, moves toward the joint, or includes sharp pain is a flag to rest and, if it persists, see a medical professional.",
      },
      {
        q: "When should a young pitcher stop throwing?",
        a: "Stop for the day at the first clear signs of fatigue — falling velocity, lost command, or a dropping arm slot. Seek medical care for sharp pain, pain at rest, numbness, or soreness that doesn't improve with rest.",
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getAllPosts(): Post[] {
  return [...POSTS].sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}/`;
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
