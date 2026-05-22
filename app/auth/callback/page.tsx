"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.2)",
          borderTop: "2px solid #3B82F6",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      // Pending team invite stored by JoinClient.tsx before auth redirect
      const pendingInvite = localStorage.getItem("armtrack-pending-invite");
      if (pendingInvite) {
        localStorage.removeItem("armtrack-pending-invite");
        router.replace(`/join/${pendingInvite}`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete, role")
        .eq("id", data.session.user.id)
        .single();

      if (profile?.onboarding_complete) {
        router.replace(profile.role === "coach" ? "/coach/dashboard" : "/dashboard");
      } else {
        router.replace("/onboarding");
      }
    });
  }, [searchParams, router]);

  return <Spinner />;
}

// useSearchParams requires Suspense boundary in static export
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
