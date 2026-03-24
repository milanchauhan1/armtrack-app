"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, UserPlus, Settings } from "lucide-react";

interface Tab {
  href: string | null;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

const TABS: Tab[] = [
  { href: "/coach/dashboard", icon: House, label: "Home" },
  { href: "/coach/invite", icon: UserPlus, label: "Invite" },
  { href: null, icon: Settings, label: "Settings", disabled: true },
];

export default function CoachBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-black px-2 py-2"
      style={{ borderTop: "1px solid #111111" }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.href ? pathname === tab.href : false;
        const color = tab.disabled ? "#333333" : active ? "#3B82F6" : "#555555";

        if (tab.disabled) {
          return (
            <div
              key={tab.label}
              className="flex flex-col items-center gap-0.5 px-6 py-1.5 cursor-not-allowed"
            >
              <Icon size={20} style={{ color }} />
              <span className="text-[10px] font-medium" style={{ color }}>
                {tab.label}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href!}
            className="flex flex-col items-center gap-0.5 px-6 py-1.5 transition-all duration-150"
          >
            <Icon size={20} style={{ color }} />
            <span className="text-[10px] font-medium" style={{ color }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
