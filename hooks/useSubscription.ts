"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [grant, setGrant] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = async (userId: string) => {
    const [subRes, grantRes, creditRes] = await Promise.allSettled([
      insforge.database.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      insforge.database.from("admin_pro_grants").select("*")
        .eq("user_id", userId).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      insforge.database.from("user_credits").select("credits_balance").eq("user_id", userId).maybeSingle(),
    ]);
    if (subRes.status === "fulfilled") setSub(subRes.value.data);
    if (grantRes.status === "fulfilled") setGrant(grantRes.value.data);
    if (creditRes.status === "fulfilled") setCredits((creditRes.value.data as any)?.credits_balance ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    load(user.id);
  }, [user?.id]);

  const now = new Date().toISOString();

  // Paid subscription pro
  const isPaidPro = sub?.status === "active" && sub?.current_period_end > now;
  // Manual admin grant pro
  const isManualPro = grant?.is_active && (!grant?.expiry_date || grant?.expiry_date > now);
  // Lifetime pro
  const isLifetimePro = grant?.plan_type === "pro_lifetime" && grant?.is_active;

  const isPro = isPaidPro || isManualPro || isLifetimePro;

  const planLabel = isLifetimePro ? "Pro Lifetime"
    : isManualPro ? "Pro (Admin Grant)"
    : isPaidPro ? (sub?.plan === "yearly" ? "Pro Yearly" : "Pro Monthly")
    : "Free";

  const expiryDate = isLifetimePro ? null
    : isManualPro ? grant?.expiry_date
    : isPaidPro ? sub?.current_period_end
    : null;

  const refresh = () => { if (user?.id) { setLoading(true); load(user.id); } };

  return { sub, grant, isPro, isPaidPro, isManualPro, isLifetimePro, planLabel, expiryDate, credits, loading, refresh };
}
