"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, LogOut, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateUsername } from "@/lib/profile";

type Visibility = "public" | "unlisted" | "private";

const VIS_OPTIONS: { value: Visibility; label: string; hint: string }[] = [
  { value: "public", label: "Public", hint: "Anyone can find and view" },
  { value: "unlisted", label: "Unlisted", hint: "Only people with the link" },
  { value: "private", label: "Private", hint: "Only you" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [velo, setVelo] = useState("");
  const [pop, setPop] = useState("");
  const [sixty, setSixty] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameOk, setUsernameOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load auth + current profile. On a failed load, show the retry screen
  // instead of a blank form — saving a blank form would wipe the profile.
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data: { user } }) => {
        if (!user) {
          router.replace("/login");
          return;
        }
        setUserId(user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("username, bio, visibility, pr_velocity_mph, pr_pop_time_s, pr_sixty_time_s")
          .eq("id", user.id)
          .single();
        if (error) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        if (data) {
          setUsername(data.username ?? "");
          setBio(data.bio ?? "");
          setVisibility((data.visibility as Visibility) ?? "public");
          setVelo(data.pr_velocity_mph != null ? String(data.pr_velocity_mph) : "");
          setPop(data.pr_pop_time_s != null ? String(data.pr_pop_time_s) : "");
          setSixty(data.pr_sixty_time_s != null ? String(data.pr_sixty_time_s) : "");
          if (data.username) setUsernameOk(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, [router]);

  // Debounced username validation + availability. State updates run inside
  // timers (cancelled by the effect cleanup on every keystroke), never in the
  // sync effect body.
  useEffect(() => {
    if (!userId) return;

    const v = validateUsername(username);
    if (!v.ok) {
      const t = setTimeout(() => {
        setUsernameOk(false);
        setUsernameError(username.length === 0 ? null : v.error);
        setChecking(false);
      }, 0);
      return () => clearTimeout(t);
    }

    const reset = setTimeout(() => {
      setChecking(true);
      setUsernameError(null);
      setUsernameOk(false);
    }, 0);
    const check = setTimeout(async () => {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        // _ is an ilike wildcard and is legal in usernames — escape it so
        // "m_lan" doesn't match "milan"
        .ilike("username", v.value.replaceAll("_", "\\_"))
        .neq("id", userId)
        .maybeSingle();
      setChecking(false);
      if (taken) {
        setUsernameError("That username is taken.");
        setUsernameOk(false);
      } else {
        setUsernameError(null);
        setUsernameOk(true);
      }
    }, 350);
    return () => {
      clearTimeout(reset);
      clearTimeout(check);
    };
  }, [username, userId]);

  async function handleSave() {
    if (!userId) return;
    const v = validateUsername(username);
    if (!v.ok) {
      setUsernameError(v.error);
      return;
    }
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: v.value,
        bio: bio.trim() || null,
        visibility,
        pr_velocity_mph: velo ? Math.round(Number(velo)) : null,
        pr_pop_time_s: pop ? Number(pop) : null,
        pr_sixty_time_s: sixty ? Number(sixty) : null,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      // 23505 = unique violation (username just taken)
      if ((error as { code?: string }).code === "23505") {
        setUsernameError("That username was just taken.");
        setUsernameOk(false);
      } else {
        setUsernameError(error.message);
      }
      return;
    }
    setSaved(true);
  }

  async function handleShare() {
    const v = validateUsername(username);
    if (!v.ok) return;
    const url = `${window.location.origin}/u/${v.value}`;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "My ArmTrack profile" });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied!");
      setTimeout(() => setShareMsg(null), 2000);
    } catch {
      setShareMsg(url);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleDelete() {
    // Two-tap confirm
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setDeleteError(error.message || "Couldn't delete your account. Please try again.");
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
        >
          <WifiOff size={26} strokeWidth={1.75} className="text-gray-400" />
        </div>
        <div>
          <p className="text-base font-bold text-white">Couldn&apos;t load your profile</p>
          <p className="mt-1 text-sm text-gray-400">Check your connection and try again.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#3B82F6" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
      </div>
    );
  }

  const canSave = usernameOk && !checking && !saving;

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

      <div className="flex flex-1 justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">Your profile</h1>
          <p className="mb-7 text-sm text-gray-400">Claim your handle and show off your game.</p>

          <div className="flex flex-col gap-5 rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #222222" }}>
            {/* Username */}
            <Field label="Username">
              <div className="flex items-center gap-2 rounded-xl px-3" style={{ backgroundColor: "#1a1a1a", border: `1px solid ${usernameError ? "#7f1d1d" : "#2a2a2a"}` }}>
                <span className="shrink-0 text-sm text-gray-500">armtrack.app/u/</span>
                <input
                  value={username}
                  onChange={(e) => {
                    setSaved(false);
                    setUsername(e.target.value.replace(/\s/g, ""));
                  }}
                  placeholder="yourname"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-600 outline-none"
                />
                {checking && <span className="shrink-0 whitespace-nowrap text-xs text-gray-500">checking…</span>}
                {!checking && usernameOk && username && <span className="shrink-0 whitespace-nowrap text-xs text-green-500">available</span>}
              </div>
              {usernameError && <p className="mt-1.5 text-xs text-red-400">{usernameError}</p>}
            </Field>

            {/* Bio */}
            <Field label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                placeholder="RHP · class of 2028 · chasing 90"
                rows={2}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              />
              <p className="mt-1 text-right text-[11px] text-gray-600">{bio.length}/160</p>
            </Field>

            {/* PRs */}
            <Field label="Personal records (optional)">
              <div className="grid grid-cols-3 gap-2">
                <PrInput value={velo} onChange={setVelo} placeholder="82" unit="mph velo" step="1" />
                <PrInput value={pop} onChange={setPop} placeholder="1.9" unit="s pop" step="0.1" />
                <PrInput value={sixty} onChange={setSixty} placeholder="7.2" unit="s 60yd" step="0.1" />
              </div>
            </Field>

            {/* Visibility */}
            <Field label="Who can see it">
              <div className="grid grid-cols-3 gap-2">
                {VIS_OPTIONS.map((o) => {
                  const active = visibility === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setVisibility(o.value)}
                      className="rounded-xl px-2 py-2.5 text-center transition-colors"
                      style={{
                        backgroundColor: active ? "rgba(59,130,246,0.15)" : "#1a1a1a",
                        border: `1px solid ${active ? "#3B82F6" : "#2a2a2a"}`,
                      }}
                    >
                      <span className="block text-xs font-bold" style={{ color: active ? "#60a5fa" : "#fff" }}>
                        {o.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500">{VIS_OPTIONS.find((o) => o.value === visibility)!.hint}</p>
            </Field>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="mt-1 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
            </button>

            {/* Share */}
            {usernameOk && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <Share2 size={15} /> {shareMsg ?? "Share my profile"}
              </button>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            <LogOut size={16} /> Sign out
          </button>

          {/* Danger zone — in-app account deletion (App Store requirement) */}
          <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: "#140d0d", border: "1px solid #3b1a1a" }}>
            <p className="text-sm font-bold text-white">Delete account</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              Permanently deletes your account, profile, logs, and follows. This can&apos;t be undone.
            </p>
            {deleteError && <p className="mt-2 text-xs text-red-400">{deleteError}</p>}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
              style={{
                backgroundColor: confirmDelete ? "#dc2626" : "transparent",
                color: confirmDelete ? "#fff" : "#f87171",
                border: "1px solid #dc2626",
              }}
            >
              {deleting
                ? "Deleting…"
                : confirmDelete
                ? "Tap again to permanently delete"
                : "Delete my account"}
            </button>
            {confirmDelete && !deleting && (
              <button onClick={() => setConfirmDelete(false)} className="mt-2 w-full text-xs text-gray-500">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function PrInput({
  value,
  onChange,
  placeholder,
  unit,
  step,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit: string;
  step: string;
}) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base font-bold text-white placeholder-gray-600 outline-none"
      />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{unit}</span>
    </div>
  );
}
