"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MailCheck } from "lucide-react";

export default function SaveProgressPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Only anonymous users have anything to "save". A user with a real account is
  // already saved → send them back.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!user.is_anonymous) {
        router.replace("/dashboard");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      setName(data?.first_name ?? "");
      setChecking(false);
    });
  }, [router]);

  // Link an email + password to the anonymous account — same user id, so all
  // their logs/profile carry over. With email confirmation on, the address is
  // verified via the link we send; the password is set immediately either way.
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          <MailCheck size={26} strokeWidth={1.75} className="text-blue-500" />
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-white">Almost there</h1>
        <p className="max-w-xs text-sm text-gray-400">
          We sent a link to <span className="font-semibold text-white">{email}</span> to lock in your
          account. Your data is safe on this device in the meantime.
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="mt-7 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
        >
          Back to my dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-7 pb-10 pt-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/logo.png" alt="ArmTrack" width={92} height={92} />

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white">
        Save your progress{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-2 max-w-xs text-sm text-gray-400">
        Keep your streak and sync across devices. Free, always.
      </p>

      <form onSubmit={handleSave} className="mt-7 flex w-full max-w-sm flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-xl bg-blue-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save my account"}
        </button>
      </form>

      <button
        onClick={() => router.replace("/dashboard")}
        className="mt-auto pt-8 text-sm text-gray-500"
      >
        Maybe later
      </button>
    </div>
  );
}
