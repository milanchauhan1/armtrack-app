"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { displayedStreak, formatTrackingSince } from "@/lib/profile";
import FollowButton from "@/components/FollowButton";

interface PublicProfile {
  id: string;
  username: string;
  first_name: string | null;
  position: string | null;
  level: string | null;
  throws: string | null;
  team_name: string | null;
  bio: string | null;
  visibility: "public" | "unlisted" | "private";
  pr_velocity_mph: number | null;
  pr_pop_time_s: number | null;
  pr_sixty_time_s: number | null;
  total_logs: number | null;
  current_streak: number | null;
  last_log_date: string | null;
  first_log_date: string | null;
}

const LEVEL_LABEL: Record<string, string> = {
  youth: "Youth",
  "high-school": "High School",
  college: "College",
  recreational: "Recreational",
};

function handleFromPath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.replace(/\/+$/, "").split("/").pop() ?? "";
}

export default function PublicProfileClient() {
  const [status, setStatus] = useState<"loading" | "ok" | "private" | "notfound">("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    (async () => {
      const handle = handleFromPath();
      if (!handle || handle === "_") {
        await Promise.resolve(); // keep state updates out of the sync effect body
        setStatus("notfound");
        return;
      }

      // Reads from the public_profiles view, which exposes ONLY safe columns
      // (never injury_history / pain_zones) and only non-private rows.
      const { data: prof } = await supabase
        .from("public_profiles")
        .select(
          "id, username, first_name, position, level, throws, team_name, bio, visibility, pr_velocity_mph, pr_pop_time_s, pr_sixty_time_s, total_logs, current_streak, last_log_date, first_log_date"
        )
        // Escape ilike wildcards — _ is legal in usernames and % can appear in URLs.
        .ilike("username", handle.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_"))
        .maybeSingle();

      if (!prof || !prof.username) {
        setStatus("notfound");
        return;
      }
      if (prof.visibility === "private") {
        setStatus("private");
        return;
      }
      if (prof.visibility !== "public") {
        const m = document.createElement("meta");
        m.name = "robots";
        m.content = "noindex";
        document.head.appendChild(m);
      }

      setProfile(prof as PublicProfile);
      setStatus("ok");

      // Follower / following counts (public follow graph)
      const [{ count: fc }, { count: gc }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", prof.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", prof.id),
      ]);
      setFollowers(fc ?? 0);
      setFollowingCount(gc ?? 0);
    })();
  }, []);

  if (status === "loading") {
    return (
      <Centered>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
      </Centered>
    );
  }
  if (status === "notfound") {
    return (
      <Centered>
        <Message title="Profile not found" body="This profile doesn't exist or hasn't been claimed yet." />
      </Centered>
    );
  }
  if (status === "private") {
    return (
      <Centered>
        <Message title="This profile is private" body="The player has chosen to keep their profile private." />
      </Centered>
    );
  }

  const p = profile!;
  const initial = (p.first_name || p.username).charAt(0).toUpperCase();
  const chips = [
    p.position,
    p.level ? LEVEL_LABEL[p.level] ?? p.level : null,
    p.throws ? `${p.throws.charAt(0).toUpperCase()}${p.throws.slice(1)}-handed` : null,
    p.team_name,
  ].filter(Boolean) as string[];

  const prs = [
    p.pr_velocity_mph != null ? { label: "Top velo", value: `${p.pr_velocity_mph} mph` } : null,
    p.pr_pop_time_s != null ? { label: "Pop time", value: `${p.pr_pop_time_s}s` } : null,
    p.pr_sixty_time_s != null ? { label: "60-yd", value: `${p.pr_sixty_time_s}s` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const statItems = [
    { label: "Day streak", value: String(displayedStreak(p.current_streak ?? 0, p.last_log_date)) },
    { label: "Total logs", value: String(p.total_logs ?? 0) },
    { label: "Tracking since", value: formatTrackingSince(p.first_log_date) || "—" },
  ];

  return (
    <Centered>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
            Arm<span className="text-blue-500">Track</span>
          </Link>
        </div>

        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#111111", border: "1px solid #222222" }}>
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold text-white"
            style={{ background: "linear-gradient(145deg,#3B82F6,#1d4ed8)", boxShadow: "0 6px 20px rgba(59,130,246,0.4)" }}
          >
            {initial}
          </div>
          <h1 className="text-xl font-extrabold text-white">{p.first_name || "Player"}</h1>
          <p className="text-sm font-semibold text-blue-400">@{p.username}</p>

          {/* Follower / following counts */}
          <div className="mt-3 flex items-center justify-center gap-5">
            <span className="text-sm text-gray-400">
              <span className="font-bold text-white">{followers}</span> follower{followers === 1 ? "" : "s"}
            </span>
            <span className="text-sm text-gray-400">
              <span className="font-bold text-white">{followingCount}</span> following
            </span>
          </div>

          {/* Follow button (hidden on own profile / prompts signup when logged out) */}
          <div className="mt-4">
            <FollowButton targetId={p.id} onCountChange={(d) => setFollowers((n) => Math.max(0, n + d))} />
          </div>

          {p.bio && <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-gray-400">{p.bio}</p>}

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {prs.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              {prs.map((pr) => (
                <div key={pr.label} className="rounded-xl px-2 py-3" style={{ backgroundColor: "#161616", border: "1px solid #232323" }}>
                  <p className="text-base font-extrabold text-white">{pr.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{pr.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            {statItems.map((s) => (
              <div key={s.label}>
                <p className="text-base font-extrabold text-white">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-gray-500">Track your arm like {p.first_name || "this player"}.</p>
          <Link href="/signup" className="inline-block rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
            Get Started Free
          </Link>
        </div>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">{children}</div>;
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ backgroundColor: "#111111", border: "1px solid #222222" }}>
      <h1 className="mb-2 text-lg font-extrabold text-white">{title}</h1>
      <p className="text-sm text-gray-400">{body}</p>
      <Link href="/" className="mt-5 inline-block text-sm font-semibold text-blue-400">
        Go to ArmTrack
      </Link>
    </div>
  );
}
