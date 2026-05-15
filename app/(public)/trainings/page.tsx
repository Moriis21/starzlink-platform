"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Star, Calendar, Clock, MapPin, UserCheck, RefreshCw, Award, TrendingUp } from "lucide-react";
import { trainingsApi } from "@/lib/api";
import { Training } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import { Bookmark } from "lucide-react";

const categories = ["IT & Software", "Business", "Design", "Data Science", "Personal Development", "Language", "Health", "Marketing"];
const levels = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Online Live", "Self-Paced", "Physical", "Hybrid"];
const durations = ["Less than 2 Weeks", "2-8 Weeks", "More than 8 Weeks"];

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", level: "", mode: "", duration: "" });
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "10", sort: sortBy, status: "active" };
      if (search) params.search = search;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await trainingsApi.getAll(params);
      setTrainings(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, sortBy, filters]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-8 sm:py-14 px-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute right-10 top-5 w-64 h-64 bg-blue-300 rounded-full blur-3xl" /></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">Build Skills. Boost Your Future.</h1>
          <p className="text-blue-200 mb-5 text-sm sm:text-base">Explore professional training programs and certifications to help you grow.</p>
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:flex sm:gap-2 bg-white/10 rounded-2xl p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search training programs, skills or keywords" className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none" />
            </div>
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full sm:w-auto py-3 px-3 rounded-xl text-gray-700 text-sm bg-white focus:outline-none">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.level}
              onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
              className="w-full sm:w-auto py-3 px-3 rounded-xl text-gray-700 text-sm bg-white focus:outline-none">
              <option value="">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              value={filters.mode}
              onChange={e => setFilters(f => ({ ...f, mode: e.target.value }))}
              className="w-full sm:w-auto py-3 px-3 rounded-xl text-gray-700 text-sm bg-white focus:outline-none">
              <option value="">All Modes</option>
              {modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button type="submit" className="w-full sm:w-auto px-5 py-3 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <span className="text-gray-900">Trainings</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setFilters({ category: "", level: "", mode: "", duration: "" })} className="text-xs text-[#1a3c8f] hover:underline">Reset</button>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
              {categories.map(c => (
                <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" checked={filters.category === c} onChange={e => setFilters(f => ({ ...f, category: e.target.checked ? c : "" }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{c}</span>
                </label>
              ))}
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Level</h4>
              {levels.map(l => (
                <label key={l} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="level" checked={filters.level === l} onChange={() => setFilters(f => ({ ...f, level: l }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{l}</span>
                </label>
              ))}
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Mode</h4>
              {modes.map(m => (
                <label key={m} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" checked={filters.mode === m} onChange={e => setFilters(f => ({ ...f, mode: e.target.checked ? m : "" }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{m}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Duration</h4>
              {durations.map(d => (
                <label key={d} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="duration" checked={filters.duration === d} onChange={() => setFilters(f => ({ ...f, duration: d }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{d}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">All Trainings</h2>
              <p className="text-sm text-gray-500">Showing {trainings.length} trainings</p>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="popular">Most Popular</option>
              <option value="newest">Most Recent</option>
              <option value="start_date">Start Date</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-36" />)}</div>
          ) : trainings.length > 0 ? (
            <div className="space-y-4">
              {trainings.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group flex gap-4">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-orange-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex flex-wrap gap-1.5">
                        {t.level && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t.level}</span>}
                        {t.mode && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{t.mode}</span>}
                        {t.certificate_status && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t.certificate_status}</span>}
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-[#1a3c8f] rounded-lg flex-shrink-0"><Bookmark className="w-4 h-4" /></button>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors mb-1">{t.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{t.provider}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.duration}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(t.start_date)}</span>
                      {t.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t.location}</span>}
                      <span className="font-semibold text-[#1a3c8f]">{t.fee === "0" || t.fee === "Free" ? "FREE" : t.fee}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                    <Link href={`/trainings/${t.id}`} className="text-sm font-semibold text-white bg-[#1a3c8f] px-4 py-2 rounded-lg hover:bg-blue-900 whitespace-nowrap">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No trainings found</h3>
              <p className="text-gray-500">Try adjusting filters or search terms.</p>
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

          {/* Why Learn */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: UserCheck, title: "Expert Instructors", desc: "Learn from industry professionals.", color: "bg-blue-100 text-blue-600" },
              { icon: RefreshCw, title: "Flexible Learning", desc: "Self-paced or live instructor-led.", color: "bg-purple-100 text-purple-600" },
              { icon: Award, title: "Certificates", desc: "Get recognized certificates.", color: "bg-green-100 text-green-600" },
              { icon: TrendingUp, title: "Career Growth", desc: "Build in-demand skills.", color: "bg-orange-100 text-orange-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <WhatsAppBanner />
    </div>
  );
}

