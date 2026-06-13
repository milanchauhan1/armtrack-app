import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ArmTrack collects, uses, and protects your information.",
  alternates: { canonical: "/privacy/" },
};

const UPDATED = "June 11, 2026";
const CONTACT = "support@armtrack.app"; // TODO: replace with a monitored inbox

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated={UPDATED}>{PRIVACY}</LegalPage>;
}

const PRIVACY = (
  <>
    <P>
      ArmTrack (&ldquo;ArmTrack,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) helps baseball and softball
      players and coaches track arm health. This policy explains what we collect, how we use it, and
      your choices. By using ArmTrack you agree to this policy.
    </P>

    <H2>Information we collect</H2>
    <UL items={[
      "**Account information:** your email address and login credentials.",
      "**Profile information:** first name, position, level, throwing arm, goals, team, and optional details you add (bio, personal records, username).",
      "**Arm-health logs:** the pain, soreness, stiffness, throwing volume, activity, and recovery you record.",
      "**Usage information:** basic technical data needed to run the app (e.g., device type, app interactions).",
    ]} />

    <H2>How we use your information</H2>
    <UL items={[
      "To calculate your readiness score and throwing recommendations.",
      "To show coaches the readiness of players on their team.",
      "To power optional public profiles and the follow feature (only what you choose to make public).",
      "To operate, maintain, and improve ArmTrack.",
    ]} />

    <H2>Children&apos;s privacy (under 13)</H2>
    <P>
      ArmTrack is intended for users <strong>13 and older</strong>. Players under 13 may only use
      ArmTrack if a parent, guardian, or coach creates and manages the account and provides consent on
      the child&apos;s behalf. We do not knowingly collect personal information from a child under 13
      without such consent. If you believe a child under 13 has provided us information without
      consent, contact us at {CONTACT} and we will delete it. Parents and guardians may contact us to
      review or delete their child&apos;s information at any time.
    </P>

    <H2>Health information &amp; no medical advice</H2>
    <P>
      ArmTrack surfaces trends to help you make informed throwing decisions. It does{" "}
      <strong>not</strong> diagnose, treat, or prevent injuries and is not a substitute for a coach,
      athletic trainer, or doctor. The data you log is self-reported and used only to provide the
      features above.
    </P>

    <H2>How we share information</H2>
    <UL items={[
      "**We do not sell your personal information.**",
      "**Coaches** can see the arm-health data and readiness of players on teams they manage.",
      "**Public/unlisted profiles:** if you set your profile to public or unlisted, the limited information shown on your profile (name, username, position, records) is visible per that setting. Your raw arm-health logs are never shown publicly.",
      "**Service providers:** we use Supabase to host data on our behalf, subject to their security practices.",
      "**Legal:** we may disclose information if required by law.",
    ]} />

    <H2>Data security</H2>
    <P>
      Data is stored with our hosting provider and protected with row-level security so that users can
      only access data they are permitted to. No system is perfectly secure, but we take reasonable
      measures to protect your information.
    </P>

    <H2>Your choices &amp; rights</H2>
    <P>
      You can edit your profile and visibility at any time, and you can request access to, correction
      of, or deletion of your information by contacting {CONTACT}. Deleting your account removes your
      personal information from active systems.
    </P>

    <H2>Changes</H2>
    <P>
      We may update this policy. We&apos;ll revise the &ldquo;last updated&rdquo; date above and, for
      material changes, take reasonable steps to notify you.
    </P>

    <H2>Contact</H2>
    <P>Questions? Email us at {CONTACT}.</P>
  </>
);

// ── Shared legal-page shell ─────────────────────────────────────────────────

function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-5 sm:px-10" style={{ borderBottom: "1px solid #141414" }}>
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Arm<span className="text-blue-500">Track</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-gray-400">Home</Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-3 text-xl font-bold text-white">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] leading-relaxed text-gray-300">{children}</p>;
}
function UL({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-gray-300">
      {items.map((it, i) => (
        <li key={i}>{bold(it)}</li>
      ))}
    </ul>
  );
}
// minimal **bold** support inside list items
function bold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
