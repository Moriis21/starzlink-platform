"use client";

import { useState, useEffect } from "react";
import { savedApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bookmark, Briefcase, GraduationCap, BookOpen, Globe, Trash2, ExternalLink, BookmarkX } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Tab = "all" | "job" | "scholarship" | "training" | "opportunity";

const TAB_ICONS: Record<string, React.ElementType> = {
  all: Bookmark, job: Briefcase, scholarship: GraduationCap, training: BookOpen, opportunity: Globe,
};

const TYPE_PATHS: Record<string, string> = {
  job: "/opportunities/jobs",
  scholarship: "/opportunities/scholarships",
  training: "/opportunities/trainings",
  opportunity: "/opportunities",
};

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    const res = await savedApi.getAll();
    setItems(res.data?.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleRemove = async (id: string) => {
    setRemoving(id);
    await savedApi.remove(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removed from saved");
    setRemoving(null);
  };

  const filtered = activeTab === "all" ? items : items.filter(i => i.item_type === activeTab);
  const tabs: Tab[] = ["all", "job", "scholarship", "training", "opportunity"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Saved Items</h1>
        <p className="text-gray-500 text-sm">All your bookmarked opportunities in one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        {tabs.map(tab => {
          const Icon = TAB_ICONS[tab];
          const count = tab === "all" ? items.length : items.filter(i => i.item_type === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize", activeTab === tab ? "bg-[#1a3c8f] text-white" : "text-gray-600 hover:bg-gray-100")}
            >
              <Icon className="w-4 h-4" />
              {tab === "all" ? "All" : tab}{count > 0 && <span className={cn("text-xs px-1.5 py-0.5 rounded-full", activeTab === tab ? "bg-white/20" : "bg-gray-100")}>{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-32" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <BookmarkX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 text-xl mb-2">Nothing saved yet</h3>
          <p className="text-gray-400 mb-6">{activeTab === "all" ? "Start bookmarking opportunities to see them here." : `No saved ${activeTab}s yet.`}</p>
          <Link href="/opportunities" className="inline-block bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors">
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-[#1a3c8f] bg-blue-50 px-2.5 py-1 rounded-full capitalize">{item.item_type}</span>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title ?? item.item_id}</h3>
              {item.organization && <p className="text-sm text-gray-500 mb-2">{item.organization}</p>}
              {item.deadline && (
                <p className="text-xs text-red-500 mb-3">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Link
                  href={`${TYPE_PATHS[item.item_type] ?? "/opportunities"}/${item.item_id}`}
                  className="flex-1 text-center px-3 py-2 bg-[#1a3c8f] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-1"
                >
                  View Details <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
