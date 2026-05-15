"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import {
  Star,
  MessageSquare,
  Trophy,
  Users,
  Target,
  Building2,
  X,
  Loader2,
  CheckCircle,
  GraduationCap,
  Briefcase,
  BookOpen,
  Mail,
  FileText,
  Award,
  HelpCircle,
} from "lucide-react";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  category: string;
  title: string | null;
  body: string;
  is_verified: boolean;
  created_at: string;
  profiles?: { full_name: string } | null;
}

interface Story {
  id: string;
  user_display_name: string;
  outcome_type: string;
  outcome_title: string;
  outcome_description: string;
  organization: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "opportunity_quality", label: "Opportunity Quality" },
  { value: "application_experience", label: "Application Experience" },
  { value: "platform_usefulness", label: "Platform Usefulness" },
  { value: "overall_satisfaction", label: "Overall" },
];

const CATEGORY_LABELS: Record<string, string> = {
  opportunity_quality: "Opportunity Quality",
  application_experience: "Application Experience",
  platform_usefulness: "Platform Usefulness",
  overall_satisfaction: "Overall Satisfaction",
};

const OUTCOME_TYPES = [
  { value: "scholarship_won", label: "Scholarship", icon: GraduationCap, color: "bg-purple-100 text-purple-700" },
  { value: "internship_secured", label: "Internship", icon: Briefcase, color: "bg-blue-100 text-blue-700" },
  { value: "job_hired", label: "Job Hired", icon: Briefcase, color: "bg-green-100 text-green-700" },
  { value: "course_completed", label: "Course", icon: BookOpen, color: "bg-orange-100 text-orange-700" },
  { value: "letter_sent", label: "Letter Sent", icon: Mail, color: "bg-cyan-100 text-cyan-700" },
  { value: "cv_improved", label: "CV Improved", icon: FileText, color: "bg-yellow-100 text-yellow-700" },
  { value: "other", label: "Other", icon: HelpCircle, color: "bg-gray-100 text-gray-700" },
];

function maskName(name: string): string {
  if (!name) return "Anonymous";
  const parts = name.trim().split(" ");
  return parts.map(p => (p.length <= 1 ? p : p[0] + "***")).join(" ");
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${(hovered || value) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalStories, setTotalStories] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  // Stats
  const [memberCount, setMemberCount] = useState(0);
  const [oppCount, setOppCount] = useState(0);
  const [partnerCount, setPartnerCount] = useState(0);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewCategory, setReviewCategory] = useState("overall_satisfaction");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Story modal
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyDisplayName, setStoryDisplayName] = useState("");
  const [storyOutcomeType, setStoryOutcomeType] = useState("scholarship_won");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDesc, setStoryDesc] = useState("");
  const [storyOrg, setStoryOrg] = useState("");
  const [storyLocation, setStoryLocation] = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);
  const [storyDone, setStoryDone] = useState(false);

  const fetchReviews = async (category?: string) => {
    setLoadingReviews(true);
    try {
      const url = category && category !== "all"
        ? `/api/reviews?limit=12&category=${category}`
        : `/api/reviews?limit=12`;
      const res = await fetch(url);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setAvgRating(data.avgRating ?? 0);
      setTotalReviews(data.total ?? 0);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchStories = async () => {
    const res = await fetch("/api/reviews?type=stories&limit=8");
    const data = await res.json();
    setStories(data.stories ?? []);
    setTotalStories(data.stories?.length ?? 0);
  };

  const fetchStats = async () => {
    const [membersRes, jobsRes, scholRes, trainRes, oppRes, partnersRes] = await Promise.allSettled([
      insforge.database.from("profiles").select("id", { count: "exact" }).limit(1),
      insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
      insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
      insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
      insforge.database.from("opportunities").select("id", { count: "exact" }).limit(1),
      insforge.database.from("partners").select("id", { count: "exact" }).eq("is_active", true).limit(1),
    ]);
    if (membersRes.status === "fulfilled") setMemberCount((membersRes.value as any).count ?? 0);
    if (partnersRes.status === "fulfilled") setPartnerCount((partnersRes.value as any).count ?? 0);
    const total =
      (jobsRes.status === "fulfilled" ? ((jobsRes.value as any).count ?? 0) : 0) +
      (scholRes.status === "fulfilled" ? ((scholRes.value as any).count ?? 0) : 0) +
      (trainRes.status === "fulfilled" ? ((trainRes.value as any).count ?? 0) : 0) +
      (oppRes.status === "fulfilled" ? ((oppRes.value as any).count ?? 0) : 0);
    setOppCount(total);
  };

  useEffect(() => {
    fetchReviews();
    fetchStories();
    fetchStats();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    fetchReviews(cat);
  };

  const handleSubmitReview = async () => {
    if (!user?.id || reviewRating === 0 || !reviewBody.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          rating: reviewRating,
          category: reviewCategory,
          title: reviewTitle.trim() || undefined,
          reviewBody: reviewBody.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setReviewDone(true);
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!user?.id || !storyTitle.trim() || !storyDesc.trim()) return;
    setSubmittingStory(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "story",
          displayName: storyDisplayName.trim() || "Anonymous",
          outcomeType: storyOutcomeType,
          outcomeTitle: storyTitle.trim(),
          outcomeDescription: storyDesc.trim(),
          organization: storyOrg.trim() || undefined,
          location: storyLocation.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStoryDone(true);
    } catch {
      alert("Failed to submit story. Please try again.");
    } finally {
      setSubmittingStory(false);
    }
  };

  const getOutcomeInfo = (type: string) => {
    return OUTCOME_TYPES.find(o => o.value === type) ?? OUTCOME_TYPES[OUTCOME_TYPES.length - 1];
  };

  const trustStats = [
    { icon: Star, value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: "Avg Rating", sub: `from ${totalReviews} reviews`, color: "text-yellow-500" },
    { icon: Users, value: memberCount > 0 ? `${memberCount.toLocaleString()}+` : "—", label: "Community Members", sub: "registered users", color: "text-blue-500" },
    { icon: Target, value: oppCount > 0 ? `${oppCount}+` : "—", label: "Opportunities Listed", sub: "jobs, scholarships & more", color: "text-green-500" },
    { icon: Building2, value: partnerCount > 0 ? `${partnerCount}+` : "—", label: "Partner Institutions", sub: "trusted partners", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">COMMUNITY TRUST</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">What Our Community Says</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-8">
            Real reviews and success stories from students and professionals who have used StarzLink to find opportunities and grow.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <>
                <button
                  onClick={() => { setShowReviewModal(true); setReviewDone(false); }}
                  className="bg-white text-[#0d1b4b] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Star className="w-4 h-4 text-yellow-500" /> Write a Review
                </button>
                <button
                  onClick={() => { setShowStoryModal(true); setStoryDone(false); }}
                  className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trophy className="w-4 h-4" /> Share Your Story
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="bg-white text-[#0d1b4b] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Login to Write a Review
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
            {trustStats.map(({ icon: Icon, value, label, sub, color }) => (
              <div key={label} className="text-center px-4 first:pl-0 last:pr-0">
                <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
                <div className="text-3xl font-extrabold text-gray-900">{value}</div>
                <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Platform Reviews</h2>
            <p className="text-gray-500 text-sm mt-1">{totalReviews} reviews from our community</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.value
                    ? "bg-[#1a3c8f] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <Star className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">Be the first to share your experience</p>
                {user && (
                  <button
                    onClick={() => { setShowReviewModal(true); setReviewDone(false); }}
                    className="mt-3 text-xs text-[#1a3c8f] font-semibold hover:underline"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map(review => {
              const name = (review.profiles as any)?.full_name ?? "Anonymous";
              const isExpanded = expandedReviews.has(review.id);
              return (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {name[0]?.toUpperCase() ?? "A"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{maskName(name)}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </div>
                    {review.is_verified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#1a3c8f] bg-blue-50 px-2 py-0.5 rounded-full self-start">
                    {CATEGORY_LABELS[review.category] ?? review.category}
                  </span>
                  {review.title && (
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{review.title}</h3>
                  )}
                  <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                    {review.body}
                  </p>
                  {review.body.length > 120 && (
                    <button
                      onClick={() => setExpandedReviews(prev => {
                        const next = new Set(prev);
                        isExpanded ? next.delete(review.id) : next.add(review.id);
                        return next;
                      })}
                      className="text-xs text-[#1a3c8f] font-semibold hover:underline self-start"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Stories */}
      <div className="bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">COMMUNITY WINS</p>
              <h2 className="text-2xl font-extrabold text-white">Real Outcomes From Our Community</h2>
              <p className="text-blue-200 text-sm mt-1">{totalStories > 0 ? `${totalStories} success stories and counting` : "Be the first to share your success"}</p>
            </div>
            {user && (
              <button
                onClick={() => { setShowStoryModal(true); setStoryDone(false); }}
                className="bg-white text-[#0d1b4b] font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> Share Your Story
              </button>
            )}
          </div>

          {stories.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { type: "scholarship_won", title: "Won a full scholarship to study abroad", org: "Share yours!" },
                { type: "job_hired", title: "Landed a job through StarzLink", org: "Your story matters" },
                { type: "internship_secured", title: "Secured a prestigious internship", org: "Inspire others" },
              ].map((p, i) => {
                const info = getOutcomeInfo(p.type);
                const Icon = info.icon;
                return (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 opacity-60">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${info.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {info.label}
                    </div>
                    <p className="text-white font-bold text-sm">{p.title}</p>
                    <p className="text-blue-300 text-xs mt-2">{p.org}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stories.map(story => {
                const info = getOutcomeInfo(story.outcome_type);
                const Icon = info.icon;
                return (
                  <div key={story.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${info.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {info.label}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2 leading-snug">{story.outcome_title}</h3>
                    <p className="text-blue-200 text-xs leading-relaxed line-clamp-3">{story.outcome_description}</p>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-white text-xs font-semibold">{story.user_display_name}</p>
                        {(story.organization || story.location) && (
                          <p className="text-blue-300 text-[10px] mt-0.5">
                            {[story.organization, story.location].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {story.is_verified && (
                          <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-[10px] text-blue-400">
                          {new Date(story.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="p-6">
              {reviewDone ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-500 text-sm">Your review will be published after moderation. We appreciate your feedback!</p>
                  <button onClick={() => setShowReviewModal(false)} className="mt-5 bg-[#1a3c8f] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Write a Review</h3>
                  <p className="text-gray-500 text-sm mb-5">Share your experience with the StarzLink community</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
                      <InteractiveStars value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                      <select
                        value={reviewCategory}
                        onChange={e => setReviewCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                      >
                        {CATEGORIES.filter(c => c.value !== "all").map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (optional)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Review *</label>
                      <textarea
                        value={reviewBody}
                        onChange={e => setReviewBody(e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] resize-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || reviewRating === 0 || !reviewBody.trim()}
                      className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Review"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="p-6">
              {storyDone ? (
                <div className="text-center py-6">
                  <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Story Submitted!</h3>
                  <p className="text-gray-500 text-sm">Your success story will inspire others. It will be published after review.</p>
                  <button onClick={() => setShowStoryModal(false)} className="mt-5 bg-[#1a3c8f] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Share Your Story</h3>
                  <p className="text-gray-500 text-sm mb-5">Inspire others with your success</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
                      <input
                        type="text"
                        value={storyDisplayName}
                        onChange={e => setStoryDisplayName(e.target.value)}
                        placeholder="How should we display your name?"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Outcome Type *</label>
                      <select
                        value={storyOutcomeType}
                        onChange={e => setStoryOutcomeType(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                      >
                        {OUTCOME_TYPES.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Story Title *</label>
                      <input
                        type="text"
                        value={storyTitle}
                        onChange={e => setStoryTitle(e.target.value)}
                        placeholder="e.g. Won a full scholarship to study abroad"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                      <textarea
                        value={storyDesc}
                        onChange={e => setStoryDesc(e.target.value)}
                        placeholder="Tell us how StarzLink helped you achieve this..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] resize-none text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization</label>
                        <input
                          type="text"
                          value={storyOrg}
                          onChange={e => setStoryOrg(e.target.value)}
                          placeholder="e.g. Harvard University"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                        <input
                          type="text"
                          value={storyLocation}
                          onChange={e => setStoryLocation(e.target.value)}
                          placeholder="e.g. USA, Liberia"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSubmitStory}
                      disabled={submittingStory || !storyTitle.trim() || !storyDesc.trim()}
                      className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingStory ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Story"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
