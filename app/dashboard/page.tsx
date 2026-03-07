"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();
      if (!profile?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }
      setUser(user);
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/30 hover:text-white cursor-pointer"
        >
          Sign out
        </button>
      </nav>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            style={{
              width: 600,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Dashboard
          </p>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Welcome to ArmTrack
          </h1>
          <p className="text-base text-gray-400">{user?.email}</p>

          {/* Placeholder card */}
          <div
            className="mt-12 w-full max-w-md rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            <div className="mb-4 text-4xl">📊</div>
            <h2 className="mb-2 text-lg font-bold text-white">
              Your dashboard is coming soon
            </h2>
            <p className="text-sm text-gray-400">
              Daily logs, trends, and arm health insights will appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
