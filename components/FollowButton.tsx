"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * Follow / Following toggle for a target profile.
 * - Hidden on your own profile.
 * - Logged-out viewers see a "Follow" that routes to signup.
 * - Optimistic toggle; reverts on error.
 */
export default function FollowButton({
  targetId,
  size = "md",
  onCountChange,
}: {
  targetId: string;
  size?: "sm" | "md";
  onCountChange?: (delta: number) => void;
}) {
  const [me, setMe] = useState<string | null | undefined>(undefined); // undefined = loading
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted.current) return;
      if (!user) {
        setMe(null);
        return;
      }
      setMe(user.id);
      if (user.id === targetId) return; // own profile
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", targetId)
        .maybeSingle();
      if (mounted.current) setFollowing(!!data);
    });
    return () => {
      mounted.current = false;
    };
  }, [targetId]);

  // Own profile → render nothing
  if (me === targetId) return null;

  const pad = size === "sm" ? "6px 14px" : "9px 20px";
  const font = size === "sm" ? 13 : 14;

  // Logged out → prompt signup
  if (me === null) {
    return (
      <Link
        href="/signup"
        style={{
          display: "inline-block",
          background: "#3B82F6",
          color: "#fff",
          fontSize: font,
          fontWeight: 700,
          textDecoration: "none",
          padding: pad,
          borderRadius: 999,
        }}
      >
        Follow
      </Link>
    );
  }

  if (me === undefined) {
    return (
      <span style={{ display: "inline-block", padding: pad, fontSize: font, color: "#71717a" }}>…</span>
    );
  }

  async function toggle() {
    if (busy || me == null) return;
    setBusy(true);
    const next = !following;
    setFollowing(next); // optimistic
    onCountChange?.(next ? 1 : -1);
    const { error } = next
      ? await supabase.from("follows").insert({ follower_id: me, following_id: targetId })
      : await supabase.from("follows").delete().eq("follower_id", me).eq("following_id", targetId);
    if (error && mounted.current) {
      setFollowing(!next); // revert
      onCountChange?.(next ? -1 : 1);
    }
    if (mounted.current) setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        display: "inline-block",
        fontSize: font,
        fontWeight: 700,
        padding: pad,
        borderRadius: 999,
        cursor: "pointer",
        transition: "background 0.15s ease, border-color 0.15s ease",
        background: following ? "#1a1a1a" : "#3B82F6",
        color: following ? "#e5e5e5" : "#fff",
        border: following ? "1px solid #2a2a2a" : "1px solid #3B82F6",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
