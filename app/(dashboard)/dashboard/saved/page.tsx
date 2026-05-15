"use client";

import { useState, useEffect } from "react";
import { savedApi } from "@/lib/api";
import {
  Bookmark, Briefcase, GraduationCap, BookOpen, Globe, Trash2,
  ExternalLink, BookmarkX, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import Breadcrumb from "@/components/ui/Breadcrumb";

type Tab = "active" | "expired" | "all" | "job" | "scholarship" | "training" | "opportunity";

const TYPE_ICONS: Record<string, React.ElementType> = {
  job: Briefcase, scholarship: GraduationCap, training: BookOpen, opportunity: Globe, internship: Briefcase, grant: Globe,
};
const TYPE_PATHS: Record<string, string> = {
  job: "/opportunities/jobs", scholarship: "/opportunities/scholarships",
  training: "/trainings", opportunity: "/opportunities", internship: "/opportunities/jobs", grant: "/opportunities",
};
const TYPE_COLORS: Record<string, string> = {
  job: "bg-blue-100 text-blue-700", scholarship: "bg-purple-100 text-purple-700",
  training: "bg-orange-100 text-orange-700", opportunity: "bg-green-100 text-green-700",
  internship: "bg-sky-100 text-sky-700", grant: "bg-teal-100 text-teal-700",
};

function isExpired(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function SavedItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await savedApi.getAll();
      setItems(res.data?.data ?? []);
    } catch { toast.error("Failed to load saved items."); }
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try {
      await savedApi.remove(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Removed from saved");
    } catch { toast.error("Failed to remove."); }
    setRemoving(null);
  };

  const activeItems = items.filter(i => !isExpired(i.deadline));
  const expiredItems = items.filter(i => isExpired(i.deadline));

  const filtered =
    tab === "all" ? items :
    tab === "active" ? activeItems :
    tab === "expired" ? expiredItems :
    items.filter(i => i.item_type === tab);

  const TABS = [
    { key: "active" as Tab, label: "Active", icon: Bookmark, count: activeItems.length },
    { key: "expired" as Tab, label: "Expired", icon: Clock, count: expiredItems.length },
    { key: "all" as Tab, label: "All", icon: Bookmark, count: items.length },
    { key: "job" as Tab, label: "Jobs", icon: Briefcase, count: items.filter(i => i.item_type === "job").length },
    { key: "scholarship" as Tab, label: "Scholarships", icon: GraduationCap, count: items.filter(i => i.item_type === "scholarship").length },
    { key: "training" as Tab, label: "Trainings", icon: BookOpen, count: items.filter(i => i.item_type === "training").length },
  ].filter(t => t.count > 0 || t.key === "active" || t.key === "all");

  return (
    <div>
      <Breadcrumb crumbs={[{ label: "Saved Items" }]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#1a3c8f]" /> Saved Items
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {items.length} total · {activeItems.length} active · {expiredItems.length} expired
          </p>
        </div>
        <button onClick={fetchSaved} className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-5 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              tab === t.key ? (t.key === "expired" ? "bg-red-500 text-white" : "bg-[#1a3c8f] text-white") : "text-gray-600 hover:bg-gray-100"
            )}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tab === t.key ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Expired notice on active tab */}
      {tab === "active" && expiredItems.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {expiredItems.length} saved {expiredItems.length === 1 ? "item has" : "items have"} expired.{" "}
          <button onClick={() => setTab("expired")} className="font-semibold underline">View expired →</button>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-36" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <BookmarkX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 text-xl mb-2">
            {tab === "expired" ? "No expired items" : "Nothing saved yet"}
          </h3>
          <p className="text-gray-400 mb-6">
            {tab === "expired" ? "All your saved items are still active." : "Browse opportunities and click Save to bookmark them."}
          </p>
          {tab !== "expired" && (
            <Link href="/opportunities" className="inline-block bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900">
              Explore Opportunities
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const expired = isExpired(item.deadline);
            const Icon = TYPE_ICONS[item.item_type] ?? Globe;
            const typeColor = TYPE_COLORS[item.item_type] ?? "bg-gray-100 text-gray-600";
            const viewPath = `${TYPE_PATHS[item.item_type] ?? "/opportunities"}/${item.item_id}`;
            return (
              <div key={item.id} className={cn("bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow",
                expired ? "border-red-100 bg-red-50/20" : "border-gray-100")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex items-center gap-1", typeColor)}>
                      <Icon className="w-3.5 h-3.5" />{item.item_type}
                    </span>
                    {expired && (
                      <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expired
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleRemove(item.id)} disabled={removing === item.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 leading-snug">{item.title ?? "Saved Opportunity"}</h3>
                {item.organization && <p className="text-sm text-gray-500 mb-1">{item.organization}</p>}
                {item.deadline && (
                  <p className={cn("text-xs font-medium mb-1 flex items-center gap-1", expired ? "text-red-500" : "text-gray-400")}>
                    <Clock className="w-3 h-3" />
                    {expired ? "Expired" : "Deadline"}: {new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-4">Saved {formatDate(item.created_at)}</p>
                {expired ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 text-center">
                    This opportunity has expired and is no longer accepting applications.
                  </div>
                ) : (
                  <Link href={viewPath}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 bg-[#1a3c8f] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors">
                    View Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
