"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Eye, Bookmark, ExternalLink, Search, Users, BarChart2, Loader2, RefreshCw } from "lucide-react";

const PERIODS = [{ value: "1d", label: "Today" }, { value: "7d", label: "7 Days" }, { value: "30d", label: "30 Days" }];
const TYPES = [{ value: "all", label: "All Types" }, { value: "job", label: "Jobs" }, { value: "scholarship", label: "Scholarships" }, { value: "training", label: "Trainings" }];

export default function ActivityDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [type, setType] = useState("all");
  const [activeTab, setActiveTab] = useState<"views" | "saves" | "applies" | "keywords" | "categories">("views");

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/activity-dashboard?period=${period}&type=${type}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { load(); }, [period, type]);

  const maxTrend = data?.trend ? Math.max(...data.trend.map((d: any) => Math.max(d.views, d.saves, d.applies))) || 1 : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Activity Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real analytics — no fake data</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {PERIODS.map(p => <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p.value ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>{p.label}</button>)}
          </div>
          <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={load} disabled={loading} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Events", value: data?.totalEvents || 0, icon: <TrendingUp className="w-5 h-5" />, color: "bg-blue-50 text-blue-700" },
              { label: "Active Users", value: data?.activeUsers || 0, icon: <Users className="w-5 h-5" />, color: "bg-purple-50 text-purple-700" },
              { label: "Most Viewed", value: data?.mostViewed?.[0]?.title || "—", icon: <Eye className="w-5 h-5" />, color: "bg-green-50 text-green-700", small: true },
              { label: "Top Keyword", value: data?.topKeywords?.[0]?.keyword || "—", icon: <Search className="w-5 h-5" />, color: "bg-orange-50 text-orange-700", small: true },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${card.color}`}>{card.icon}</div>
                <div className={`font-extrabold text-gray-900 ${card.small ? "text-sm" : "text-2xl"} truncate`}>{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Trend chart (visual bars) */}
          {data?.trend && data.trend.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <h2 className="font-bold text-gray-800 mb-4 text-sm">Engagement Trend ({period === "1d" ? "Today" : period === "7d" ? "Last 7 Days" : "Last 30 Days"})</h2>
              <div className="flex items-end gap-1 h-32">
                {data.trend.map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div className="relative w-full flex gap-0.5 items-end h-24">
                      {[{ val: d.views, color: "bg-blue-400" }, { val: d.saves, color: "bg-purple-400" }, { val: d.applies, color: "bg-green-400" }].map((bar, bi) => (
                        <div key={bi} title={`${bar.val}`} className={`flex-1 rounded-t transition-all ${bar.color} opacity-80`} style={{ height: `${(bar.val / maxTrend) * 100}%`, minHeight: bar.val > 0 ? "2px" : "0" }} />
                      ))}
                    </div>
                    <span className="text-[9px] text-gray-400 rotate-45 origin-left hidden sm:block">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                {[{ color: "bg-blue-400", label: "Views" }, { color: "bg-purple-400", label: "Saves" }, { color: "bg-green-400", label: "Applies" }].map(l => (
                  <span key={l.label} className="flex items-center gap-1"><span className={`w-3 h-3 rounded ${l.color}`} />{l.label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tab nav */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {[{ key: "views", label: "Most Viewed", icon: <Eye className="w-4 h-4" /> }, { key: "saves", label: "Most Saved", icon: <Bookmark className="w-4 h-4" /> }, { key: "applies", label: "Most Applied", icon: <ExternalLink className="w-4 h-4" /> }, { key: "keywords", label: "Keywords", icon: <Search className="w-4 h-4" /> }, { key: "categories", label: "Categories", icon: <BarChart2 className="w-4 h-4" /> }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Content table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {(activeTab === "views" || activeTab === "saves" || activeTab === "applies") && (() => {
              const items = activeTab === "views" ? data?.mostViewed : activeTab === "saves" ? data?.mostSaved : data?.mostApplied;
              return (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">#</th><th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Opportunity</th><th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Type</th><th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Count</th></tr></thead>
                  <tbody>
                    {(items || []).length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-gray-400">No data for this period.</td></tr>
                    ) : (items || []).map((item: any, i: number) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-gray-800 truncate max-w-xs">{item.title}</td>
                        <td className="px-5 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{item.type || "general"}</span></td>
                        <td className="px-5 py-3 text-right font-bold text-[#1a3c8f]">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}

            {activeTab === "keywords" && (
              <div className="p-5">
                <h3 className="font-bold text-gray-700 mb-4 text-sm">Top Search Keywords</h3>
                {(data?.topKeywords || []).length === 0 ? <p className="text-gray-400 text-sm">No keyword data yet.</p> : (
                  <div className="space-y-2">
                    {data.topKeywords.map((k: any, i: number) => (
                      <div key={k.keyword} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-800">{k.keyword}</span><span className="text-sm font-bold text-[#1a3c8f]">{k.count}</span></div>
                          <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-[#1a3c8f] rounded-full" style={{ width: `${(k.count / (data.topKeywords[0]?.count || 1)) * 100}%` }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "categories" && (
              <div className="p-5">
                <h3 className="font-bold text-gray-700 mb-4 text-sm">Top Categories</h3>
                {(data?.topCategories || []).length === 0 ? <p className="text-gray-400 text-sm">No category data yet.</p> : (
                  <div className="space-y-2">
                    {data.topCategories.map((c: any, i: number) => (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-800">{c.category}</span><span className="text-sm font-bold text-[#1a3c8f]">{c.count}</span></div>
                          <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${(c.count / (data.topCategories[0]?.count || 1)) * 100}%` }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
