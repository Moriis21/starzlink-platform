"use client";

import { useState, useEffect } from "react";
import { Search, SearchX, GraduationCap, Briefcase, BookOpen, Megaphone } from "lucide-react";
import { jobsApi, scholarshipsApi, trainingsApi } from "@/lib/api";
import OpportunityCard from "@/components/ui/OpportunityCard";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import { Job, Scholarship, Training } from "@/types";

type Category = "all" | "jobs" | "scholarships" | "trainings";

export default function OpportunitiesPage() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "12", sort: sortBy };
      if (search) params.search = search;
      if (location) params.location = location;

      if (category === "all" || category === "jobs") {
        const res = await jobsApi.getAll({ ...params, status: "active" });
        setJobs(res.data?.data || res.data || []);
        if (category === "jobs") setTotalPages(res.data?.total_pages || 1);
      }
      if (category === "all" || category === "scholarships") {
        const res = await scholarshipsApi.getAll({ ...params, status: "active" });
        setScholarships(res.data?.data || res.data || []);
        if (category === "scholarships") setTotalPages(res.data?.total_pages || 1);
      }
      if (category === "all" || category === "trainings") {
        const res = await trainingsApi.getAll({ ...params, status: "active" });
        setTrainings(res.data?.data || res.data || []);
        if (category === "trainings") setTotalPages(res.data?.total_pages || 1);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [category, page, sortBy]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchData(); };

  const allItems = [
    ...jobs.map(j => ({ ...j, _type: "job" as const })),
    ...scholarships.map(s => ({ ...s, _type: "scholarship" as const })),
    ...trainings.map(t => ({ ...t, _type: "training" as const, organization: t.provider })),
  ];

  return (
    <div>
      {/* Hero with brand image */}
      <div className="relative bg-[#0d1b4b] py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/explore-opportunities.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center opacity-25"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b4b]/90 via-[#0d1b4b]/85 to-[#1a3c8f]/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">EXPLORE ALL OPPORTUNITIES</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight">
            Your Future Starts With the<br />
            <span className="text-blue-300">Right Opportunities</span>
          </h1>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">
            Explore verified scholarships, jobs, trainings and campus updates from top organizations around the world.
          </p>

          {/* Quick category stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: GraduationCap, label: "Scholarships", count: "250+ Available" },
              { icon: Briefcase, label: "Jobs", count: "350+ Openings" },
              { icon: BookOpen, label: "Trainings", count: "120+ Programs" },
              { icon: Megaphone, label: "Campus Updates", count: "Events & News" },
            ].map(({ icon: Icon, label, count }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                <Icon className="w-4 h-4 text-blue-300" />
                <span className="font-semibold">{label}</span>
                <span className="text-blue-300 text-xs">· {count}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search scholarships, jobs, trainings..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none"
              />
            </div>
            <button type="submit" className="px-6 py-3.5 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(["all", "jobs", "scholarships", "trainings"] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${category === cat ? "bg-[#1a3c8f] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#1a3c8f] hover:text-[#1a3c8f]"}`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="newest">Most Recent</option>
              <option value="deadline">Deadline</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-24" />
                <div className="h-5 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-16 bg-gray-100 rounded mb-3" />
              </div>
            ))}
          </div>
        ) : allItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allItems.map((item) => (
              <OpportunityCard
                key={`${item._type}-${item.id}`}
                id={item.id}
                type={item._type}
                title={item.title}
                organization={"company" in item ? item.company : "provider" in item ? (item as any).provider : (item as any).provider}
                location={"location" in item ? (item as any).location : undefined}
                deadline={"deadline" in item ? (item as any).deadline : "start_date" in item ? (item as any).start_date : undefined}
                description={item.description}
                category={"category" in item ? (item as any).category : undefined}
                status={item.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No opportunities found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <WhatsAppBanner />
    </div>
  );
}
