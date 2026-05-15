"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { savedApi, jobsApi, scholarshipsApi, trainingsApi } from "@/lib/api";
import { Bookmark, Eye, Star, User, Bell, Briefcase, GraduationCap, BookOpen, Settings, TrendingUp, ChevronRight, MapPin, Calendar, Trash2, Sparkles } from "lucide-react";
import { formatDate, getDaysLeft, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentScholarships, setRecentScholarships] = useState<any[]>([]);
  const [recentTrainings, setRecentTrainings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"saved" | "recommended" | "foryou" | "jobs" | "scholarships">("foryou");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, j, sc, t] = await Promise.allSettled([
          savedApi.getAll(),
          jobsApi.getAll({ limit: 4, status: "active" }),
          scholarshipsApi.getAll({ limit: 4, status: "active" }),
          trainingsApi.getAll({ limit: 3, status: "active" }),
        ]);
        if (s.status === "fulfilled") setSaved(s.value.data?.data || []);
        if (j.status === "fulfilled") setRecentJobs(j.value.data?.data || []);
        if (sc.status === "fulfilled") setRecentScholarships(sc.value.data?.data || []);
        if (t.status === "fulfilled") setRecentTrainings(t.value.data?.data || []);
      } catch {}
      setLoading(false);
    };
    const fetchRecs = async () => {
      if (user?.id) {
        try {
          const recRes = await fetch(`/api/recommendations?userId=${user.id}&limit=4`);
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        } catch {}
      }
    };
    fetchAll();
    fetchRecs();
  }, [user?.id]);

  const handleRemoveSaved = async (id: string) => {
    try {
      await savedApi.remove(id);
      setSaved(s => s.filter(item => item.id !== id));
      toast.success("Removed from saved.");
    } catch { toast.error("Failed to remove."); }
  };

  const profileCompletion = user ? [user.full_name, user.email, user.phone, user.profile_image, user.user_type].filter(Boolean).length / 5 * 100 : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, <strong>{user?.full_name?.split(" ")[0]}</strong>! Here's your activity overview.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1a3c8f] to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {user?.profile_image ? <img src={user.profile_image} alt="avatar" className="w-full h-full rounded-full object-cover" /> : user?.full_name?.charAt(0) || "U"}
            </div>
            <h3 className="font-bold text-gray-900">{user?.full_name}</h3>
            <p className="text-sm text-gray-500 capitalize mb-1">{user?.user_type}</p>
            <p className="text-xs text-gray-400 mb-3">{user?.email}</p>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Profile Completion</span>
                <span className="font-semibold text-[#1a3c8f]">{Math.round(profileCompletion)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#1a3c8f] h-2 rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            <Link href="/profile" className="flex items-center justify-center gap-1.5 w-full border border-[#1a3c8f] text-[#1a3c8f] font-medium py-2 rounded-xl text-sm hover:bg-blue-50">
              <Settings className="w-4 h-4" /> Edit Profile
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {[
                { label: "Browse Jobs", href: "/opportunities/jobs", icon: Briefcase },
                { label: "Find Scholarships", href: "/opportunities/scholarships", icon: GraduationCap },
                { label: "View Trainings", href: "/trainings", icon: BookOpen },
                { label: "Submit Opportunity", href: "/submit", icon: TrendingUp },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a3c8f] py-1.5 group">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#1a3c8f]" />{label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-4 text-white">
            <Bell className="w-5 h-5 text-blue-300 mb-2" />
            <p className="font-bold text-sm mb-1">Stay Updated</p>
            <p className="text-xs text-blue-200 mb-3">Join our WhatsApp channel for daily opportunities.</p>
            <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 bg-white text-[#1a3c8f] text-xs font-bold py-2 rounded-lg hover:bg-blue-50 w-full">
              Join Now →
            </a>
          </div>

          {/* AI Tools Banner Card */}
          <Link href="/dashboard/ai-tools"
            className="block bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-[#1a3c8f]/20 hover:border-[#1a3c8f] rounded-2xl p-4 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm group-hover:text-[#1a3c8f]">AI Tools Hub</p>
                <p className="text-xs text-gray-500">9 tools available</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1a3c8f] ml-auto" />
            </div>
            <p className="text-xs text-gray-500">CV Analyzer · Essay Helper · Skills Assessment · Portfolio · and more</p>
          </Link>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Saved Items", value: saved.length, icon: Bookmark, color: "bg-blue-50 text-blue-600" },
              { label: "Recent Jobs", value: recentJobs.length, icon: Briefcase, color: "bg-purple-50 text-purple-600" },
              { label: "Scholarships", value: recentScholarships.length, icon: GraduationCap, color: "bg-green-50 text-green-600" },
              { label: "Trainings", value: recentTrainings.length, icon: BookOpen, color: "bg-orange-50 text-orange-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[
                { key: "foryou", label: "For You" },
                { key: "recommended", label: "Recommended" },
                { key: "saved", label: `Saved (${saved.length})` },
                { key: "jobs", label: "Latest Jobs" },
                { key: "scholarships", label: "Scholarships" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn("flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors", activeTab === tab.key ? "border-[#1a3c8f] text-[#1a3c8f] bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <>
                  {/* For You */}
                  {activeTab === "foryou" && (
                    <div className="space-y-3">
                      {recommendations.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          Complete your profile to get personalized recommendations.
                        </div>
                      ) : recommendations.map((item, i) => {
                        const daysLeft = item.deadline ? Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000) : null;
                        return (
                          <Link key={i} href={item._href} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item._color}`}>{item._label}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate group-hover:text-[#1a3c8f]">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.company || item.provider || item.organizer}</p>
                            </div>
                            {daysLeft !== null && daysLeft > 0 && (
                              <span className={`text-xs font-medium flex-shrink-0 ${daysLeft <= 7 ? "text-red-600" : "text-gray-400"}`}>{daysLeft}d left</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommended */}
                  {activeTab === "recommended" && (
                    <div className="space-y-3">
                      {[
                        ...recentJobs.slice(0, 3).map(j => ({ ...j, _type: "job", _href: `/opportunities/jobs/${j.id}`, _sub: j.company, _loc: j.location, _dead: j.deadline, _icon: Briefcase, _color: "bg-blue-100 text-blue-600" })),
                        ...recentScholarships.slice(0, 2).map(s => ({ ...s, _type: "scholarship", _href: `/opportunities/scholarships/${s.id}`, _sub: s.provider, _loc: s.country, _dead: s.deadline, _icon: GraduationCap, _color: "bg-purple-100 text-purple-600" })),
                      ].map((item, i) => {
                        const daysLeft = item._dead ? getDaysLeft(item._dead) : null;
                        return (
                          <Link key={i} href={item._href} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item._color}`}>
                              <item._icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate group-hover:text-[#1a3c8f]">{item.title}</p>
                              <p className="text-xs text-gray-500">{item._sub} {item._loc && `· ${item._loc}`}</p>
                            </div>
                            {daysLeft !== null && daysLeft > 0 && (
                              <span className={cn("text-xs font-medium flex-shrink-0", daysLeft <= 7 ? "text-red-600" : "text-gray-400")}>{daysLeft}d left</span>
                            )}
                          </Link>
                        );
                      })}
                      {recentJobs.length === 0 && recentScholarships.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">Loading recommendations from the database...</div>
                      )}
                    </div>
                  )}

                  {/* Saved */}
                  {activeTab === "saved" && (
                    saved.length > 0 ? (
                      <div className="space-y-3">
                        {saved.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 text-sm capitalize">{item.item_type} Opportunity</p>
                              <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/${item.item_type === "job" ? "opportunities/jobs" : item.item_type === "scholarship" ? "opportunities/scholarships" : item.item_type === "training" ? "trainings" : "campus-updates"}/${item.item_id}`} className="text-xs text-[#1a3c8f] font-medium hover:underline">View →</Link>
                              <button onClick={() => handleRemoveSaved(item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Bookmark className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No saved items yet.</p>
                        <Link href="/opportunities" className="text-[#1a3c8f] text-sm font-medium hover:underline mt-1 block">Browse Opportunities →</Link>
                      </div>
                    )
                  )}

                  {/* Jobs */}
                  {activeTab === "jobs" && (
                    <div className="space-y-3">
                      {recentJobs.map(job => (
                        <Link key={job.id} href={`/opportunities/jobs/${job.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 group transition-colors">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate group-hover:text-[#1a3c8f]">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.company} · <span className="flex items-center gap-0.5 inline-flex"><MapPin className="w-3 h-3" />{job.location}</span></p>
                          </div>
                          <span className="text-xs capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{job.job_type}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Scholarships */}
                  {activeTab === "scholarships" && (
                    <div className="space-y-3">
                      {recentScholarships.map(s => (
                        <Link key={s.id} href={`/opportunities/scholarships/${s.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 group transition-colors">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"><GraduationCap className="w-5 h-5" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700">{s.title}</p>
                            <p className="text-xs text-gray-500">{s.provider} · {s.country}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">{s.funding_type}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
