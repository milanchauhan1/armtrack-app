import type { Metadata, Viewport } from "next";
import { Inter, Chakra_Petch } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import InstallBanner from "@/components/InstallBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NativeSplash from "@/components/NativeSplash";
import ScrollReset from "@/components/ScrollReset";
import DeepLinks from "@/components/DeepLinks";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Landing display face — sporty/tactical "baseball" character for headlines
// and readiness numerals. Body stays Inter for coherence with the in-app UI.
const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-chakra",
});

const SITE_URL = "https://armtrack.app";
const TITLE = "ArmTrack — Make Smarter Throwing Decisions";
const DESCRIPTION =
  "ArmTrack helps baseball players and coaches track pain, soreness, and throwing workload in 60 seconds a day — turning daily check-ins into a readiness score you can act on.";

// Lock the WebView to the device width — no pinch-zoom, no sideways panning.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · ArmTrack",
  },
  description: DESCRIPTION,
  applicationName: "ArmTrack",
  keywords: [
    "arm health",
    "baseball arm care",
    "pitcher workload",
    "throwing readiness",
    "pitch count tracker",
    "arm soreness tracking",
    "baseball coach app",
    "softball arm health",
    "youth pitcher injury",
  ],
  authors: [{ name: "Milan" }],
  creator: "Milan",
  publisher: "ArmTrack",
  category: "sports",
  alternates: {
    canonical: "/",
  },
  // Open Graph / Twitter images are supplied by app/opengraph-image.tsx
  // (a branded 1200×630 card generated at build time).
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ArmTrack",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ArmTrack" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${chakra.variable} font-sans antialiased`}>
        <div id="app-shell" className="app-shell">
          {children}
        </div>
        <BottomNav />
        <InstallBanner />
        <ServiceWorkerRegister />
        <NativeSplash />
        <ScrollReset />
        <DeepLinks />
      </body>
    </html>
  );
}
