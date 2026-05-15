"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      try {
        await new Promise(r => setTimeout(r, 800));
        const { data } = await insforge.auth.getCurrentUser();
        const authUser = data?.user as any;

        if (!authUser?.id) {
          router.replace("/login?error=oauth_failed");
          return;
        }

        const fullName =
          authUser.profile?.name ??
          authUser.user_metadata?.full_name ??
          authUser.user_metadata?.name ??
          authUser.email?.split("@")[0] ?? "User";

        const avatarUrl =
          authUser.profile?.avatar_url ??
          authUser.user_metadata?.avatar_url ??
          authUser.user_metadata?.picture ?? "";

        const provider =
          authUser.app_metadata?.provider ??
          authUser.user_metadata?.provider ?? "social";

        const { data: existingProfile } = await insforge.database
          .from("profiles").select("id").eq("id", authUser.id).maybeSingle();

        if (existingProfile?.id) {
          await insforge.database.from("profiles").update({
            last_login_at: new Date().toISOString(),
            avatar_url: avatarUrl || undefined,
            updated_at: new Date().toISOString(),
          }).eq("id", authUser.id);
        } else {
          await insforge.database.from("profiles").upsert([{
            id: authUser.id,
            full_name: fullName,
            email: authUser.email ?? "",
            avatar_url: avatarUrl,
            provider,
            role: "user",
            user_type: "student",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }], { onConflict: "id" });

          await insforge.database.from("user_credits").upsert([{
            user_id: authUser.id, credits_balance: 5, credits_used: 0,
          }], { onConflict: "user_id" }).catch(() => {});

          await insforge.database.from("credit_transactions").insert([{
            user_id: authUser.id,
            transaction_type: "free_signup_credit",
            credits_amount: 5,
            reason: "Welcome! 5 free credits for your first CV analysis.",
          }]).catch(() => {});
        }

        router.replace("/dashboard");
      } catch {
        router.replace("/login?error=oauth_failed");
      }
    };
    handle();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Completing sign in…</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
