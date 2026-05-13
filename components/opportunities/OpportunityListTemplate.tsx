"use client";

import { useState, useEffect } from "react";
import { Search, SearchX, MapPin, Calendar, ExternalLink, Clock } from "lucide-react";
import { opportunitiesApi, analyticsApi } from "@/lib/api";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface OpportunityConfig {
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ElementType;
  uniqueFieldLabel?: string;
  uniqueField?: string;
  badgeField?: string;
  badgeLabel?: string;
}

interface Props {
  type: string;
  config: OpportunityConfig;
  basePath: string;
}

export default function OpportunityListTemplate({ type, config, basePath }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { icon: Icon } = config;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { opportunity_type: type, page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await opportunitiesApi.getAll(params);
      const d = res.data;
      setItems(d?.data ?? []);
      setTotalPages(d?.total_pages ?? 1);
      setTotal(d?.total ?? 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, type]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  const handleApplyClick = async (item: any) => {
    await analyticsApi.track("apply_click", type, item.id, user?.id);
    if (item.application_link) window.open(item.application_link, "_blank");
  };

  const formatDeadline = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Expired", color: "text-red-500" };
    if (diff <= 7) return { label: `${diff}d left`, color: "text-orange-500" };
    return { label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date), color: "text-gray-500" };
  };

  return (
    <div>
      {/* Hero */}
      <div
        className="relative py-20 px-4 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
      >
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight">{config.title}</h1>
          <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">{config.subtitle}</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none"
              />
            </div>
            <button type="submit" className="px-6 py-3.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold rounded-xl transition-colors whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${total} ${config.title.toLowerCase()} available`}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Filter by location"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3c8f] w-40"
            />
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
                <div className="h-9 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const dl = formatDeadline(item.deadline);
              const badgeVal = config.badgeField ? item[config.badgeField] : null;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-[#1a3c8f] bg-blue-50 px-2.5 py-1 rounded-full capitalize">
                      {item.category || type.replace("_", " ")}
                    </span>
                    {item.is_remote && (
                      <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Remote</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{item.organizer}</p>

                  {badgeVal && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {config.badgeLabel}: {badgeVal}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{item.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.location}
                      </span>
                    )}
                    {dl && (
                      <span className={`flex items-center gap-1 ${dl.color}`}>
                        <Calendar className="w-3.5 h-3.5" /> {dl.label}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`${basePath}/${item.id}`}
                      className="flex-1 text-center px-3 py-2.5 border border-[#1a3c8f] text-[#1a3c8f] text-sm font-medium rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleApplyClick(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1a3c8f] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No {config.title.toLowerCase()} found</h3>
            <p className="text-gray-500">Try adjusting your search terms or check back later.</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
