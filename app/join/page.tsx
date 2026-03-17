"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle, AlertCircle } from "lucide-react";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JoinPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Read code from URL
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode) setCode(urlCode.toUpperCase().trim());

    // Check session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setLoggedIn(true);
        setUserId(user.id);
      } else {
        // Store code in localStorage so it auto-fills after signup
        if (urlCode) {
          localStorage.setItem("pending_team_code", urlCode.toUpperCase().trim());
        }
      }
      setAuthChecking(false);
    });
  }, []);

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 6) {
      setError("Enter a valid 6-character team code.");
      return;
    }
    if (!userId) return;

    setJoining(true);
    setError("");

    try {
      // Look up team by code
      const { data: team, error: teamErr } = await supabase
        .from("teams")
        .select("id, name")
        .eq("code", trimmed)
        .single();

      if (teamErr || !team) {
        setError("Team code not found. Check with your coach and try again.");
        setJoining(false);
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("player_id", userId)
        .single();

      if (!existing) {
        const { error: insertErr } = await supabase
          .from("team_members")
          .insert({ team_id: team.id, player_id: userId });

        if (insertErr) {
          setError("Something went wrong. Try again.");
          setJoining(false);
          return;
        }
      }

      // Clear any stored pending code
      localStorage.removeItem("pending_team_code");

      // Store toast for dashboard
      sessionStorage.setItem("toast", `You joined ${team.name}`);
      setSuccess(team.name);

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
    } catch {
      setError("Something went wrong. Try again.");
      setJoining(false);
    }
  }

  if (authChecking) {
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
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
        style={{ maxWidth: 400 }}
      >
        <div
          className="rounded-2xl p-7 flex flex-col gap-6"
          style={{
            backgroundColor: "#111111",
            border: "1px solid #222222",
            boxShadow: "0 0 40px rgba(59,130,246,0.08)",
          }}
        >
          {/* Header */}
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Arm<span className="text-blue-500">Track</span>
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mt-3 mb-1">
              Team Join
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
              Join your team
            </h1>
            <p className="text-sm" style={{ color: "#888888" }}>
              Enter the 6-character code your coach gave you.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-4 text-center"
              >
                <CheckCircle size={40} style={{ color: "#22C55E" }} />
                <div>
                  <p className="text-base font-bold text-white">You joined {success}</p>
                  <p className="text-xs mt-1" style={{ color: "#555555" }}>
                    Redirecting to your dashboard...
                  </p>
                </div>
              </motion.div>
            ) : !loggedIn ? (
              /* Not logged in */
              <motion.div key="not-logged-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <div
                  className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <AlertCircle size={16} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-sm" style={{ color: "#888888" }}>
                    You need an account to join a team. Create one first — your code will be saved.
                  </p>
                </div>

                {/* Show the code they have */}
                {code && (
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#555555" }}>
                      Your team code
                    </p>
                    <span
                      className="text-2xl font-black tracking-[0.3em]"
                      style={{ color: "#3B82F6" }}
                    >
                      {code}
                    </span>
                  </div>
                )}

                <Link
                  href="/signup"
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all hover:opacity-90"
                  style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
                >
                  Create an account
                </Link>

                <p className="text-center text-sm" style={{ color: "#555555" }}>
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* Logged in — show join form */
              <motion.div key="join-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && code.trim().length === 6) handleJoin();
                  }}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.3em] text-white placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: "#141414", border: "2px solid #252525", letterSpacing: "0.3em" }}
                  autoFocus
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 text-center -mt-1"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleJoin}
                  disabled={joining || code.trim().length !== 6}
                  whileTap={joining || code.trim().length !== 6 ? {} : { scale: 0.97 }}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
                >
                  {joining ? "Joining..." : "Join Team"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
