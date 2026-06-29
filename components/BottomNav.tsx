"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, PlusCircle, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { tapLight } from "@/lib/haptics";

export default function BottomNav() {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setMounted(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Only show the player tab bar on the main app screens — never during
  // onboarding, auth, join, or coach flows (which would cover their buttons).
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const showNav = ["/dashboard", "/log", "/history"].includes(normalizedPath);
  if (!mounted || !hasSession || !showNav) return null;

  const tabs = [
    { href: "/dashboard", icon: House, label: "Home" },
    { href: "/log", icon: PlusCircle, label: null },
    { href: "/history", icon: BarChart2, label: "History" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-stretch justify-around"
      style={{
        backgroundColor: "#0a0a0a",
        borderTop: "1px solid #222222",
        height: "calc(52px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        const isLog = href === "/log";

        return (
          <Link
            key={href}
            href={href}
            onClick={() => tapLight()}
            className="flex flex-col items-center justify-center flex-1 relative"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Active pill indicator — top edge, not shown on Log tab */}
            {!isLog && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 32,
                  height: 3,
                  backgroundColor: "#3B82F6",
                  borderRadius: "0 0 4px 4px",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              />
            )}

            <Icon
              size={isLog ? 25 : 20}
              strokeWidth={isActive || isLog ? 2.2 : 1.8}
              style={{
                color: isLog || isActive ? "#3B82F6" : "#888888",
                transition: "color 150ms ease",
              }}
            />

            {!isLog && label && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  marginTop: 4,
                  lineHeight: 1,
                  color: isActive ? "#3B82F6" : "#888888",
                  transition: "color 150ms ease",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
