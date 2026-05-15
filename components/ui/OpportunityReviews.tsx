"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, Flag, Loader2, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Props {
  opportunityId: string;
  opportunityType: string;
  opportunityTitle?: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${n <= (hover || value) ? "text-yellow-400" : "text-gray-200"}`}>★</button>
      ))}
    </div>
  );
}

export default function OpportunityReviews({ opportunityId, opportunityType, opportunityTitle }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ overall_rating: 0, quality_rating: 0, process_rating: 0, response_rating: 0, trust_rating: 0, review_text: "" });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/opportunity-reviews?opportunityId=${opportunityId}&opportunityType=${opportunityType}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverage(data.average || 0);
      setCount(data.count || 0);
      setLoading(false);
    };
    load();
  }, [opportunityId]);

  const submit = async () => {
    if (!user) { toast.error("Sign in to leave a review."); return; }
    if (!form.overall_rating) { toast.error("Please select an overall rating."); return; }
    setSubmitting(true);
    const res = await fetch("/api/opportunity-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, opportunityId, opportunityType, opportunityTitle, ...form }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Review submitted for approval!"); setShowForm(false); setForm({ overall_rating: 0, quality_rating: 0, process_rating: 0, response_rating: 0, trust_rating: 0, review_text: "" }); }
    else toast.error(data.error || "Submission failed");
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center"><Star className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <p className="font-bold text-gray-800 text-sm">Reviews</p>
            <p className="text-xs text-gray-500">{count > 0 ? `${average}★ · ${count} review${count > 1 ? "s" : ""}` : "No reviews yet — be the first!"}</p>
          </div>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1a3c8f] bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100">
            {showForm ? <><ChevronUp className="w-3.5 h-3.5" /> Cancel</> : <><Star className="w-3.5 h-3.5" /> Write Review</>}
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">Your Review</h3>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Overall Rating *</label>
            <StarPicker value={form.overall_rating} onChange={v => setForm(f => ({ ...f, overall_rating: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ key: "quality_rating", label: "Opportunity Quality" }, { key: "process_rating", label: "Application Process" }, { key: "response_rating", label: "Organization Response" }, { key: "trust_rating", label: "Trust Level" }].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
                <StarPicker value={(form as any)[f.key]} onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))} />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Review (optional)</label>
            <textarea value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} rows={3}
              placeholder="Share your experience with this opportunity..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
          </div>
          <button onClick={submit} disabled={submitting}
            className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-900 disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Review
          </button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {reviews.slice(0, 5).map(r => (
            <div key={r.id} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-yellow-400 text-sm">{Array.from({ length: 5 }, (_, i) => i < r.overall_rating ? "★" : "☆").join("")}</span>
                {r.is_verified_applicant && <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3 h-3" /> Verified Applicant</span>}
                <span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.review_text && <p className="text-sm text-gray-700">{r.review_text}</p>}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 text-xs text-gray-500 text-center">
          <a href="/login" className="text-[#1a3c8f] font-semibold hover:underline">Sign in</a> to leave a review
        </div>
      )}
    </div>
  );
}
