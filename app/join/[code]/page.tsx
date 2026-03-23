"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TeamInfo {
  id: string;
  name: string;
  coach_name: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JoinCodePage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [alreadyOnTeam, setAlreadyOnTeam] = useState(false);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    async function load() {
      const { code: resolvedCode } = await params;
      const upperCode = resolvedCode.toUpperCase();
      setCode(upperCode);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store invite code for post-auth redirect (cookie for server callback + localStorage for client)
        document.cookie = `armtrack-pending-invite=${upperCode}; path=/; max-age=3600; SameSite=Lax`;
        localStorage.setItem("armtrack-pending-invite", upperCode);
        setLoggedIn(false);
        setChecking(false);
        return;
      }

      setLoggedIn(true);

      // Check if already on a team
      const { data: profile } = await supabase
        .from("profiles")
        .select("team_id")
        .eq("id", user.id)
        .single();

      if (profile?.team_id) {
        setAlreadyOnTeam(true);
        setChecking(false);
        return;
      }

      // Look up the team
      const { data: team } = await supabase
        .from("teams")
        .select("id, name, coach_id")
        .eq("code", upperCode)
        .single();

      if (!team) {
        setInvalidCode(true);
        setChecking(false);
        return;
      }

      // Fetch coach name
      const { data: coach } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", team.coach_id)
        .single();

      setTeamInfo({
        id: team.id,
        name: team.name,
        coach_name: coach?.first_name ?? "Coach",
      });
      setChecking(false);
    }
    load();
  }, [params]);

  async function handleJoin() {
    if (!teamInfo) return;
    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      await supabase
        .from("team_members")
        .upsert({ team_id: teamInfo.id, player_id: user.id }, { onConflict: "team_id,player_id" });

      await supabase
        .from("profiles")
        .upsert({ id: user.id, team_id: teamInfo.id });

      localStorage.removeItem("armtrack-pending-invite");
      sessionStorage.setItem("toast", `You joined ${teamInfo.name}`);
      setJoined(true);
      setTimeout(() => router.replace("/dashboard"), 1200);
    } catch {
      setJoining(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="w-full"
        style={{ maxWidth: 400 }}
      >
        <div
          className="rounded-2xl p-7 flex flex-col gap-6"
          style={{ backgroundColor: "#111111", border: "1px solid #222222", boxShadow: "0 0 40px rgba(59,130,246,0.08)" }}
        >
          <span className="text-xl font-extrabold tracking-tight text-white">
            Arm<span className="text-blue-500">Track</span>
          </span>

          {/* Not logged in */}
          {!loggedIn && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">Team Invite</p>
                <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">
                  You&apos;re invited!
                </h1>
                <p className="text-sm" style={{ color: "#888888" }}>
                  You need an account to join this team.
                </p>
              </div>
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <AlertCircle size={15} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
                <p className="text-sm" style={{ color: "#888888" }}>
                  Your invite code <span className="font-bold text-white">{code}</span> will be saved automatically.
                </p>
              </div>
              <Link
                href="/signup"
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all hover:opacity-90"
                style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
              >
                Sign Up
              </Link>
              <p className="text-center text-sm" style={{ color: "#555555" }}>
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Log In
                </Link>
              </p>
            </div>
          )}

          {/* Already on a team */}
          {loggedIn && alreadyOnTeam && (
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">Already on a team</h1>
                <p className="text-sm" style={{ color: "#888888" }}>
                  You&apos;re already on a team. Visit your dashboard.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all hover:opacity-90"
                style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Invalid code */}
          {loggedIn && invalidCode && (
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">Link not found</h1>
                <p className="text-sm" style={{ color: "#888888" }}>
                  This invite link is no longer valid. Ask your coach for a new one.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-center transition-all"
                style={{ backgroundColor: "#111111", border: "1px solid #222222", color: "#888888" }}
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Can join */}
          {loggedIn && !alreadyOnTeam && !invalidCode && teamInfo && (
            <div className="flex flex-col gap-5">
              {joined ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                >
                  <CheckCircle size={40} style={{ color: "#22C55E" }} />
                  <div>
                    <p className="text-base font-bold text-white">You joined {teamInfo.name}</p>
                    <p className="text-xs mt-1" style={{ color: "#555555" }}>Redirecting...</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">Team Invite</p>
                    <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">
                      {teamInfo.name}
                    </h1>
                    <p className="text-sm" style={{ color: "#888888" }}>
                      Coach: {teamInfo.coach_name}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleJoin}
                    disabled={joining}
                    whileTap={joining ? {} : { scale: 0.97 }}
                    className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
                  >
                    {joining ? "Joining..." : `Join ${teamInfo.name}`}
                  </motion.button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
