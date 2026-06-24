"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { APP_STORE_LIVE, APP_STORE_URL } from "@/lib/appStore";
import { ScrollFade, Eyebrow, T } from "./primitives";
import AppStoreBadge from "./AppStoreBadge";

type Status = "idle" | "loading" | "done" | "error";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setStatus("error");
      setMsg("Please enter a valid email.");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.from("waitlist").insert({ email: value });
    // 23505 = unique violation → they're already on the list, treat as success.
    if (error && error.code !== "23505") {
      setStatus("error");
      setMsg("Something went wrong. Please try again.");
      return;
    }
    setStatus("done");
    setMsg("You’re on the list. We’ll email you the day it drops.");
    setEmail("");
  }

  return (
    <section
      id="waitlist"
      style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "60px 24px" }}
    >
      <ScrollFade>
        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.line}`,
            borderRadius: 24,
            padding: "clamp(30px, 5vw, 46px)",
            boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 18px 44px rgba(16,24,40,.06)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div style={{ flex: "1 1 360px", minWidth: 280 }}>
            <Eyebrow>{APP_STORE_LIVE ? "Now on iOS" : "Coming soon to iOS"}</Eyebrow>
            <h2
              className="font-display"
              style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(26px, 3.6vw, 38px)", lineHeight: 1.02, letterSpacing: "-0.01em", margin: "10px 0 10px" }}
            >
              {APP_STORE_LIVE ? "Get ArmTrack on your phone" : "Be first when the app drops"}
            </h2>
            <p style={{ color: T.ink2, fontSize: 15.5, lineHeight: 1.6, margin: "0 0 20px", maxWidth: 440 }}>
              {APP_STORE_LIVE
                ? "Download the free app and start your daily check-in. Or use it right now in your browser."
                : "The iOS app is almost here. Drop your email and we’ll tell you the moment it’s live. No spam, ever."}
            </p>

            {!APP_STORE_LIVE && (
              <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 460 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  disabled={status === "loading" || status === "done"}
                  style={{
                    flex: "1 1 220px",
                    minWidth: 0,
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: `1px solid ${status === "error" ? T.red : T.line}`,
                    background: "#fff",
                    color: T.ink,
                    fontSize: 15,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading" || status === "done"}
                  style={{
                    background: status === "done" ? T.green : T.blue,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    borderRadius: 12,
                    padding: "13px 22px",
                    cursor: status === "loading" || status === "done" ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 8px 20px rgba(46,107,255,.32)",
                  }}
                >
                  {status === "loading" ? "Adding…" : status === "done" ? "You’re in ✓" : "Notify me"}
                </button>
              </form>
            )}

            {msg && (
              <p style={{ marginTop: 12, fontSize: 13.5, color: status === "error" ? T.red : T.green, fontWeight: 500 }}>
                {msg}
              </p>
            )}
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <AppStoreBadge live={APP_STORE_LIVE} href={APP_STORE_URL || undefined} />
          </div>
        </div>
      </ScrollFade>
    </section>
  );
}
