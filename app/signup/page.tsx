"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MailCheck } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045C17.64 8.5664 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5932 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9582H0.957273C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9255L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const [ageOk, setAgeOk] = useState(false);

  useEffect(() => {
    import("@capacitor/core").then(({ Capacitor }) => {
      setIsNative(Capacitor.isNativePlatform());
    }).catch(() => {});
  }, []);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!ageOk) {
      setError("Please confirm you're 13 or older to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Email confirmation is disabled — signed in immediately, go to onboarding
        router.push("/onboarding");
      } else {
        // Email confirmation required
        setConfirmationSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (!ageOk) {
      setError("Please confirm you're 13 or older to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://armtrack.app/auth/callback" },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResent(false);
    try {
      await supabase.auth.resend({ type: "signup", email });
      setResent(true);
      setResendCooldown(30);
    } catch {
      setError("Couldn't resend. Please try again in a moment.");
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="px-6 py-5 sm:px-10">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
            Arm<span className="text-blue-500">Track</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              <MailCheck size={26} strokeWidth={1.75} className="text-blue-500" />
            </div>
            <h1 className="mb-3 text-xl font-extrabold text-white">Check your inbox</h1>
            <p className="text-sm text-gray-400">
              We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.
              Click the link to activate your account.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Can&apos;t find it? Check your spam or promotions folder.
            </p>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resent
                ? "Email sent again ✓"
                : "Resend confirmation email"}
            </button>

            {/* Change email */}
            <button
              onClick={() => {
                setConfirmationSent(false);
                setResent(false);
                setResendCooldown(0);
                setPassword("");
              }}
              className="mt-3 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300 cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Wordmark */}
      <div className="px-6 py-5 sm:px-10">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl p-8"
          style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
        >
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
            Create your free account
          </h1>
          <p className="mb-6 text-sm text-gray-400">
            Free for players and coaches. No credit card — takes about 30 seconds.
          </p>

          {/* Age gate (COPPA) — players under 13 need a parent/coach to set up the account */}
          <label className="mb-6 flex cursor-pointer items-start gap-2.5 rounded-xl p-3" style={{ backgroundColor: "#161616", border: "1px solid #232323" }}>
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-500"
            />
            <span className="text-xs leading-relaxed text-gray-400">
              I&apos;m <span className="font-semibold text-white">13 or older</span>. Players under 13 must
              have a parent, guardian, or coach create and manage their account.
            </span>
          </label>

          {/* Google OAuth — web only, broken in Capacitor WebView without Universal Links */}
          {!isNative && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={loading || !ageOk}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-50 cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          {/* Email/password form */}
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-150 focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 outline-none transition-all duration-150 focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300 cursor-pointer"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <p
                className="rounded-lg px-4 py-3 text-sm text-red-400"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-150 hover:bg-blue-400 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating account…" : "Create my free account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Log in
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-600">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-400">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-gray-400">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
