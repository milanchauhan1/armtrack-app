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
    slug: "baseball-arm-pain-what-it-means-and-when-to-rest",
    title: "Baseball Arm Pain: What It Means and When to Rest",
    description:
      "Not all baseball arm pain is the same. How to tell normal throwing soreness from a warning sign, what usually causes arm pain in pitchers, and when to rest or see a doctor.",
    excerpt:
      "Some arm soreness is normal after throwing — some is your arm waving a red flag. A plain-English guide to telling them apart, what causes baseball arm pain, and when to rest.",
    keywords: [
      "baseball arm pain",
      "arm pain after pitching",
      "pitching arm pain",
      "baseball arm pain causes",
      "sore arm after throwing",
      "when to rest baseball arm",
      "inner elbow pain pitcher",
    ],
    datePublished: "2026-07-01",
    dateModified: "2026-07-01",
    author: "Milan",
    readingMinutes: 6,
    category: "Soreness & Recovery",
    blocks: [
      {
        type: "p",
        text: "**Baseball arm pain** is one of the most common — and most confusing — things a young pitcher deals with. Some soreness is a normal part of throwing hard. Some of it is your arm waving a red flag. Telling the two apart is the whole game, because the injuries that end seasons almost always start as pain that got ignored.",
      },
      {
        type: "p",
        text: "Here's a plain-English guide to what baseball arm pain usually means, what causes it, and when to rest — or stop and get it checked.",
      },
      { type: "h2", text: "Normal soreness vs. pain that matters" },
      {
        type: "p",
        text: "After a hard outing, some muscle soreness is expected — especially in the back of the shoulder and the meat of the forearm. The problem is when 'sore' quietly turns into something more. Use this rough guide:",
      },
      {
        type: "table",
        caption: "A general guide, not a diagnosis. When in doubt, rest and get it checked.",
        head: ["Usually normal", "Worth paying attention to"],
        rows: [
          ["Dull, general muscle soreness", "Sharp or pinpoint pain"],
          ["Fades within a day or two", "Lingers 3+ days or gets worse"],
          ["In the muscle (back of shoulder, forearm)", "In the joint — inner elbow or front of shoulder"],
          ["Loosens up as you warm up", "Hurts at rest or the next morning"],
          ["No effect on how you throw", "Velocity drop, lost command, or a lower arm slot"],
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "The one to take most seriously",
        text: "Pain on the **inner elbow** is the signal to respect most in young pitchers — it's the area involved in most overuse elbow injuries, including UCL (Tommy John) problems. Aching there is not something to throw through.",
      },
      { type: "h2", text: "What actually causes baseball arm pain" },
      {
        type: "p",
        text: "Most youth arm pain isn't from one bad throw — it builds up over weeks. The usual culprits:",
      },
      {
        type: "ul",
        items: [
          "**Too much throwing, too soon.** Spikes in workload — a jump from 40 to 90 pitches, or a heavy tournament weekend — are a leading cause.",
          "**Not enough rest between outings.** The arm rebuilds on recovery days; stacking throwing on tired tissue is where trouble starts.",
          "**Year-round pitching with no off-season.** Single-sport specialization removes the built-in rest that used to protect young arms.",
          "**Chasing velocity.** Max-effort throwing and weighted-ball work without recovery ramps the load fast.",
          "**Throwing while already fatigued.** A tired arm changes its mechanics, which piles extra stress on the elbow and shoulder.",
        ],
      },
      { type: "h2", text: "When to rest — and when to stop" },
      {
        type: "p",
        text: "A simple rule: **soreness gets a rest day; pain gets attention.**",
      },
      {
        type: "ol",
        items: [
          "**Mild muscle soreness that fades:** take your normal rest days and ease back in with catch and light long toss.",
          "**Soreness that lingers past 2–3 days:** back off throwing until it's gone. Don't test it in a game.",
          "**Joint pain, sharp pain, or pain at rest:** stop throwing and see a physician or athletic trainer. This is beyond 'tired.'",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "Get it checked if…",
        text: "You have **sharp pain, pain at rest, numbness or tingling, swelling, or soreness that doesn't improve with rest.** These are signals to stop throwing and see a medical professional — not to push through.",
      },
      { type: "h2", text: "The best way to keep pain from becoming an injury" },
      {
        type: "p",
        text: "Almost every serious arm injury is preceded by weeks of small signals — a little more soreness, a little less velocity, a workload that quietly crept up. The players who stay healthy are the ones who **notice the trend early.** That means tracking how the arm feels and how much you're throwing, every day, so a slow build doesn't sneak up on you.",
      },
      {
        type: "cta",
        text: "ArmTrack turns that into a 60-second daily habit: log your throwing and how your arm feels, and it flags when the trend is heading the wrong way — before pain becomes an injury. Free for players and coaches.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "Not medical advice",
        text: "This article is general information, not a diagnosis or treatment plan — it can't tell you whether your specific pain is serious. For any pain that is sharp, lingering, or worrying, see a physician or athletic trainer.",
      },
    ],
    faq: [
      {
        q: "Is it normal for my arm to hurt after pitching?",
        a: "Mild muscle soreness in the back of the shoulder or forearm that fades within a day or two is common after throwing. Sharp pain, joint pain (especially the inner elbow), or soreness that lasts several days is not typical and is a signal to rest and, if it continues, get it checked.",
      },
      {
        q: "How long should baseball arm pain last?",
        a: "Normal throwing soreness usually eases within 24–72 hours. Pain that lasts longer than a few days, gets worse, or moves into the joint should be rested and evaluated by a medical professional.",
      },
      {
        q: "Should I throw through arm pain?",
        a: "No. Muscle soreness can be managed with rest, but you should never throw through sharp pain, joint pain, or pain that lingers — that's how minor issues become serious injuries. When in doubt, rest and get it checked.",
      },
      {
        q: "What does inner elbow pain in pitchers mean?",
        a: "Inner (medial) elbow pain is the area involved in most youth overuse elbow injuries, including UCL problems that can lead to Tommy John surgery. It should be taken seriously — stop throwing and see a physician or athletic trainer rather than pitching through it.",
      },
    ],
  },
  {
    slug: "does-my-pitching-arm-need-a-day-off",
    title: "How to Tell If Your Pitching Arm Needs a Day Off",
    description:
      "A simple self-check for pitchers: green light, yellow light, or red light? How to know when your arm needs rest, what real recovery looks like, and when to stop throwing.",
    excerpt:
      "Not sure if you should throw today? Run this quick green-light / yellow-light / red-light check on your arm — and learn what real recovery actually looks like.",
    keywords: [
      "does my arm need rest",
      "pitching arm needs a day off",
      "when to rest pitching arm",
      "arm recovery baseball",
      "should i throw today baseball",
      "pitcher rest day",
    ],
    datePublished: "2026-07-01",
    dateModified: "2026-07-01",
    author: "Milan",
    readingMinutes: 5,
    category: "Soreness & Recovery",
    blocks: [
      {
        type: "p",
        text: "Every pitcher asks it at some point: **should I throw today, or does my arm need a day off?** Push too hard and you risk an injury; rest too much and you fall behind. The trick is having a simple, honest check you run *before* you pick up a ball — not after your arm's already barking.",
      },
      {
        type: "p",
        text: "Here's a quick self-check, plus what a real recovery day should actually look like.",
      },
      { type: "h2", text: "The 30-second self-check" },
      {
        type: "p",
        text: "Answer these honestly. The more 'yes' answers, the more your arm is asking for rest:",
      },
      {
        type: "ol",
        items: [
          "Is there soreness left over from your last outing that hasn't faded?",
          "Is any of the ache in the **joint** — inner elbow or front of the shoulder — rather than the muscle?",
          "Did your velocity or command drop noticeably last time out?",
          "Have you thrown hard multiple days in a row without a real rest day?",
          "Does the arm feel 'heavy,' late, or draggy when you warm up?",
        ],
      },
      { type: "h2", text: "Green light, yellow light, red light" },
      {
        type: "table",
        caption: "A simple way to read your answers.",
        head: ["Signal", "What it means", "What to do"],
        rows: [
          ["Green", "No lingering soreness, arm feels fresh, mechanics normal", "Throw as planned"],
          ["Yellow", "Mild leftover soreness or a heavy-feeling arm, no joint pain", "Light day: reduced volume, easy catch, or active recovery"],
          ["Red", "Joint pain, pain at rest, lingering soreness, or sharp pain", "Don't throw — rest, and see a pro if it doesn't clear"],
        ],
      },
      { type: "h2", text: "What a rest day actually looks like" },
      {
        type: "p",
        text: "'Rest' doesn't have to mean doing nothing — for most tired arms, **active recovery** beats a total shutdown. A good recovery day can include:",
      },
      {
        type: "ul",
        items: [
          "Light band work and shoulder/scap exercises",
          "Easy mobility and a proper cooldown after your last outing",
          "Sleep and hydration — the most underrated recovery tools there are",
          "Gentle catch at low intent, only if there's no pain",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Rest isn't falling behind",
        text: "One well-timed rest day protects weeks of throwing. Skipping it to 'stay sharp' is how a sharp arm becomes a hurt one.",
      },
      { type: "h2", text: "When a day off isn't enough" },
      {
        type: "p",
        text: "A day or two of rest handles normal fatigue. But some signals mean you're past 'tired' and into 'get it looked at.'",
      },
      {
        type: "callout",
        variant: "warn",
        title: "Stop and see a pro if…",
        text: "You have sharp pain, joint pain (especially the inner elbow), pain at rest, numbness or tingling, swelling, or soreness that a few rest days don't fix. Fatigue management is not a substitute for medical care.",
      },
      { type: "h2", text: "Stop guessing — track it" },
      {
        type: "p",
        text: "The self-check works best when it isn't just memory. If you log how your arm feels and how much you throw each day, the yellow and red flags show up as a **trend**, not a guess — and you'll rest when you actually need to, not too early or too late.",
      },
      {
        type: "cta",
        text: "ArmTrack runs that check for you: log your throwing and soreness in 60 seconds, and it turns the trend into a daily readiness score — ready, caution, or rest. Free for players and coaches.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "Not medical advice",
        text: "This is general information to help you make smarter throwing decisions, not a diagnosis. For pain that is sharp, lingering, or concerning, see a physician or athletic trainer.",
      },
    ],
    faq: [
      {
        q: "How do I know if my pitching arm needs rest?",
        a: "Watch for leftover soreness from your last outing, joint ache (inner elbow or front of the shoulder), a drop in velocity or command, throwing hard several days in a row, or an arm that feels heavy warming up. The more of these are true, the more your arm needs a day off.",
      },
      {
        q: "How many rest days does a pitcher need?",
        a: "It depends on workload. Youth guidelines (MLB Pitch Smart) tie rest to pitch count — up to 4 days after a heavy outing for ages 14 and under. Beyond the count, add a rest day any time soreness lingers or the arm feels fatigued.",
      },
      {
        q: "Is it okay to throw with a sore arm?",
        a: "Mild muscle soreness that fades can often be managed with a lighter day or active recovery. But you should not throw through joint pain, sharp pain, or soreness that lingers several days — rest and, if it persists, get it evaluated.",
      },
      {
        q: "What should a pitcher do on a rest day?",
        a: "Active recovery usually beats total rest: light band and scap work, mobility, a good cooldown, sleep, and hydration, plus gentle low-intent catch only if there's no pain.",
      },
    ],
  },
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
