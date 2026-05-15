"use client";

import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  opportunityId: string;
  opportunityType: string;
  opportunityTitle?: string;
  opportunityData?: { location?: string; category?: string; requirements?: string; description?: string; education_level?: string };
  size?: "sm" | "md";
}

export default function MatchScoreBadge({ opportunityId, opportunityType, opportunityTitle, opportunityData, size = "sm" }: Props) {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/match-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId, opportunityType, opportunityTitle, opportunityData,
        userProfile: {
          id: user.id,
          career_goal: (user as any).career_goal,
          occupation: (user as any).occupation,
          education_level: (user as any).education_level,
          country: (user as any).country,
          area_of_interest: (user as any).area_of_interest,
        },
      }),
    }).then(r => r.json()).then(data => {
      setScore(data.score);
      setLabel(data.label || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, opportunityId]);

  if (!user || loading || score === null) return null;

  const color = score >= 85 ? "bg-green-50 text-green-700 border-green-200"
    : score >= 65 ? "bg-blue-50 text-[#1a3c8f] border-blue-200"
    : "bg-gray-50 text-gray-600 border-gray-200";

  if (size === "sm") return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      <Target className="w-3 h-3" />{score}%
    </span>
  );

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${color}`}>
      <Target className="w-5 h-5 flex-shrink-0" />
      <div>
        <p className="font-bold text-sm">{score}% Match — {label}</p>
        <p className="text-xs opacity-70">Based on your profile</p>
      </div>
    </div>
  );
}
