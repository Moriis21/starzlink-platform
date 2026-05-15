"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  RefreshCw,
  Search,
  GraduationCap,
  Briefcase,
  BookOpen,
  Mail,
  FileText,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  category: string;
  title: string | null;
  body: string;
  is_verified: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: { full_name: string } | null;
}

interface Story {
  id: string;
  user_id: string;
  user_display_name: string;
  outcome_type: string;
  outcome_title: string;
  outcome_description: string;
  organization: string | null;
  location: string | null;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  opportunity_quality: "Opportunity Quality",
  application_experience: "Application Experience",
  platform_usefulness: "Platform Usefulness",
  overall_satisfaction: "Overall Satisfaction",
};

const OUTCOME_LABELS: Record<string, string> = {
  scholarship_won: "Scholarship",
  internship_secured: "Internship",
  job_hired: "Job Hired",
  course_completed: "Course",
  letter_sent: "Letter Sent",
  cv_improved: "CV Improved",
  other: "Other",
};

const OUTCOME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  scholarship_won: GraduationCap,
  internship_secured: Briefcase,
  job_hired: Briefcase,
  course_completed: BookOpen,
  letter_sent: Mail,
  cv_improved: FileText,
  other: HelpCircle,
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "stories">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await insforge.database
        .from("platform_reviews")
        .select("*, profiles!user_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      setReviews((data as any) ?? []);
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data } = await insforge.database
        .from("success_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setStories((data as any) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
    else fetchStories();
  }, [activeTab]);

  const toggleReviewPublished = async (id: string, current: boolean) => {
    const { error } = await insforge.database
      .from("platform_reviews")
      .update({ is_published: !current })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(current ? "Review unpublished" : "Review published");
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_published: !current } : r));
  };

  const toggleReviewVerified = async (id: string, current: boolean) => {
    const { error } = await insforge.database
      .from("platform_reviews")
      .update({ is_verified: !current })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(current ? "Verification removed" : "Review verified");
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_verified: !current } : r));
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await insforge.database
      .from("platform_reviews")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Review deleted");
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const toggleStoryPublished = async (id: string, current: boolean) => {
    const { error } = await insforge.database
      .from("success_stories")
      .update({ is_published: !current })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(current ? "Story unpublished" : "Story published");
    setStories(prev => prev.map(s => s.id === id ? { ...s, is_published: !current } : s));
  };

  const toggleStoryVerified = async (id: string, current: boolean) => {
    const { error } = await insforge.database
      .from("success_stories")
      .update({ is_verified: !current })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(current ? "Verification removed" : "Story verified");
    setStories(prev => prev.map(s => s.id === id ? { ...s, is_verified: !current } : s));
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    const { error } = await insforge.database
      .from("success_stories")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Story deleted");
    setStories(prev => prev.filter(s => s.id !== id));
  };

  const filteredReviews = reviews.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (r.profiles as any)?.full_name ?? "";
    return (
      name.toLowerCase().includes(q) ||
      (r.title ?? "").toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const filteredStories = stories.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.user_display_name.toLowerCase().includes(q) ||
      s.outcome_title.toLowerCase().includes(q) ||
      s.outcome_description.toLowerCase().includes(q)
    );
  });

  const publishedReviews = reviews.filter(r => r.is_published).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Reviews & Stories
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage community reviews and success stories</p>
        </div>
        <button
          onClick={() => activeTab === "reviews" ? fetchReviews() : fetchStories()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a3c8f] px-3 py-2 rounded-lg border border-gray-200 hover:border-[#1a3c8f] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length, icon: Star, color: "text-yellow-500 bg-yellow-50" },
          { label: "Published", value: publishedReviews, icon: Eye, color: "text-green-600 bg-green-50" },
          { label: "Avg Rating", value: avgRating, icon: Star, color: "text-orange-500 bg-orange-50" },
          { label: "Total Stories", value: stories.length, icon: Trophy, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-0 flex-wrap gap-4">
          <div className="flex gap-4 border-b border-gray-100 w-full">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "reviews" ? "border-[#1a3c8f] text-[#1a3c8f]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "stories" ? "border-[#1a3c8f] text-[#1a3c8f]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Success Stories ({stories.length})
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === "reviews" ? "Search reviews..." : "Search stories..."}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-[#1a3c8f] animate-spin" />
          </div>
        ) : activeTab === "reviews" ? (
          <div className="overflow-x-auto">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No reviews found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Excerpt</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900 max-w-[120px] truncate">
                          {(review.profiles as any)?.full_name ?? "Unknown"}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StarDisplay rating={review.rating} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {CATEGORY_LABELS[review.category] ?? review.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="max-w-[200px]">
                          {review.title && <p className="font-semibold text-gray-900 text-xs truncate">{review.title}</p>}
                          <p className="text-gray-500 text-xs truncate">{review.body}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${review.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {review.is_published ? <><CheckCircle className="w-2.5 h-2.5" /> Published</> : <><XCircle className="w-2.5 h-2.5" /> Hidden</>}
                          </span>
                          {review.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleReviewPublished(review.id, review.is_published)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#1a3c8f]"
                            title={review.is_published ? "Unpublish" : "Publish"}
                          >
                            {review.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => toggleReviewVerified(review.id, review.is_verified)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-yellow-600"
                            title={review.is_verified ? "Remove verification" : "Mark verified"}
                          >
                            <CheckCircle className={`w-4 h-4 ${review.is_verified ? "text-yellow-500 fill-yellow-100" : ""}`} />
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredStories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No success stories yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Org / Location</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStories.map(story => {
                    const Icon = OUTCOME_ICONS[story.outcome_type] ?? HelpCircle;
                    return (
                      <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900 max-w-[120px] truncate">{story.user_display_name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Icon className="w-3 h-3" /> {OUTCOME_LABELS[story.outcome_type] ?? story.outcome_type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="max-w-[180px]">
                            <p className="font-semibold text-gray-900 text-xs truncate">{story.outcome_title}</p>
                            <p className="text-gray-500 text-xs truncate">{story.outcome_description}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {[story.organization, story.location].filter(Boolean).join(" / ") || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${story.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {story.is_published ? <><CheckCircle className="w-2.5 h-2.5" /> Published</> : <><XCircle className="w-2.5 h-2.5" /> Hidden</>}
                            </span>
                            {story.is_verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit">
                                <CheckCircle className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleStoryPublished(story.id, story.is_published)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#1a3c8f]"
                              title={story.is_published ? "Unpublish" : "Publish"}
                            >
                              {story.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => toggleStoryVerified(story.id, story.is_verified)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-yellow-600"
                              title={story.is_verified ? "Remove verification" : "Mark verified"}
                            >
                              <CheckCircle className={`w-4 h-4 ${story.is_verified ? "text-yellow-500 fill-yellow-100" : ""}`} />
                            </button>
                            <button
                              onClick={() => deleteStory(story.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
