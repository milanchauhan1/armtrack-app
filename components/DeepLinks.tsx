"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * When a player scans a team QR (a Universal Link like
 * https://armtrack.app/join/ABC123), iOS opens the app and fires `appUrlOpen`.
 * We route the in-app router to that join page so JoinClient can add them to the
 * team. Native only; harmless on web.
 */
export default function DeepLinks() {
  const router = useRouter();

  useEffect(() => {
    let remove: (() => void) | undefined;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("appUrlOpen", ({ url }) => {
          try {
            const path = new URL(url).pathname; // e.g. /join/ABC123
            if (path.startsWith("/join/")) router.push(path);
          } catch {
            /* not a parseable URL — ignore */
          }
        });
        remove = () => handle.remove();
      } catch {
        /* plugin unavailable — ignore */
      }
    })();
    return () => remove?.();
  }, [router]);

  return null;
}
