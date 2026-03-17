"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArmLog, calculateEstimatedReadiness } from "@/lib/readiness";
import { Copy, Check, Users, AlertTriangle, AlertCircle } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Team {
  id: string;
  name: string;
  code: string;
  coach_id: string;
}

interface PlayerProfile {
  id: string;
  first_name: string;
  position: string | null;
  level: string | null;
  throws: string | null;
  injury_history: string | null;
}

interface PlayerEntry {
  player_id: string;
  profile: PlayerProfile;
  logs: ArmLog[];
  readiness: number | null;
  streak: number;
  daysSinceLast: number | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDay(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const today = getTodayString();
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  if (!set.has(cursor)) return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

function daysSince(dateStr: string): number {
  const today = new Date();
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getBorderColor(loggedToday: boolean, readiness: number | null): string {
  if (!loggedToday || readiness === null) return "#2a2a2a";
  if (readiness < 4) return "#EF4444";
  if (readiness < 7) return "#F59E0B";
  return "#22C55E";
}

function getSortPriority(entry: PlayerEntry, today: string): number {
  const loggedToday = entry.logs[0]?.date === today;
  if (!loggedToday || entry.readiness === null) return 3;
  if (entry.readiness < 4) return 0;
  if (entry.readiness < 7) return 1;
  return 2;
}

// ── Animation ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer flex-shrink-0"
      style={{
        backgroundColor: copied ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.1)",
        border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(59,130,246,0.25)",
        color: copied ? "#22C55E" : "#60a5fa",
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoachPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<PlayerEntry[]>([]);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }
      if (profile?.role !== "coach") {
        router.replace("/dashboard");
        return;
      }

      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("coach_id", user.id)
        .single();

      if (!teamData) {
        setLoading(false);
        return;
      }
      setTeam(teamData as Team);

      const { data: members } = await supabase
        .from("team_members")
        .select("player_id")
        .eq("team_id", teamData.id);

      if (!members?.length) {
        setLoading(false);
        return;
      }

      const playerIds = members.map((m: { player_id: string }) => m.player_id);
      const today = getTodayString();

      const [{ data: profiles }, { data: recentLogs }, { data: allDates }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, position, level, throws, injury_history")
          .in("id", playerIds),
        supabase
          .from("arm_logs")
          .select(
            "id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes, user_id"
          )
          .in("user_id", playerIds)
          .gte("date", shiftDay(today, -13))
          .order("date", { ascending: false }),
        supabase.from("arm_logs").select("user_id, date").in("user_id", playerIds),
      ]);

      const profileMap = new Map(
        (profiles ?? []).map((p: PlayerProfile) => [p.id, p])
      );

      const recentByPlayer = new Map<string, ArmLog[]>();
      (recentLogs ?? []).forEach((l: ArmLog & { user_id: string }) => {
        const arr = recentByPlayer.get(l.user_id) ?? [];
        arr.push(l);
        recentByPlayer.set(l.user_id, arr);
      });

      const allDatesByPlayer = new Map<string, string[]>();
      (allDates ?? []).forEach((l: { user_id: string; date: string }) => {
        const arr = allDatesByPlayer.get(l.user_id) ?? [];
        arr.push(l.date);
        allDatesByPlayer.set(l.user_id, arr);
      });

      const entries: PlayerEntry[] = playerIds.map((pid: string) => {
        const profile = profileMap.get(pid) ?? {
          id: pid,
          first_name: "Player",
          position: null,
          level: null,
          throws: null,
          injury_history: null,
        };
        const logs = recentByPlayer.get(pid) ?? [];
        const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        const logs7 = sortedLogs.slice(0, 7);
        const readiness = calculateEstimatedReadiness(logs7);
        const streak = computeStreak(allDatesByPlayer.get(pid) ?? []);
        const daysSinceLast = sortedLogs.length > 0 ? daysSince(sortedLogs[0].date) : null;
        return { player_id: pid, profile, logs: sortedLogs, readiness, streak, daysSinceLast };
      });

      entries.sort((a, b) => getSortPriority(a, today) - getSortPriority(b, today));
      setRoster(entries);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleCreateTeam() {
    if (!teamNameInput.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const code = generateCode();
      const { data, error } = await supabase
        .from("teams")
        .insert({ coach_id: user.id, name: teamNameInput.trim(), code })
        .select()
        .single();
      if (error) throw error;
      setTeam(data as Team);
    } catch {
      setCreateError("Something went wrong. Try again.");
    } finally {
      setCreating(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Team creation screen ──────────────────────────────────────────────────

  if (!team) {
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-1">
                Coach Dashboard
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                Create your team
              </h1>
              <p className="text-sm" style={{ color: "#888888" }}>
                Give your team a name. Players join using an invite code you share with them.
              </p>
            </div>

            <input
              type="text"
              value={teamNameInput}
              onChange={(e) => setTeamNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && teamNameInput.trim()) handleCreateTeam();
              }}
              placeholder="e.g. Lincoln Eagles 14U"
              className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "#141414", border: "2px solid #252525" }}
              autoFocus
            />

            {createError && <p className="text-sm text-red-400 -mt-2">{createError}</p>}

            <motion.button
              onClick={handleCreateTeam}
              disabled={creating || !teamNameInput.trim()}
              whileTap={creating || !teamNameInput.trim() ? {} : { scale: 0.97 }}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "#3B82F6", boxShadow: "0 4px 28px rgba(59,130,246,0.35)" }}
            >
              {creating ? "Creating..." : "Create Team"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Roster dashboard ──────────────────────────────────────────────────────

  const today = getTodayString();
  const inviteUrl = `https://armtrack.app/join?code=${team.code}`;
  const notLoggedIn3Days = roster.filter((p) => p.daysSinceLast !== null && p.daysSinceLast >= 3);
  const redToday = roster.filter(
    (p) => p.logs[0]?.date === today && p.readiness !== null && p.readiness < 4
  );

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4"
        style={{ borderBottom: "1px solid #111111" }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition-all duration-150 hover:border-white/30 hover:text-white cursor-pointer"
        >
          Sign out
        </button>
      </nav>

      <div className="mx-auto max-w-2xl px-5 pt-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-2">
            Coach Dashboard
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                {team.name}
              </h1>
              <p className="text-xs mt-1" style={{ color: "#555555" }}>
                {roster.length} {roster.length === 1 ? "player" : "players"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888888" }}
                >
                  Code: {team.code}
                </span>
                <CopyBtn text={team.code} />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] max-w-[180px] truncate"
                  style={{ color: "#444444" }}
                >
                  {inviteUrl}
                </span>
                <CopyBtn text={inviteUrl} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Alert bar ───────────────────────────────────────────────────── */}
        {(redToday.length > 0 || notLoggedIn3Days.length > 0) && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-4 flex flex-col gap-2"
          >
            {redToday.length > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertCircle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                <p className="text-sm font-semibold" style={{ color: "#EF4444" }}>
                  {redToday.length}{" "}
                  {redToday.length === 1 ? "player needs" : "players need"} rest today
                </p>
              </div>
            )}
            {notLoggedIn3Days.length > 0 && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <AlertTriangle size={15} style={{ color: "#F59E0B", flexShrink: 0 }} />
                <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
                  {notLoggedIn3Days.length}{" "}
                  {notLoggedIn3Days.length === 1 ? "player hasn't" : "players haven't"} logged in
                  3+ days
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Roster ──────────────────────────────────────────────────────── */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
          <p className="text-sm font-bold text-white mb-3">Roster</p>

          {roster.length === 0 ? (
            <div
              className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
              style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e" }}
            >
              <Users size={32} style={{ color: "#333333" }} />
              <div>
                <p className="text-base font-bold text-white mb-1">No players yet</p>
                <p className="text-xs" style={{ color: "#555555" }}>
                  Share the invite code and your players will appear here.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-lg px-4 py-2 text-sm font-bold tracking-widest"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaaaaa" }}
                >
                  {team.code}
                </span>
                <CopyBtn text={team.code} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {roster.map((player, i) => {
                const loggedToday = player.logs[0]?.date === today;
                const bc = getBorderColor(loggedToday, player.readiness);
                const lastLogLabel = !player.logs[0]
                  ? "Never logged"
                  : player.daysSinceLast === 0
                  ? "Today"
                  : player.daysSinceLast === 1
                  ? "Yesterday"
                  : `${player.daysSinceLast}d ago`;

                return (
                  <motion.div
                    key={player.player_id}
                    custom={i + 3}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                  >
                    <Link href={`/coach/player/${player.player_id}`}>
                      <div
                        className="rounded-2xl p-4 transition-colors duration-150"
                        style={{
                          backgroundColor: "#111111",
                          border: "1px solid #222222",
                          borderLeft: `3px solid ${bc}`,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#161616")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#111111")
                        }
                      >
                        <div className="flex items-center gap-4">
                          {/* Left: name + position */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white leading-tight">
                              {player.profile.first_name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#555555" }}>
                              {[player.profile.position, player.profile.level]
                                .filter(Boolean)
                                .join(" · ") || "No position set"}
                            </p>
                          </div>

                          {/* Center: readiness */}
                          <div className="flex flex-col items-center w-16 flex-shrink-0">
                            {loggedToday && player.readiness !== null ? (
                              <>
                                <span
                                  className="text-xl font-black tabular-nums leading-none"
                                  style={{ color: bc }}
                                >
                                  {player.readiness.toFixed(1)}
                                </span>
                                <span
                                  className="text-[9px] font-semibold uppercase tracking-wide mt-0.5"
                                  style={{ color: "#555555" }}
                                >
                                  readiness
                                </span>
                              </>
                            ) : (
                              <span
                                className="text-xs font-semibold text-center leading-tight"
                                style={{ color: "#555555" }}
                              >
                                Not logged
                              </span>
                            )}
                          </div>

                          {/* Right: streak + last log */}
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-xs font-semibold" style={{ color: "#555555" }}>
                              {player.streak > 0 ? `${player.streak} day streak` : "No streak"}
                            </span>
                            <span className="text-[10px] mt-0.5" style={{ color: "#444444" }}>
                              {lastLogLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
