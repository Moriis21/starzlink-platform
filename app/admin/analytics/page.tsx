"use client";

import { useState, useEffect } from "react";
import { analyticsApi } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Bookmark } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CONTENT_TYPES = ["job", "scholarship", "training", "internship", "grant", "competition", "volunteer", "study_abroad", "research"];

const pieData = [
  { name: "Jobs", value: 35, color: "#1a3c8f" },
  { name: "Scholarships", value: 28, color: "#7c3aed" },
  { name: "Trainings", value: 20, color: "#f59e0b" },
  { name: "Opportunities", value: 17, color: "#10b981" },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState({ views: 0, clicks: 0, saves: 0 });
  const [topContent, setTopContent] = useState<any[]>([]);
  const [activeType, setActiveType] = useState("job");
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [sum, daily] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getDailyEvents(30),
      ]);
      setSummary(sum);

      // Aggregate daily events by date
      const grouped: Record<string, Record<string, number>> = {};
      (daily as any[]).forEach((ev: any) => {
        const date = ev.created_at?.slice(0, 10);
        if (!date) return;
        if (!grouped[date]) grouped[date] = { views: 0, clicks: 0, saves: 0 };
        if (ev.event_type === "view") grouped[date].views++;
        else if (ev.event_type === "apply_click") grouped[date].clicks++;
        else if (ev.event_type === "save") grouped[date].saves++;
      });
      const sorted = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...counts,
      }));
      setDailyData(sorted);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    analyticsApi.getTopContent(activeType, 10).then(data => setTopContent(data as any[]));
  }, [activeType]);

  const kpis = [
    { label: "Total Views", value: summary.views.toLocaleString(), icon: Eye, color: "text-blue-600 bg-blue-50", change: "Live data" },
    { label: "Apply Clicks", value: summary.clicks.toLocaleString(), icon: MousePointer, color: "text-green-600 bg-green-50", change: "Live data" },
    { label: "Saves", value: summary.saves.toLocaleString(), icon: Bookmark, color: "text-purple-600 bg-purple-50", change: "Live data" },
    { label: "CTR", value: summary.views > 0 ? `${((summary.clicks / summary.views) * 100).toFixed(1)}%` : "0%", icon: TrendingUp, color: "text-orange-600 bg-orange-50", change: "Click-through rate" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Real-time platform performance and user engagement metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{loading ? "..." : value}</p>
            <p className="text-xs text-gray-400 mt-1">{change}</p>
          </div>
        ))}
      </div>

      {/* Daily Events Chart */}
      {dailyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
          <h2 className="font-bold text-gray-900 mb-4">Daily Activity (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(dailyData.length / 7)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#1a3c8f" strokeWidth={2} name="Views" dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} name="Apply Clicks" dot={false} />
              <Line type="monotone" dataKey="saves" stroke="#f59e0b" strokeWidth={2} name="Saves" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Top Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top Content by Apply Clicks</h2>
            <select value={activeType} onChange={e => setActiveType(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white capitalize">
              {CONTENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {topContent.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet for this content type.</p>
            ) : topContent.map((item, i) => (
              <div key={item.content_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-400 font-bold w-5">{i + 1}</span>
                  <p className="text-sm font-medium text-gray-900 truncate">{item.content_id}</p>
                </div>
                <span className="text-sm font-bold text-[#1a3c8f] flex-shrink-0">{item.count} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Content Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* CTR per type */}
          <div className="mt-4 space-y-2">
            {[
              { type: "Jobs", views: summary.views, clicks: summary.clicks },
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#1a3c8f] h-1.5 rounded-full" style={{ width: `${Math.min(100, item.views > 0 ? (item.clicks / item.views) * 100 * 5 : 0)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {item.views > 0 ? `${((item.clicks / item.views) * 100).toFixed(1)}%` : "0%"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
