"use client";

import { useState, useEffect } from "react";
import { pointsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Medal, Award, Star, Users, Share2, UserPlus, Bookmark, CheckCircle } from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "monthly">("all");

  useEffect(() => {
    setLoading(true);
    pointsApi.getLeaderboard(50).then(data => {
      setUsers(data as any[]);
      setLoading(false);
    });
  }, [period]);

  const currentUserRank = user ? users.findIndex(u => u.id === user.id) + 1 : -1;
  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  const podiumColors = ["text-yellow-500", "text-gray-400", "text-orange-400"];
  const podiumIcons = [Trophy, Medal, Award];

  const pointsGuide = [
    { action: "Complete your profile", points: 50, icon: CheckCircle },
    { action: "Apply to an opportunity", points: 10, icon: Award },
    { action: "Save an opportunity", points: 5, icon: Bookmark },
    { action: "Refer a friend", points: 100, icon: UserPlus },
    { action: "Share on social media", points: 15, icon: Share2 },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Leaderboard</h1>
        <p className="text-white/80 text-lg">Top StarzLink members ranked by points earned.</p>
        {user && currentUserRank > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
            <Star className="w-4 h-4 text-yellow-400" /> Your rank: #{currentUserRank}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Period toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1">
            {(["all", "monthly"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${period === p ? "bg-[#1a3c8f] text-white" : "text-gray-600"}`}>
                {p === "all" ? "All Time" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            {/* Top 3 Podium */}
            {!loading && top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[top3[1], top3[0], top3[2]].map((u, podiumIdx) => {
                  if (!u) return <div key={podiumIdx} />;
                  const rankIndex = podiumIdx === 1 ? 0 : podiumIdx === 0 ? 1 : 2;
                  const Icon = podiumIcons[rankIndex];
                  const isUser = u.id === user?.id;
                  const heights = ["h-24", "h-32", "h-20"];
                  return (
                    <div key={u.id} className={`flex flex-col items-center ${podiumIdx === 1 ? "order-2" : podiumIdx === 0 ? "order-1" : "order-3"}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-white font-bold text-lg ${isUser ? "ring-4 ring-[#1a3c8f]" : ""} ${rankIndex === 0 ? "bg-yellow-400" : rankIndex === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
                        {u.profile_image ? <img src={u.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" /> : u.full_name?.charAt(0)}
                      </div>
                      <p className="font-bold text-gray-900 text-sm text-center line-clamp-1 w-full">{u.full_name}</p>
                      <p className="text-xs text-gray-500 mb-2">{(u.points ?? 0).toLocaleString()} pts</p>
                      <Icon className={`w-5 h-5 ${podiumColors[rankIndex]}`} />
                      <div className={`w-full rounded-t-xl mt-1 ${heights[rankIndex]} ${rankIndex === 0 ? "bg-yellow-100" : rankIndex === 1 ? "bg-gray-100" : "bg-orange-100"}`}>
                        <div className="flex items-start justify-center pt-2 text-lg font-extrabold text-gray-500">#{rankIndex + 1}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {loading ? Array(10).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="w-9 h-9 bg-gray-100 rounded-full" />
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-1" /></div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                )) : users.map((u, i) => {
                  const isCurrentUser = u.id === user?.id;
                  return (
                    <div key={u.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                      <div className="w-7 text-center">
                        {i < 3 ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i === 0 ? "bg-yellow-100" : i === 1 ? "bg-gray-100" : "bg-orange-100"}`}>
                            <span className="text-xs font-bold">{i + 1}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400 font-bold">{i + 1}</span>}
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isCurrentUser ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600"}`}>
                        {u.profile_image ? <img src={u.profile_image} alt="" className="w-9 h-9 rounded-full object-cover" /> : u.full_name?.charAt(0) ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isCurrentUser ? "text-[#1a3c8f]" : "text-gray-900"}`}>
                          {u.full_name ?? "Unknown"} {isCurrentUser && <span className="text-xs">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{u.user_type ?? "Member"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-[#1a3c8f]">{(u.points ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> How to Earn Points</h3>
              <div className="space-y-3">
                {pointsGuide.map(({ action, points, icon: Icon }) => (
                  <div key={action} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className="w-4 h-4 text-[#1a3c8f] flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{action}</span>
                    </div>
                    <span className="text-sm font-bold text-[#1a3c8f] flex-shrink-0 ml-2">+{points}</span>
                  </div>
                ))}
              </div>
            </div>

            {user && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 mt-4">
                <h3 className="font-bold text-[#1a3c8f] mb-2">Your Position</h3>
                {currentUserRank > 0 ? (
                  <>
                    <p className="text-3xl font-extrabold text-[#1a3c8f]">#{currentUserRank}</p>
                    <p className="text-sm text-blue-700 mt-1">Keep earning points to climb the leaderboard!</p>
                  </>
                ) : (
                  <p className="text-sm text-blue-700">Start completing activities to appear on the leaderboard.</p>
                )}
              </div>
            )}

            {!user && (
              <div className="bg-[#1a3c8f] rounded-2xl p-5 mt-4 text-white text-center">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-70" />
                <p className="font-bold mb-2">Join the Competition</p>
                <p className="text-white/70 text-sm mb-4">Create a free account to start earning points and appear on the leaderboard.</p>
                <a href="/signup" className="block w-full bg-white text-[#1a3c8f] font-bold py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                  Sign Up Free
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
