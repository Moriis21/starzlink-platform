"use client";

import { useState, useEffect } from "react";
import { Search, Megaphone, Calendar, Building2, Bookmark, LayoutList, Newspaper, PartyPopper, BellRing, GraduationCap, ClipboardList } from "lucide-react";
import { campusApi, newsletterApi } from "@/lib/api";
import { CampusUpdate } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import toast from "react-hot-toast";

const categories = [
  { id: "all", label: "All Updates", count: 256, icon: LayoutList },
  { id: "news", label: "News", count: 89, icon: Newspaper },
  { id: "events", label: "Events", count: 73, icon: PartyPopper },
  { id: "announcements", label: "Announcements", count: 64, icon: BellRing },
  { id: "scholarships", label: "Scholarships", count: 21, icon: GraduationCap },
  { id: "exams", label: "Exams & Results", count: 10, icon: ClipboardList },
];

const catColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  events: "bg-purple-100 text-purple-700",
  announcements: "bg-yellow-100 text-yellow-700",
  scholarships: "bg-green-100 text-green-700",
  exams: "bg-red-100 text-red-700",
  results: "bg-orange-100 text-orange-700",
};

export default function CampusUpdatesPage() {
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [institution, setInstitution] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newsEmail, setNewsEmail] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "10", sort: sortBy };
      if (category !== "all") params.category = category;
      if (institution) params.institution = institution;
      if (dateFilter !== "all") params.date_filter = dateFilter;
      const res = await campusApi.getAll(params);
      setUpdates(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, sortBy, category]);

  const handleNewsSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsletterApi.subscribe(newsEmail);
      toast.success("Subscribed to campus updates!");
      setNewsEmail("");
    } catch { toast.error("Failed to subscribe."); }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2">Stay Informed. Stay Ahead.</h1>
            <p className="text-blue-200">Get the latest campus news, events, announcements and important updates — all in one place.</p>
          </div>
          <div className="hidden lg:block bg-white/10 border border-white/20 rounded-2xl p-5 w-72">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-sm">Have an Update to Share?</span>
            </div>
            <p className="text-xs text-blue-200 mb-3">Submit news or events happening on your campus.</p>
            <Link href="/contact" className="block text-center bg-white text-[#1a3c8f] font-bold text-sm py-2 rounded-xl hover:bg-blue-50">Submit Update</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <span className="text-gray-900">Campus Updates</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setPage(1); }}
                    className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors", category === cat.id ? "bg-[#1a3c8f] text-white" : "text-gray-600 hover:bg-gray-50")}
                  >
                    <span className="flex items-center gap-2">
                      <CatIcon className="w-4 h-4" />
                      {cat.label}
                    </span>
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", category === cat.id ? "bg-white/20" : "bg-gray-100")}>{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Filter by Institution</h3>
            <select value={institution} onChange={e => setInstitution(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none">
              <option value="">All Institutions</option>
              <option>University of Lagos</option>
              <option>Covenant University</option>
              <option>University of Ibadan</option>
              <option>Babcock University</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Filter by Date</h3>
            {["all", "today", "week", "month"].map(d => (
              <label key={d} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="radio" name="date" checked={dateFilter === d} onChange={() => setDateFilter(d)} className="accent-[#1a3c8f]" />
                <span className="text-sm text-gray-600 capitalize">{d === "all" ? "All Time" : d === "week" ? "This Week" : d === "month" ? "This Month" : "Today"}</span>
              </label>
            ))}
          </div>

          {/* Stay Updated */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Stay Updated!</h4>
            <p className="text-xs text-gray-500 mb-3">Subscribe for campus news alerts.</p>
            <form onSubmit={handleNewsSubscribe}>
              <input value={newsEmail} onChange={e => setNewsEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none" />
              <button type="submit" className="w-full bg-[#1a3c8f] text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-900">Subscribe</button>
            </form>
          </div>

          {/* WhatsApp */}
          <div className="bg-gradient-to-b from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
            <p className="font-bold text-sm mb-1">Join Our WhatsApp Channel!</p>
            <p className="text-xs text-green-200 mb-3">Get real-time campus updates, announcements and alerts.</p>
            <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-3 py-2 rounded-lg w-full justify-center">Join Now →</a>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">Latest Campus Updates</h2>
              <p className="text-sm text-gray-500">Showing {updates.length} updates</p>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />)}</div>
          ) : updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex gap-4 p-5">
                  {update.image_url ? (
                    <img src={update.image_url} alt={update.title} className="w-28 h-24 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full uppercase", catColors[update.category] || "bg-gray-100 text-gray-600")}>{update.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                        <span>{formatDate(update.date)}</span>
                        <button className="p-1 hover:text-[#1a3c8f] rounded"><Bookmark className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors mb-1 line-clamp-2">{update.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{update.institution}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{update.description}</p>
                    <Link href={`/campus-updates/${update.id}`} className="text-sm font-semibold text-[#1a3c8f] hover:underline">View Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No updates found</h3>
              <p className="text-gray-500">Check back later for the latest campus news.</p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <WhatsAppBanner />
    </div>
  );
}

