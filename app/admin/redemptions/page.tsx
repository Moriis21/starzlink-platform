"use client";

import { useState, useEffect } from "react";
import { redemptionsApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import {
  Gift, CheckCircle, XCircle, Clock, Search, Eye, X,
  DollarSign, Users, TrendingUp, Loader2, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface Redemption {
  id: string;
  user_id: string;
  points_used: number;
  usd_value: number;
  resource_requested: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
  processed_at?: string;
  profiles?: { full_name: string; email: string; points: number };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminRedemptionsPage() {
  const [items, setItems] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<Redemption | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await redemptionsApi.adminGetAll();
      const data = all as Redemption[];
      setItems(filter === "all" ? data : data.filter(d => d.status === filter));
      setCounts({
        pending: data.filter(d => d.status === "pending").length,
        approved: data.filter(d => d.status === "approved").length,
        rejected: data.filter(d => d.status === "rejected").length,
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleApprove = async (item: Redemption) => {
    setActionLoading(true);
    try {
      await redemptionsApi.approve(item.id, item.user_id, item.points_used, adminNote || undefined);
      toast.success(`Approved! ${item.points_used} pts deducted from ${item.profiles?.full_name || "user"}.`);
      setSelected(null);
      setAdminNote("");
      fetchData();
    } catch { toast.error("Failed to approve."); }
    setActionLoading(false);
  };

  const handleReject = async (item: Redemption) => {
    setActionLoading(true);
    try {
      await redemptionsApi.reject(item.id, adminNote || "Request rejected by admin.");
      toast.success("Redemption rejected.");
      setSelected(null);
      setAdminNote("");
      fetchData();
    } catch { toast.error("Failed to reject."); }
    setActionLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Point Redemptions</h1>
          <p className="text-gray-500 text-sm">Review and approve user requests to redeem points for paid resources</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([
          { key: "pending", label: "Pending Review", color: "bg-yellow-50 border-yellow-200 text-yellow-700", icon: Clock },
          { key: "approved", label: "Approved", color: "bg-green-50 border-green-200 text-green-700", icon: CheckCircle },
          { key: "rejected", label: "Rejected", color: "bg-red-50 border-red-200 text-red-700", icon: XCircle },
        ] as const).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={cn("rounded-2xl p-4 border text-left transition-all", s.color, filter === s.key && "ring-2 ring-offset-1 ring-current")}>
            <p className="text-2xl font-extrabold">{counts[s.key]}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Points economy info */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-5 text-white mb-6 flex flex-wrap gap-6">
        {[
          { icon: Users, label: "1 referral", value: "5 pts" },
          { icon: TrendingUp, label: "20 referrals", value: "100 pts" },
          { icon: DollarSign, label: "100 pts =", value: "$1 credit" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center"><item.icon className="w-4 h-4 text-blue-200" /></div>
            <div><p className="text-xs text-blue-300">{item.label}</p><p className="font-extrabold">{item.value}</p></div>
          </div>
        ))}
        <div className="ml-auto text-xs text-blue-200 self-center">
          Points are <strong className="text-white">deducted only on approval</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center"><Gift className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No {filter !== "all" ? filter : ""} redemption requests</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Resource Requested</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Points / Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">{item.profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-400">{item.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-700 max-w-[200px] truncate">{item.resource_requested}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm font-bold text-gray-900">{item.points_used} pts</p>
                    <p className="text-xs text-gray-400">${item.usd_value} USD</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-full capitalize", statusColors[item.status])}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(item); setAdminNote(""); }} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => { setSelected(item); setAdminNote(""); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => { setSelected(item); setAdminNote("Request rejected."); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail / Action Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setAdminNote(""); } }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-yellow-300" />
                <div>
                  <h2 className="font-extrabold">Redemption Request</h2>
                  <p className="text-blue-200 text-xs">{selected.profiles?.full_name}</p>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setAdminNote(""); }}><X className="w-5 h-5 text-white/70" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  { label: "User", value: `${selected.profiles?.full_name || "—"} (${selected.profiles?.email})` },
                  { label: "Current Points", value: `${selected.profiles?.points ?? "—"} pts` },
                  { label: "Points to Redeem", value: `${selected.points_used} pts (= $${selected.usd_value})` },
                  { label: "Submitted", value: formatDate(selected.created_at) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500 text-xs">{row.label}</span>
                    <span className="font-semibold text-gray-900 text-xs">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resource Requested</p>
                <p className="text-sm text-gray-800 leading-relaxed">{selected.resource_requested}</p>
              </div>

              {selected.status === "pending" ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-800">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Approval</strong> will deduct <strong>{selected.points_used} pts</strong> from the user's balance. Make sure you have granted them access to the resource first.</span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Admin Note (optional)</label>
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
                      placeholder="Message to show the user about this decision…" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(selected)} disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve & Deduct
                    </button>
                    <button onClick={() => handleReject(selected)} disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 disabled:opacity-60">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                    </button>
                  </div>
                </>
              ) : (
                <div className={cn("text-center p-4 rounded-xl text-sm font-semibold", statusColors[selected.status])}>
                  {selected.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                  {selected.admin_note && <p className="mt-1 font-normal text-xs">{selected.admin_note}</p>}
                  {selected.processed_at && <p className="mt-1 font-normal text-xs">Processed: {formatDate(selected.processed_at)}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
