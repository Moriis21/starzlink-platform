"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";

interface Props {
  children: React.ReactNode;
}

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

    // Check if profile is complete
    insforge.database
      .from("profiles")
      .select("profile_completed, phone, country, county_state, city_community")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as any;
        const isComplete =
          p?.profile_completed === true ||
          (p?.phone && p?.country && p?.county_state && p?.city_community);

        if (!isComplete) {
          router.replace("/complete-profile");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        // If check fails, allow access (don't block on DB error)
        setChecking(false);
      });
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
