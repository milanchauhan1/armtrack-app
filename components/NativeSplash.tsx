"use client";

import { useEffect } from "react";

/**
 * Hides the native splash screen once the web app has mounted. The Capacitor
 * config sets `launchAutoHide: false`, so the splash stays up through the
 * WebView's cold start (no black-screen gap) and we dismiss it here on first
 * paint. A safety timeout guarantees it never gets stuck if something stalls.
 */
export default function NativeSplash() {
  useEffect(() => {
    let done = false;
    const hide = async () => {
      if (done) return;
      done = true;
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* not native / plugin unavailable — nothing to hide */
      }
    };

    // Reveal on the next frame (content is painted), with a hard fallback.
    const raf = requestAnimationFrame(() => hide());
    const fallback = setTimeout(() => hide(), 4000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  return null;
}
