"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { T, ease } from "./primitives";
import AppStoreBadge from "./AppStoreBadge";
import { APP_STORE_URL, APP_STORE_LIVE } from "@/lib/appStore";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        maxWidth: 1180,
        margin: "0 auto",
        padding: "34px 24px 26px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 46,
      }}
    >
      <div style={{ flex: "1 1 440px", minWidth: 320 }}>
        <motion.h1
          className="font-display"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease }}
          style={{
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "clamp(44px, 7.2vw, 78px)",
            lineHeight: 0.94,
            letterSpacing: "-0.01em",
            color: T.ink,
            margin: 0,
          }}
        >
          Protect the arm.
          <em
            style={{
              display: "block",
              fontStyle: "italic",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.46em",
              color: T.blue,
              letterSpacing: 0,
              marginTop: 9,
            }}
          >
            Extend the career.
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease }}
          style={{
            marginTop: 22,
            fontSize: "clamp(16px, 1.7vw, 18.5px)",
            lineHeight: 1.6,
            color: T.ink2,
            maxWidth: 470,
          }}
        >
          <b style={{ color: T.ink, fontWeight: 700 }}>Free and easy to use.</b> Most arm injuries don’t happen
          overnight. They build up throw after throw. ArmTrack helps you catch the warning signs before they become
          months on the sideline.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.36, ease }}
          style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 26 }}
        >
          {APP_STORE_LIVE ? (
            <>
              <AppStoreBadge live href={APP_STORE_URL} />
              <Link href="/signup" style={{ fontWeight: 600, fontSize: 15, color: T.ink, textDecoration: "none" }}>
                or use it free in your browser →
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="lp-shine"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: T.blue,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 99,
                  padding: "15px 28px",
                  textDecoration: "none",
                  boxShadow: "0 10px 26px rgba(46,107,255,.4)",
                }}
              >
                Get your readiness, free
              </Link>
              <Link href="/login" style={{ fontWeight: 600, fontSize: 15, color: T.ink, textDecoration: "none" }}>
                Log in →
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Phone slides in from the right */}
      <div style={{ flex: "0 1 310px", minWidth: 270, display: "flex", justifyContent: "center", position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,107,255,.2), transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, x: 160, rotate: 3 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
          style={{
            position: "relative",
            width: 286,
            borderRadius: 44,
            background: "#0a0b0e",
            padding: 9,
            boxShadow: "0 40px 80px rgba(16,24,40,.3), 0 0 0 1px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 25,
              background: "#0a0b0e",
              borderRadius: 99,
              zIndex: 5,
            }}
          />
          <div style={{ borderRadius: 36, overflow: "hidden", background: "#0B0C0F" }}>
            <Image
              src="/screenshots/01-dashboard-readiness.png"
              width={286}
              height={622}
              alt="ArmTrack readiness dashboard"
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
