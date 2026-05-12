"use client";

import { useState, useEffect } from "react";
import { Search, GraduationCap } from "lucide-react";
import { scholarshipsApi } from "@/lib/api";
import { Scholarship } from "@/types";
import { formatDate, getDaysLeft, cn } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import { Bookmark, Calendar, MapPin } from "lucide-react";

const studyLevels = ["Undergraduate", "Postgraduate", "Masters", "PhD", "Professional"];
const countries = ["All Countries", "USA", "UK", "Canada", "Australia", "Germany", "Netherlands", "Nigeria"];
const fundingTypes = ["Fully Funded", "Partial", "Tuition Only", "Stipend"];

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ study_level: "", country: "", funding_type: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "12", sort: sortBy, status: "active" };
      if (search) params.search = search;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await scholarshipsApi.getAll(params);
      const data = res.data;
      setScholarships(data?.data || data || []);
      setTotalPages(data?.total_pages || 1);
      setTotal(data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, sortBy, filters]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  return (
    <div>
      <div className="bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Discover Scholarships Worldwide</h1>
          <p className="text-purple-200 mb-6">Find fully-funded and partial scholarships from top universities and organizations.</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scholarships..." className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none" />
            </div>
            <button type="submit" className="px-6 py-3.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <Link href="/opportunities">Opportunities</Link> › <span className="text-gray-900">Scholarships</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setFilters({ study_level: "", country: "", funding_type: "" })} className="text-xs text-[#1a3c8f] hover:underline">Reset</button>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Study Level</h4>
              {studyLevels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="study_level" checked={filters.study_level === lvl} onChange={() => setFilters(f => ({ ...f, study_level: lvl }))} className="accent-purple-600" />
                  <span className="text-sm text-gray-600">{lvl}</span>
                </label>
              ))}
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Country</h4>
              <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none">
                {countries.map(c => <option key={c} value={c === "All Countries" ? "" : c}>{c}</option>)}
              </select>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Funding Type</h4>
              {fundingTypes.map(ft => (
                <label key={ft} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" checked={filters.funding_type === ft} onChange={e => setFilters(f => ({ ...f, funding_type: e.target.checked ? ft : "" }))} className="accent-purple-600" />
                  <span className="text-sm text-gray-600">{ft}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">Scholarships</h2>
              <p className="text-sm text-gray-500">Showing {scholarships.length} of {total || scholarships.length}</p>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="newest">Most Recent</option>
              <option value="deadline">Deadline</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-48" />)}
            </div>
          ) : scholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scholarships.map((s) => {
                const days = getDaysLeft(s.deadline);
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">{s.funding_type}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{s.study_level}</span>
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Bookmark className="w-4 h-4" /></button>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{s.provider}</p>
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.country}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className={cn("text-xs font-medium flex items-center gap-1", days <= 7 && days > 0 ? "text-red-600" : "text-gray-500")}>
                        <Calendar className="w-3.5 h-3.5" />{days > 0 ? `${days} days left` : "Expired"} · {formatDate(s.deadline)}
                      </span>
                      <Link href={`/opportunities/scholarships/${s.id}`} className="text-sm font-semibold text-purple-700 hover:underline">View Details →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No scholarships found</h3>
              <p className="text-gray-500">Try different filters or check back later.</p>
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      <WhatsAppBanner />
    </div>
  );
}
