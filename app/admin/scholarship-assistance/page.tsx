"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, User, Mail, Phone, ExternalLink, Loader2, ChevronDown, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  in_review: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

const PACKAGE_LABELS: Record<string, string> = {
  basic_review: "Basic Review — $15",
  essay_improvement: "Essay Improvement — $25",
  full_support: "Full Application Support — $50",
  interview_prep: "Interview Preparation — $35",
};

export default function ScholarshipAssistanceAdmin() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editMap, setEditMap] = useState<Record<string, { status?: string; payment_status?: string; assigned_expert?: string; admin_message?: string }>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/scholarship-assistance?admin=true");
      const data = await res.json();
      setRequests(data.requests || []);
      setLoading(false);
    };
    load();
  }, []);

  const update = async (id: string) => {
    setUpdating(id);
    const updates = editMap[id] || {};
    const res = await fetch("/api/scholarship-assistance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, ...updates }),
    });
    const data = await res.json();
    if (data.success) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success("Updated!");
    } else toast.error("Update failed");
    setUpdating(null);
  };

  const setEdit = (id: string, key: string, val: string) => setEditMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter || r.payment_status === filter);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Scholarship Assistance</h1>
        <p className="text-sm text-gray-500 mt-0.5">{requests.length} total requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {["pending", "in_progress", "completed", "cancelled"].map(s => (
          <div key={s} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-2xl font-extrabold text-gray-900">{requests.filter(r => r.status === s).length}</div>
            <div className="text-xs text-gray-500 capitalize mt-0.5">{s.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "pending", "in_review", "in_progress", "completed", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div> : (
        <div className="space-y-3">
          {filtered.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">No requests found.</div>
          : filtered.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-[#1a3c8f]" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.full_name}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{req.scholarship_name}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"}`}>{req.status?.replace(/_/g, " ")}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${req.payment_status === "verified" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>💳 {req.payment_status}</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">{PACKAGE_LABELS[req.package] || req.package}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded === req.id ? "rotate-180" : ""}`} />
              </div>

              {expanded === req.id && (
                <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{req.email}</div>
                      {req.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{req.phone}</div>}
                      {req.scholarship_url && <a href={req.scholarship_url} target="_blank" className="flex items-center gap-2 text-[#1a3c8f] hover:underline"><ExternalLink className="w-4 h-4" />View Scholarship</a>}
                    </div>
                    {req.notes && <div className="bg-white rounded-xl p-3 text-sm text-gray-600"><strong>Notes:</strong> {req.notes}</div>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                      <select value={editMap[req.id]?.status ?? req.status} onChange={e => setEdit(req.id, "status", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                        {["pending", "in_review", "in_progress", "completed", "cancelled"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Payment Status</label>
                      <select value={editMap[req.id]?.payment_status ?? req.payment_status} onChange={e => setEdit(req.id, "payment_status", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                        {["pending", "verified", "failed", "refunded"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Assigned Expert</label>
                      <input value={editMap[req.id]?.assigned_expert ?? (req.assigned_expert || "")} onChange={e => setEdit(req.id, "assigned_expert", e.target.value)}
                        placeholder="Expert name or email"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Message to User</label>
                      <input value={editMap[req.id]?.admin_message ?? (req.admin_message || "")} onChange={e => setEdit(req.id, "admin_message", e.target.value)}
                        placeholder="Message for the user..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                    </div>
                  </div>

                  <button onClick={() => update(req.id)} disabled={updating === req.id}
                    className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-900 text-sm disabled:opacity-60">
                    {updating === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Changes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
