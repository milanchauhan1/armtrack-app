"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function getRedirectPath(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, role")
    .eq("id", userId)
    .single();
  if (!profile?.onboarding_complete) return "/onboarding";
  if (profile.role === "coach") return "/coach";
  return "/dashboard";
}

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (error || !data.session) {
          router.replace("/login");
          return;
        }
        const path = await getRedirectPath(data.session.user.id);
        router.replace(path);
      });
    } else {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
          router.replace("/login");
          return;
        }
        const path = await getRedirectPath(session.user.id);
        router.replace(path);
      });
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
    </div>
  );
}
