import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using ArmTrack.",
  alternates: { canonical: "/terms/" },
};

const UPDATED = "June 11, 2026";
const CONTACT = "support@armtrack.app"; // TODO: replace with a monitored inbox

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={UPDATED}>
      <P>
        These Terms govern your use of ArmTrack. By creating an account or using ArmTrack, you agree to
        these Terms. If you don&apos;t agree, don&apos;t use the service.
      </P>

      <H2>Eligibility</H2>
      <P>
        You must be <strong>13 or older</strong> to create your own account. Players under 13 may use
        ArmTrack only through an account created and managed by a parent, guardian, or coach who
        consents on their behalf. By signing up, you confirm you meet these requirements.
      </P>

      <H2>Not medical advice</H2>
      <P>
        ArmTrack is an informational tool that surfaces trends from data you log. It does{" "}
        <strong>not</strong> diagnose, treat, or prevent injuries and is not a substitute for
        professional medical or athletic-training advice. Throwing decisions are yours; consult a
        qualified professional for any pain or medical concern. You use ArmTrack at your own risk.
      </P>

      <H2>Your account &amp; content</H2>
      <UL items={[
        "You&apos;re responsible for your account and keeping your login secure.",
        "You own the data you enter. You grant us a limited license to store and process it to operate the service.",
        "Don&apos;t impersonate others, harass anyone, upload unlawful content, or misuse the service.",
        "If you make your profile public, the limited profile information you choose to show may be viewed and followed by others.",
      ]} />

      <H2>Disclaimers &amp; limitation of liability</H2>
      <P>
        ArmTrack is provided &ldquo;as is,&rdquo; without warranties of any kind. To the fullest extent
        permitted by law, ArmTrack and its creators are not liable for any injury, loss, or damages
        arising from your use of the service or any decision made based on it. ArmTrack does not
        guarantee any health outcome and does not prevent injuries.
      </P>

      <H2>Termination</H2>
      <P>
        You may stop using ArmTrack and delete your account at any time. We may suspend or terminate
        accounts that violate these Terms.
      </P>

      <H2>Changes</H2>
      <P>
        We may update these Terms. Continued use after changes means you accept the updated Terms.
      </P>

      <H2>Contact</H2>
      <P>Questions about these Terms? Email {CONTACT}.</P>
    </LegalPage>
  );
}

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
function bold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
