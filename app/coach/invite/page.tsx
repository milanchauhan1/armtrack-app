"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoachBottomNav from "@/app/coach/components/CoachBottomNav";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Team {
  id: string;
  code: string;
  name: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── CopyBtn ───────────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer flex-shrink-0"
      style={{
        backgroundColor: copied ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.10)",
        border: copied ? "1px solid rgba(34,197,94,0.30)" : "1px solid rgba(59,130,246,0.25)",
        color: copied ? "#22C55E" : "#60a5fa",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoachInvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete, role")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_complete) { router.replace("/onboarding"); return; }
      if (profile?.role !== "coach") { router.replace("/dashboard"); return; }

      const { data: teamData } = await supabase
        .from("teams")
        .select("id, code, name")
        .eq("coach_id", user.id)
        .single();

      if (!teamData) { router.replace("/coach/dashboard"); return; }
      setTeam(teamData as Team);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRegenerate() {
    if (!team) return;
    setRegenerating(true);
    const newCode = generateCode();
    const { error } = await supabase
      .from("teams")
      .update({ code: newCode })
      .eq("id", team.id);
    if (!error) setTeam({ ...team, code: newCode });
    setRegenerating(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  if (!team) return null;

  const inviteUrl = `https://armtrack.app/join/${team.code}`;

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4"
        style={{ borderBottom: "1px solid #111111" }}
      >
        <Link href="/coach/dashboard" className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </Link>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/30 hover:text-white cursor-pointer"
        >
          Sign out
        </button>
      </nav>

      <div className="mx-auto px-5 pt-8" style={{ maxWidth: 560 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
              Coach Dashboard
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
              Invite Your Players
            </h1>
            <p className="text-sm" style={{ color: "#888888" }}>
              Share this link or code with your players to add them to your team.
            </p>
          </div>

          {/* Invite link card */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#555555" }}>
                Invite Link
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm font-mono break-all"
                  style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e", color: "#60a5fa" }}
                >
                  {inviteUrl}
                </span>
                <CopyBtn text={inviteUrl} label="Copy Link" />
              </div>
            </div>

            <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 16 }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#555555" }}>
                Invite Code
              </p>
              <div className="flex items-center gap-4">
                <span
                  className="text-4xl font-black tabular-nums"
                  style={{ fontFamily: "monospace", color: "#ffffff", letterSpacing: "0.25em" }}
                >
                  {team.code}
                </span>
                <CopyBtn text={team.code} label="Copy Code" />
              </div>
            </div>
          </div>

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#111111", border: "1px solid #222222", color: "#888888" }}
            onMouseEnter={(e) => !regenerating && (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Regenerating..." : "Regenerate Code"}
          </button>

          <p className="text-xs text-center" style={{ color: "#444444" }}>
            Regenerating the code will invalidate your current invite link.
          </p>
        </motion.div>
      </div>
      <CoachBottomNav />
    </div>
  );
}
