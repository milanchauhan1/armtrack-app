"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolling lives in `#app-shell`, not the window, so Next's default
 * scroll-to-top on navigation doesn't fire. Reset the container on route change
 * so each page opens at the top.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    document.getElementById("app-shell")?.scrollTo({ top: 0 });
  }, [pathname]);

  return null;
}
