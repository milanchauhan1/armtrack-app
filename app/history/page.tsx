"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <nav
        className="sticky top-0 z-20 flex items-center bg-black px-5 py-4 sm:px-10"
        style={{ borderBottom: "1px solid #111" }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Arm<span className="text-blue-500">Track</span>
        </span>
      </nav>

      <div className="mx-auto max-w-2xl px-5 pt-16 flex flex-col items-center gap-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 72,
            height: 72,
            backgroundColor: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <BarChart2 size={32} style={{ color: "#3B82F6" }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <p className="text-xl font-extrabold text-white tracking-tight mb-2">
            History
          </p>
          <p className="text-sm text-gray-500 max-w-xs">
            Full session history is coming soon. Check your dashboard for recent logs and trends.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
