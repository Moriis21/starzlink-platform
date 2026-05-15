"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

export default function ProfileCompletionGate({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const checkProfile = async () => {
      // 1. Fast path: check sessionStorage flag set right after completion
      try {
        const flag = sessionStorage.getItem("profileCompleted_" + user.id);
        if (flag === "1") {
          setChecking(false);
          return;
        }
      } catch {}

      // 2. Fetch from backend via REST API (bypasses RLS for reliable read)
      try {
        const authKey = process.env.NEXT_PUBLIC_INSFORGE_KEY || ANON_KEY;
        const res = await fetch(
          `${INSFORGE_URL}/rest/v1/profiles?id=eq.${user.id}&select=profile_completed,phone,country,county_state,city_community`,
          {
            headers: {
              apikey: authKey,
              Authorization: `Bearer ${authKey}`,
            },
          }
        );

        if (res.ok) {
          const rows = await res.json();
          const p = Array.isArray(rows) ? rows[0] : rows;

          // Consider complete if: flag is true OR required location fields present
          const isComplete =
            p?.profile_completed === true ||
            (p?.phone && (p?.country || p?.county_state || p?.city_community));

          if (isComplete) {
            // Cache result so we don't re-fetch on every navigation
            try { sessionStorage.setItem("profileCompleted_" + user.id, "1"); } catch {}
            setChecking(false);
            return;
          }

          // Profile genuinely incomplete — redirect to completion form
          router.replace("/complete-profile");
          return;
        }
      } catch {}

      // 3. If REST API fails, allow access (don't block on network error)
      setChecking(false);
    };

    checkProfile();
  }, [user?.id, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
