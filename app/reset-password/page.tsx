"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MailCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://armtrack.app/update-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="px-6 py-5 sm:px-10">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl p-8"
          style={{ backgroundColor: "#111111", border: "1px solid #222222" }}
        >
          {sent ? (
            <div className="text-center">
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
              >
                <MailCheck size={26} strokeWidth={1.75} className="text-blue-500" />
              </div>
              <h1 className="mb-3 text-xl font-extrabold text-white">Check your inbox</h1>
              <p className="text-sm text-gray-400">
                We sent a password reset link to{" "}
                <span className="font-semibold text-white">{email}</span>.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
                Reset your password
              </h1>
              <p className="mb-8 text-sm text-gray-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-150 focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  />
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
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remember it?{" "}
                <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
