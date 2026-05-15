"use client";

import { useState, useEffect } from "react";
import { Eye, MousePointer, CheckCircle, XCircle, Pause, Play, Trash2, Plus, Loader2, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
  paused: "bg-gray-50 text-gray-600",
  expired: "bg-red-50 text-red-600",
  rejected: "bg-red-100 text-red-700",
};

export default function AdsManagerPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/ads?admin=true");
    const data = await res.json();
    setAds(data.ads || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setAds(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Ad ${status}`);
    } else toast.error("Update failed");
    setUpdating(null);
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await fetch(`/api/ads/${id}`, { method: "DELETE" });
    setAds(prev => prev.filter(a => a.id !== id));
    toast.success("Ad deleted");
  };

  const filtered = filter === "all" ? ads : ads.filter(a => a.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Ads Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ads.length} total ad requests</p>
        </div>
        <Link href="/advertise" target="_blank" className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-900 text-sm">
          <Megaphone className="w-4 h-4" /> View Advertise Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {["pending", "active", "approved", "expired"].map(s => (
          <div key={s} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-2xl font-extrabold text-gray-900">{ads.filter(a => a.status === s).length}</div>
            <div className="text-xs text-gray-500 capitalize mt-0.5">{s}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "pending", "approved", "active", "paused", "expired", "rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${filter === s ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">No ads found.</div>
          ) : filtered.map(ad => (
            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {ad.image_url && <img src={ad.image_url} alt={ad.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-bold text-gray-900">{ad.title}</h3>
                      <p className="text-sm text-gray-500">{ad.advertiser_name} · {ad.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[ad.status] || "bg-gray-100 text-gray-600"}`}>{ad.status}</span>
                  </div>
                  {ad.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ad.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Placement: <strong>{ad.placement?.replace(/_/g, " ")}</strong></span>
                    {ad.start_date && <span>{ad.start_date} → {ad.end_date}</span>}
                    {ad.budget && <span>Budget: <strong>${ad.budget}</strong></span>}
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{ad.impressions || 0}</span>
                    <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5" />{ad.clicks || 0}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {ad.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(ad.id, "approved")} disabled={updating === ad.id}
                        className="flex items-center gap-1 bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-green-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => updateStatus(ad.id, "rejected")} disabled={updating === ad.id}
                        className="flex items-center gap-1 bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-100">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {ad.status === "approved" && (
                    <button onClick={() => updateStatus(ad.id, "active")} disabled={updating === ad.id}
                      className="flex items-center gap-1 bg-blue-50 text-[#1a3c8f] font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100">
                      <Play className="w-3.5 h-3.5" /> Activate
                    </button>
                  )}
                  {ad.status === "active" && (
                    <button onClick={() => updateStatus(ad.id, "paused")} disabled={updating === ad.id}
                      className="flex items-center gap-1 bg-gray-50 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  )}
                  {ad.status === "paused" && (
                    <button onClick={() => updateStatus(ad.id, "active")} disabled={updating === ad.id}
                      className="flex items-center gap-1 bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-green-100">
                      <Play className="w-3.5 h-3.5" /> Resume
                    </button>
                  )}
                  <button onClick={() => deleteAd(ad.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
