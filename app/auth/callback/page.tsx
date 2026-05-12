"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handle = async () => {
      const status = searchParams.get("insforge_status");
      const type   = searchParams.get("insforge_type");

      // Email verification callback
      if (type === "verify_email") {
        router.replace(status === "success" ? "/login?verified=1" : "/login?error=verification_failed");
        return;
      }

      // OAuth callback — InsForge SDK handles the session exchange automatically
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (error || !data?.user) { router.replace("/login?error=oauth_failed"); return; }

        const uid = data.user.id;
        const { data: profile } = await insforge.database
          .from("profiles").select("phone,user_type,role").eq("id", uid).maybeSingle();

        if (!profile) {
          // First-time OAuth user — create profile row and send to completion
          await insforge.database.from("profiles").insert([{
            id: uid,
            full_name: data.user.profile?.name ?? data.user.email?.split("@")[0] ?? "",
            role: "user",
            user_type: "student",
          }]);
          router.replace("/complete-profile");
        } else if (!profile.phone) {
          router.replace("/complete-profile");
        } else {
          const dest = (profile.role === "admin" || profile.role === "super_admin") ? "/admin" : "/dashboard";
          router.replace(dest);
        }
      } catch {
        router.replace("/login?error=oauth_failed");
      }
    };
    handle();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f]">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-300" />
        <h2 className="text-lg font-bold mb-1">Signing you in…</h2>
        <p className="text-blue-200 text-sm">Please wait a moment</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f]">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
