"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";

import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import TrendBand from "@/components/landing/TrendBand";
import TryIt from "@/components/landing/TryIt";
import Stakes from "@/components/landing/Stakes";
import HowItWorks from "@/components/landing/HowItWorks";
import CoachBand from "@/components/landing/CoachBand";
import FounderStory from "@/components/landing/FounderStory";
import FinalCta from "@/components/landing/FinalCta";
import Waitlist from "@/components/landing/Waitlist";
import Footer from "@/components/landing/Footer";

// ── Structured data (JSON-LD) — rich results + AI search ───────────────────────
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://armtrack.app/#organization",
      name: "ArmTrack",
      url: "https://armtrack.app",
      logo: "https://armtrack.app/icons/icon-512.png",
      founder: { "@type": "Person", name: "Milan" },
    },
    {
      "@type": "WebSite",
      "@id": "https://armtrack.app/#website",
      url: "https://armtrack.app",
      name: "ArmTrack",
      publisher: { "@id": "https://armtrack.app/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "ArmTrack",
      applicationCategory: "HealthApplication",
      operatingSystem: "iOS, Web",
      installUrl: "https://apps.apple.com/us/app/armtrack/id6780317335",
      downloadUrl: "https://apps.apple.com/us/app/armtrack/id6780317335",
      description:
        "Free arm-health app for baseball and softball. Players log pain, soreness, stiffness, and throwing workload in about 60 seconds a day to get a readiness score and throwing recommendation. Coaches see their whole roster's readiness on one screen.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": "https://armtrack.app/#organization" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ArmTrack?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ArmTrack is a free arm-health app for baseball and softball. Players log pain, soreness, stiffness, and throwing volume in about 60 seconds a day and get a readiness score and a throwing recommendation. Coaches see their whole roster's readiness on one screen before practice.",
          },
        },
        {
          "@type": "Question",
          name: "Is ArmTrack free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes — ArmTrack is free for players, with no ads and no selling of your data." },
        },
        {
          "@type": "Question",
          name: "Does ArmTrack prevent injuries?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. ArmTrack surfaces trends in pain, soreness, recovery, and throwing workload to help players and coaches make informed throwing decisions. It does not diagnose, treat, or prevent injuries, and it is not a substitute for a coach, athletic trainer, or doctor.",
          },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  const router = useRouter();
  // Marketing page is web-only — on native, render the black splash from the
  // very first client render (no effect, no flash) while we redirect below.
  const nativeRedirecting = useSyncExternalStore(
    () => () => {},
    () => Capacitor.isNativePlatform(),
    () => false
  );

  // Native users have already installed — first-time users go straight to
  // onboarding (no login wall; an anonymous account is created when they tap
  // "Get started"). Signed-in users skip to the dashboard.
  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
      else if (native) router.replace("/onboarding");
    });
  }, [router]);

  // On native, render nothing (matches the black splash) while redirecting.
  if (nativeRedirecting) {
    return <div style={{ minHeight: "100vh", background: "#000000" }} />;
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#F6F7F9",
        color: "#15171C",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Atmosphere — fine grid + soft blue/green blooms */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: -2,
            backgroundImage:
              "linear-gradient(#E4E7EC 1px, transparent 1px), linear-gradient(90deg, #E4E7EC 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.7,
            WebkitMaskImage: "radial-gradient(circle at 72% 14%, #000, transparent 58%)",
            maskImage: "radial-gradient(circle at 72% 14%, #000, transparent 58%)",
          }}
        />
        <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", filter: "blur(70px)", background: "rgba(46,107,255,.13)", top: -180, right: -60 }} />
        <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", filter: "blur(70px)", background: "rgba(16,185,129,.08)", bottom: -160, left: -60 }} />
      </div>

      <LandingNav />
      <Hero />
      <TrendBand />
      <TryIt />
      <Stakes />
      <HowItWorks />
      <CoachBand />
      <FounderStory />
      <FinalCta />
      <Waitlist />
      <Footer />
    </div>
  );
}
