"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Flag, Loader2, Eye } from "lucide-react";
import toast from "react-hot-toast";

function StarRating({ value }: { value: number }) {
  return <span className="text-yellow-400">{Array.from({ length: 5 }, (_, i) => i < value ? "★" : "☆").join("")}</span>;
}

export default function OpportunityReviewsAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    // Fetch pending reviews - use a general search
    try {
      const { insforge } = await import("@/lib/insforge");
      let q = insforge.database.from("opportunity_reviews").select("*").order("created_at", { ascending: false }).limit(100);
      if (filter !== "all") q = q.eq("status", filter);
      const { data } = await q;
      setReviews(data || []);
    } catch { setReviews([]); }
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, [filter]);

  const moderate = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch("/api/opportunity-reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: id, status }),
    });
    if ((await res.json()).success) {
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success(`Review ${status}`);
    }
    setUpdating(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reviews & Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderate user reviews on opportunities</p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "hidden", "all"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div> : (
        <div className="space-y-4">
          {reviews.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">No {filter} reviews.</div>
          : reviews.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${r.is_flagged ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StarRating value={r.overall_rating} />
                    <span className="font-bold text-gray-900 text-sm">{r.opportunity_title || r.opportunity_id}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{r.opportunity_type}</span>
                    {r.is_flagged && <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full"><Flag className="w-3 h-3" /> Flagged</span>}
                  </div>
                  {r.review_text && <p className="text-sm text-gray-700 mb-2">{r.review_text}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {r.quality_rating && <span>Quality: {r.quality_rating}/5</span>}
                    {r.process_rating && <span>Process: {r.process_rating}/5</span>}
                    {r.response_rating && <span>Response: {r.response_rating}/5</span>}
                    {r.trust_rating && <span>Trust: {r.trust_rating}/5</span>}
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {r.status !== "approved" && (
                    <button onClick={() => moderate(r.id, "approved")} disabled={updating === r.id}
                      className="flex items-center gap-1 bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-green-100">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {r.status !== "hidden" && (
                    <button onClick={() => moderate(r.id, "hidden")} disabled={updating === r.id}
                      className="flex items-center gap-1 bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-100">
                      <XCircle className="w-3.5 h-3.5" /> Hide
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
