"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ArmLog, calculateEstimatedReadiness, getReadinessState } from "@/lib/readiness";
import CoachBottomNav from "@/app/coach/components/CoachBottomNav";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CoachProfile {
  id: string;
  first_name: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  sport: string;
  coach_id: string;
}

interface PlayerProfile {
  id: string;
  first_name: string;
  position: string | null;
  level: string | null;
}

interface PlayerEntry {
  player_id: string;
  profile: PlayerProfile;
  logs: ArmLog[];
  readiness: number | null;
  loggedToday: boolean;
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

function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  return name;
}

function getBorderColor(loggedToday: boolean, readiness: number | null): string {
  if (!loggedToday || readiness === null) return "#2a2a2a";
  if (readiness < 4) return "#EF4444";
  if (readiness < 7) return "#F59E0B";
  return "#22C55E";
}

function groupPlayers(entries: PlayerEntry[]) {
  return {
    pitchers: entries.filter(
      (e) => e.profile.position === "Pitcher" || e.profile.position === "Two-Way"
    ),
    catchers: entries.filter((e) => e.profile.position === "Catcher"),
    positionPlayers: entries.filter((e) => {
      const pos = e.profile.position ?? "";
      return pos !== "Pitcher" && pos !== "Two-Way" && pos !== "Catcher";
    }),
  };
}

// ── Animation ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  index,
}: {
  label: string;
  value: number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex-1 rounded-2xl p-4 flex flex-col gap-1"
      style={{ backgroundColor: "#111111", border: "1px solid #222222", minWidth: 0 }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "#555555" }}
      >
        {label}
      </p>
      <p className="text-2xl font-black leading-none" style={{ color }}>
        {value}
      </p>
    </motion.div>
  );
}

function PlayerCard({ entry }: { entry: PlayerEntry }) {
  const rs = entry.readiness !== null ? getReadinessState(entry.readiness) : null;
  const latestLog = entry.logs[0] ?? null;

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-200"
      style={{
        backgroundColor: "#111111",
        border: `1px solid ${getBorderColor(entry.loggedToday, entry.readiness)}`,
        opacity: entry.loggedToday ? 1 : 0.5,
      }}
    >
      {/* Left */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm leading-tight truncate">
          {formatName(entry.profile.first_name)}
        </p>
        {entry.profile.position && (
          <span
            className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #333333", color: "#888888" }}
          >
            {entry.profile.position}
          </span>
        )}
        <p
          className="text-[11px] mt-1"
          style={{ color: entry.loggedToday ? "#22C55E" : "#555555" }}
        >
          {entry.loggedToday ? "Logged today ✓" : "Awaiting log"}
        </p>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 76 }}>
        {rs && entry.loggedToday ? (
          <>
            <span className="text-2xl font-black leading-none" style={{ color: rs.color }}>
              {entry.readiness?.toFixed(1)}
            </span>
            <span
              className="text-[10px] font-medium text-center leading-tight"
              style={{ color: rs.color }}
            >
              {rs.label}
            </span>
            {latestLog && (
              <div className="flex gap-1 mt-1">
                {[
                  `P${latestLog.pain_level}`,
                  `S${latestLog.soreness_level}`,
                  `St${latestLog.stiffness_level}`,
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333333",
                      color: "#666666",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-2xl font-black" style={{ color: "#333333" }}>
            —
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs whitespace-nowrap" style={{ color: "#555555" }}>
          {entry.loggedToday && latestLog != null
            ? `${latestLog.throws_count} throws`
            : "—"}
        </span>
        <Link
          href={`/coach/player/${entry.player_id}`}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
          style={{
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#60a5fa",
            backgroundColor: "rgba(59,130,246,0.08)",
          }}
        >
          View
        </Link>
      </div>
    </div>
  );
}

function PlayerSection({
  title,
  entries,
  open,
  onToggle,
  animIndex,
}: {
  title: string;
  entries: PlayerEntry[];
  open: boolean;
  onToggle: () => void;
  animIndex: number;
}) {
  if (!entries.length) return null;

  return (
    <motion.div
      custom={animIndex}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #222222" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors duration-150"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">{title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #333333", color: "#888888" }}
          >
            {entries.length}
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: "#555555",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{ borderTop: "1px solid #1a1a1a" }}
        >
          {entries.map((entry) => (
            <PlayerCard key={entry.player_id} entry={entry} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function NotifyModal({
  team,
  coachId,
  onClose,
}: {
  team: Team;
  coachId: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"remind" | "custom">("remind");
  const [message, setMessage] = useState(
    "Reminder: please log your arm health today in ArmTrack!"
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    await supabase.from("coach_messages").insert({
      team_id: team.id,
      coach_id: coachId,
      player_id: null,
      message: message.trim(),
      created_at: new Date().toISOString(),
    });
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }}
        className="w-full rounded-2xl p-6 flex flex-col gap-5"
        style={{
          maxWidth: 420,
          backgroundColor: "#111111",
          border: "1px solid #222222",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Notify Your Team</h2>
          <button onClick={onClose} className="cursor-pointer" style={{ color: "#555555" }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          {(["remind", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "remind")
                  setMessage("Reminder: please log your arm health today in ArmTrack!");
                else setMessage("");
              }}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all cursor-pointer"
              style={{
                backgroundColor: mode === m ? "rgba(59,130,246,0.12)" : "#0d0d0d",
                border:
                  mode === m
                    ? "1px solid rgba(59,130,246,0.3)"
                    : "1px solid #222222",
                color: mode === m ? "#60a5fa" : "#666666",
              }}
            >
              {m === "remind" ? "Remind to log" : "Custom message"}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none"
          style={{
            backgroundColor: "#0d0d0d",
            border: "1px solid #222222",
            color: "#ffffff",
            minHeight: 80,
          }}
        />

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#3B82F6",
            boxShadow: sent ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
          }}
        >
          {sent ? "Sent!" : sending ? "Sending..." : "Send to Team"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoachDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [roster, setRoster] = useState<PlayerEntry[]>([]);
  const [openSections, setOpenSections] = useState({
    pitchers: true,
    catchers: true,
    positionPlayers: true,
  });
  const [notifyOpen, setNotifyOpen] = useState(false);
  const today = getTodayString();

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
        .select("id, first_name, role, onboarding_complete")
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

      setCoachProfile({ id: profile.id, first_name: profile.first_name });

      const { data: teamData } = await supabase
        .from("teams")
        .select("id, name, code, sport, coach_id")
        .eq("coach_id", user.id)
        .single();

      setTeamLoaded(true);
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

      const [{ data: profiles }, { data: recentLogs }, { data: allDates }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, first_name, position, level")
            .in("id", playerIds),
          supabase
            .from("arm_logs")
            .select(
              "id, date, pain_level, soreness_level, stiffness_level, throws_count, activity_type, recovery_done, notes, user_id"
            )
            .in("user_id", playerIds)
            .gte("date", shiftDay(today, -13))
            .order("date", { ascending: false }),
          supabase
            .from("arm_logs")
            .select("user_id, date")
            .in("user_id", playerIds),
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
        };
        const logs = (recentByPlayer.get(pid) ?? []).sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        const readiness = calculateEstimatedReadiness(logs.slice(0, 7));
        const loggedToday = logs[0]?.date === today;
        const streak = computeStreak(allDatesByPlayer.get(pid) ?? []);
        const daysSinceLast =
          logs.length > 0 ? daysSince(logs[0].date) : null;
        return {
          player_id: pid,
          profile,
          logs,
          readiness,
          loggedToday,
          streak,
          daysSinceLast,
        };
      });

      // Sort: red attention first, then amber, then green, then not-logged
      entries.sort((a, b) => {
        const priority = (e: PlayerEntry): number => {
          if (!e.loggedToday || e.readiness === null) return 3;
          if (e.readiness < 4) return 0;
          if (e.readiness < 7) return 1;
          return 2;
        };
        return priority(a) - priority(b);
      });

      setRoster(entries);
      setLoading(false);
    }
    load();
  }, [router, today]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  // ── Empty states ───────────────────────────────────────────────────────────

  if (teamLoaded && !team) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-5 pb-24">
        <div
          className="w-full rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
          style={{ maxWidth: 400, backgroundColor: "#111111", border: "1px solid #222222" }}
        >
          <p className="font-bold text-white text-lg">No Team Yet</p>
          <p className="text-sm" style={{ color: "#888888" }}>
            Complete onboarding to create your team, then invite players.
          </p>
          <Link
            href="/onboarding"
            className="w-full rounded-2xl py-3 text-sm font-bold text-white text-center transition-all hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Complete Setup
          </Link>
        </div>
        <CoachBottomNav />
      </div>
    );
  }

  if (team && roster.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-5 pb-24">
        <div
          className="w-full rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
          style={{ maxWidth: 400, backgroundColor: "#111111", border: "1px solid #222222" }}
        >
          <p className="font-bold text-white text-lg">Your roster is empty.</p>
          <p className="text-sm" style={{ color: "#888888" }}>
            Share your invite link to add players to your team.
          </p>
          <Link
            href="/coach/invite"
            className="w-full rounded-2xl py-3 text-sm font-bold text-white text-center transition-all hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Invite Players
          </Link>
        </div>
        <CoachBottomNav />
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  const { pitchers, catchers, positionPlayers } = groupPlayers(roster);
  const total = roster.length;
  const loggedCount = roster.filter((e) => e.loggedToday).length;
  const notLoggedCount = total - loggedCount;
  const attentionCount = roster.filter(
    (e) => e.loggedToday && e.readiness !== null && e.readiness < 5.5
  ).length;

  const sportLabel: Record<string, string> = {
    baseball: "Baseball",
    softball: "Softball",
    both: "Baseball / Softball",
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between bg-black px-5 py-4"
        style={{ borderBottom: "1px solid #111111" }}
      >
        <Link
          href="/coach/dashboard"
          className="text-xl font-extrabold tracking-tight text-white"
        >
          Arm<span style={{ color: "#3B82F6" }}>Track</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: "#888888" }}>
            {coachProfile?.first_name}
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
            style={{ borderColor: "#222222", color: "#666666" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666666")}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="mx-auto px-4 pt-6" style={{ maxWidth: 900 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="flex flex-col gap-6"
        >
          {/* Team header */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {team!.name}
            </h1>
            {team!.sport && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  color: "#888888",
                }}
              >
                {sportLabel[team!.sport] ?? team!.sport}
              </span>
            )}
          </div>

          {/* Summary strip — 2×2 on mobile, 4-col on sm+ */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Players" value={total} color="#ffffff" index={0} />
            <StatCard label="Logged Today" value={loggedCount} color="#22C55E" index={1} />
            <StatCard label="Not Logged" value={notLoggedCount} color="#888888" index={2} />
            <StatCard label="Need Attention" value={attentionCount} color="#F59E0B" index={3} />
          </div>

          {/* Player sections */}
          <div className="flex flex-col gap-4">
            <PlayerSection
              title="Pitchers"
              entries={pitchers}
              open={openSections.pitchers}
              onToggle={() =>
                setOpenSections((s) => ({ ...s, pitchers: !s.pitchers }))
              }
              animIndex={4}
            />
            <PlayerSection
              title="Catchers"
              entries={catchers}
              open={openSections.catchers}
              onToggle={() =>
                setOpenSections((s) => ({ ...s, catchers: !s.catchers }))
              }
              animIndex={5}
            />
            <PlayerSection
              title="Position Players"
              entries={positionPlayers}
              open={openSections.positionPlayers}
              onToggle={() =>
                setOpenSections((s) => ({
                  ...s,
                  positionPlayers: !s.positionPlayers,
                }))
              }
              animIndex={6}
            />
          </div>
        </motion.div>
      </div>

      {/* Notify FAB */}
      <button
        onClick={() => setNotifyOpen(true)}
        className="fixed z-30 rounded-full p-4 cursor-pointer transition-all duration-150 hover:scale-105"
        style={{
          bottom: 84,
          right: 20,
          backgroundColor: "#3B82F6",
          boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
        }}
      >
        <Bell size={20} style={{ color: "#ffffff" }} />
      </button>

      {/* Notify modal */}
      <AnimatePresence>
        {notifyOpen && team && coachProfile && (
          <NotifyModal
            team={team}
            coachId={coachProfile.id}
            onClose={() => setNotifyOpen(false)}
          />
        )}
      </AnimatePresence>

      <CoachBottomNav />
    </div>
  );
}
