"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { Zap } from "lucide-react";

export default function CreditBadge() {
  const { isPro, credits, loading } = useSubscription();
  if (loading || isPro) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        credits === 0 ? "bg-red-100 text-red-700" : "bg-blue-100 text-[#1a3c8f]"
      }`}
    >
      <Zap className="w-3.5 h-3.5" />
      {credits === 0
        ? "No credits"
        : `${credits} credit${credits !== 1 ? "s" : ""} remaining`}
    </div>
  );
}
