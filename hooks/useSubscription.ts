"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    insforge.database
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSub(data);
        setLoading(false);
      });
  }, [user?.id]);

  const isPro =
    sub?.status === "active" &&
    sub?.current_period_end > new Date().toISOString();

  const refresh = () => {
    if (!user?.id) return;
    setLoading(true);
    insforge.database
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSub(data);
        setLoading(false);
      });
  };

  return { sub, isPro, loading, refresh };
}
