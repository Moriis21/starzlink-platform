"use client";

import { useState, useEffect } from "react";
import { pointsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Trophy, Medal, Plus, Minus, RotateCcw } from "lucide-react";

export default function AdminLeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustment, setAdjustment] = useState({ points: "", reason: "", type: "add" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await pointsApi.getLeaderboard(50);
    setUsers(data as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdjust = async () => {
    if (!selectedUser || !adjustment.points || !adjustment.reason) { toast.error("Please fill all fields"); return; }
    setSaving(true);
    const pts = parseInt(adjustment.points);
    const finalPts = adjustment.type === "remove" ? -Math.abs(pts) : Math.abs(pts);
    await pointsApi.addPoints(selectedUser.id, "manual_adjustment", finalPts, adjustment.reason);
    toast.success(`Points ${adjustment.type === "add" ? "added" : "removed"} successfully`);
    setSelectedUser(null);
    setAdjustment({ points: "", reason: "", type: "add" });
    fetchData();
    setSaving(false);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"><Trophy className="w-4 h-4 text-white" /></div>;
    if (rank === 2) return <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><Medal className="w-4 h-4 text-white" /></div>;
    if (rank === 3) return <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center"><Medal className="w-4 h-4 text-white" /></div>;
    return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{rank}</div>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Leaderboard Management</h1>
          <p className="text-gray-500 text-sm">View and manage user points and rankings.</p>
        </div>
        <button
          onClick={async () => {
            if (!confirm("Reset all user points to 0? This cannot be undone.")) return;
            toast.success("Monthly reset initiated (implement bulk update as needed)");
          }}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Monthly Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Top 50 Users by Points</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-1" /><div className="h-3 bg-gray-100 rounded w-1/4" /></div>
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              )) : users.map((u, i) => (
                <div key={u.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                  {getRankBadge(i + 1)}
                  <div className="w-9 h-9 rounded-full bg-[#1a3c8f]/10 flex items-center justify-center text-[#1a3c8f] font-bold text-sm flex-shrink-0">
                    {u.profile_image ? <img src={u.profile_image} alt="" className="w-9 h-9 rounded-full object-cover" /> : u.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{u.full_name ?? "Unknown"}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.user_type ?? "User"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#1a3c8f]">{(u.points ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adjustment Panel */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Adjust Points</h2>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 bg-[#1a3c8f] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedUser.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
                    <p className="text-xs text-gray-500">{(selectedUser.points ?? 0).toLocaleString()} pts current</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setAdjustment(a => ({ ...a, type: "add" }))} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors border ${adjustment.type === "add" ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600"}`}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                    <button type="button" onClick={() => setAdjustment(a => ({ ...a, type: "remove" }))} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors border ${adjustment.type === "remove" ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600"}`}>
                      <Minus className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Points</label>
                  <input type="number" min="1" value={adjustment.points} onChange={e => setAdjustment(a => ({ ...a, points: e.target.value }))} placeholder="e.g. 50" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason</label>
                  <input value={adjustment.reason} onChange={e => setAdjustment(a => ({ ...a, reason: e.target.value }))} placeholder="e.g. Bonus for participating in event" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
                <button onClick={handleAdjust} disabled={saving} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : "Apply Adjustment"}
                </button>
                <button onClick={() => setSelectedUser(null)} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click on a user in the leaderboard to adjust their points.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
            <h3 className="font-bold text-gray-900 mb-3">Points Guide</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                { action: "Complete profile", pts: 50 },
                { action: "Apply to opportunity", pts: 10 },
                { action: "Save opportunity", pts: 5 },
                { action: "Refer a friend", pts: 100 },
                { action: "Share on social", pts: 15 },
              ].map(({ action, pts }) => (
                <li key={action} className="flex items-center justify-between">
                  <span>{action}</span>
                  <span className="font-bold text-[#1a3c8f]">+{pts} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
