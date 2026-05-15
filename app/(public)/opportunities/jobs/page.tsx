"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Briefcase } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/types";
import { formatDate, getDaysLeft, cn } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import { Bookmark, Building2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const jobCategories = ["Engineering", "IT & Software", "Administration", "Environment", "Media & Communications", "Education", "Healthcare", "Finance", "Marketing", "Design"];
const locations = ["All Locations", "Nigeria", "Ghana", "Kenya", "United States", "United Kingdom", "Remote"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", location: "", jobType: "", level: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "10", sort: sortBy, status: "active" };
      if (search) params.search = search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.job_type = filters.jobType;
      if (filters.level) params.level = filters.level;
      const res = await jobsApi.getAll(params);
      const data = res.data;
      setJobs(data?.data || data || []);
      setTotalPages(data?.total_pages || 1);
      setTotal(data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [page, sortBy, filters]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchJobs(); };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#2563eb] py-8 sm:py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">Find the Right Opportunity for You</h1>
          <p className="text-blue-200 mb-6">Explore verified job opportunities from top organizations around the world.</p>
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:flex sm:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by job title, keyword or company"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none border-0"
              />
            </div>
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl text-gray-700 text-sm focus:outline-none bg-white"
            >
              <option value="">All Categories</option>
              {jobCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl text-gray-700 text-sm focus:outline-none bg-white"
            >
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l === "All Locations" ? "" : l}>{l}</option>)}
            </select>
            <button type="submit" className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#0d1b4b] font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> <span className="mx-1">›</span>
        <Link href="/opportunities">Opportunities</Link> <span className="mx-1">›</span>
        <span className="text-gray-900">Jobs</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setFilters({ category: "", location: "", jobType: "", level: "" })} className="text-xs text-[#1a3c8f] hover:underline">Reset</button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
              {jobCategories.slice(0, 5).map(cat => (
                <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{cat}</span>
                </label>
              ))}
            </div>

            {/* Location */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Location</h4>
              {locations.slice(1).map(loc => (
                <label key={loc} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="location" value={loc} checked={filters.location === loc} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{loc}</span>
                </label>
              ))}
            </div>

            {/* Job Type */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Type</h4>
              {jobTypes.map(type => (
                <label key={type} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" checked={filters.jobType === type} onChange={e => setFilters(f => ({ ...f, jobType: e.target.checked ? type : "" }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{type}</span>
                </label>
              ))}
            </div>

            {/* Experience */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Experience Level</h4>
              {experienceLevels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="radio" name="level" value={lvl} checked={filters.level === lvl} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))} className="accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-600">{lvl}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">Job Opportunities</h2>
              <p className="text-sm text-gray-500">Showing {jobs.length} of {total || jobs.length} jobs</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                <option value="newest">Most Recent</option>
                <option value="deadline">Deadline</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1"><div className="h-5 bg-gray-200 rounded mb-2 w-1/2" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => {
                const daysLeft = getDaysLeft(job.deadline);
                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group p-5">
                    <div className="flex items-start gap-4">
                      {job.image_url ? (
                        <img src={job.image_url} alt={job.company} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-[#1a3c8f]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors">{job.title}</h3>
                          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0", job.job_type === "full-time" ? "bg-blue-100 text-blue-700" : job.job_type === "internship" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600")}>
                            {job.job_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{job.company} {job.company && "✓"}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.job_type}</span>
                          <span className={cn("flex items-center gap-1", daysLeft <= 3 ? "text-red-600 font-medium" : "")}>
                            Posted {formatDate(job.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-[#1a3c8f] transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/opportunities/jobs/${job.id}`}
                          className="text-sm font-semibold text-white bg-[#1a3c8f] px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

          <WhatsAppBanner />
        </div>
      </div>
    </div>
  );
}

