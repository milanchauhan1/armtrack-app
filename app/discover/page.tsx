"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FollowButton from "@/components/FollowButton";

interface Result {
  id: string;
  username: string;
  first_name: string | null;
  position: string | null;
  level: string | null;
}

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const term = q.trim();
    if (term.length < 2) {
      timer.current = setTimeout(() => {
        setResults([]);
        setSearched(false);
        setSearching(false);
      }, 0);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      // Searches the public_profiles view → only public, claimed profiles surface.
      const { data } = await supabase
        .from("public_profiles")
        .select("id, username, first_name, position, level")
        .ilike("username", `%${term}%`)
        .limit(25);
      setResults((data ?? []) as Result[]);
      setSearching(false);
      setSearched(true);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
          <ArrowLeft size={16} /> Back
        </Link>
        <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </Link>
        <span className="w-12" />
      </div>

      <div className="flex flex-1 justify-center px-4 py-4">
        <div className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">Find players</h1>
          <p className="mb-6 text-sm text-gray-400">Search by username and follow your favorite arms.</p>

          {/* Search box */}
          <div
            className="mb-6 flex items-center gap-2 rounded-xl px-3"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <Search size={16} className="text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              className="flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-600 outline-none"
            />
            {searching && <span className="text-xs text-gray-500">…</span>}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: "#0d0d0d", border: "1px solid #1c1c1c" }}
                >
                  <Link href={`/u/${r.username}/`} className="flex flex-1 items-center gap-3">
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
                      style={{ background: "linear-gradient(145deg,#3B82F6,#1d4ed8)" }}
                    >
                      {(r.first_name || r.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{r.first_name || "Player"}</p>
                      <p className="truncate text-xs text-blue-400">
                        @{r.username}
                        {r.position ? <span className="text-gray-500"> · {r.position}</span> : null}
                      </p>
                    </div>
                  </Link>
                  <FollowButton targetId={r.id} size="sm" />
                </div>
              ))}
            </div>
          )}

          {searched && !searching && results.length === 0 && (
            <p className="mt-6 text-center text-sm text-gray-500">No players found for &ldquo;{q.trim()}&rdquo;.</p>
          )}
        </div>
      </div>
    </div>
  );
}
