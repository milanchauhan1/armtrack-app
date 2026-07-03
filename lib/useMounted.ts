"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True once the component is hydrated on the client, false during SSR/prerender.
 * The canonical effect-free way to gate client-only UI (e.g. Recharts, which
 * can't render on the server).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
