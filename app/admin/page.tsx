"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/types";
import { Users, Briefcase, GraduationCap, BookOpen, Megaphone, TrendingUp, Mail, Clock, ArrowUpRight, Activity } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const CHART_COLORS = ["#1a3c8f", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e"];

const quickActions = [
  { label: "Add Opportunity", icon: Briefcase, href: "/admin/jobs/new", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Add Scholarship", icon: GraduationCap, href: "/admin/scholarships/new", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { label: "Add Training", icon: BookOpen, href: "/admin/trainings/new", color: "bg-orange-50 text-orange-700 border-orange-100" },
  { label: "Post Update", icon: Megaphone, href: "/admin/campus-updates/new", color: "bg-green-50 text-green-700 border-green-100" },
  { label: "Send Newsletter", icon: Mail, href: "/admin/newsletter", color: "bg-pink-50 text-pink-700 border-pink-100" },
];

interface ActivityLog { id: string; action: string; module: string; details?: string; created_at: string; }

// Build last-7-days chart skeleton (0 values) then fill with real data
function buildChartBase() {
  const days: { date: string; users: number; opportunities: number; applications: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: 0,
      opportunities: 0,
      applications: 0,
    });
  }
  return days;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState("Last 7 Days");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [chartData, setChartData] = useState(buildChartBase());
  const [userDist, setUserDist] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Query all counts directly from client side — SDK works correctly here
        const [jobsCount, scholCount, trainCount, campusCount, logsRes, jobsRes, usersTypeRes] =
          await Promise.allSettled([
            insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
            insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
            insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
            insforge.database.from("campus_updates").select("id", { count: "exact" }).limit(1),
            insforge.database.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6),
            insforge.database.from("jobs").select("id,title,category,company,created_at,status").order("created_at", { ascending: false }).limit(5),
            insforge.database.from("profiles").select("id,user_type").limit(1000),
          ]);

        // Get real user count from admin API (bypasses profiles RLS)
        let userCount = 0;
        try {
          const uRes = await fetch("/api/admin/users?limit=1000");
          const uData = await uRes.json();
          userCount = uData.total ?? (uData.users?.length ?? 0);
        } catch {}

        setStats({
          total_users: userCount,
          total_jobs: jobsCount.status === "fulfilled" ? (jobsCount.value as any).count ?? 0 : 0,
          total_scholarships: scholCount.status === "fulfilled" ? (scholCount.value as any).count ?? 0 : 0,
          total_trainings: trainCount.status === "fulfilled" ? (trainCount.value as any).count ?? 0 : 0,
          total_campus_updates: campusCount.status === "fulfilled" ? (campusCount.value as any).count ?? 0 : 0,
        } as AdminStats);
        setStatsLoading(false);

        if (logsRes.status === "fulfilled") setActivityLogs((logsRes.value as any).data ?? []);
        if (jobsRes.status === "fulfilled") setRecentJobs((jobsRes.value as any).data ?? []);

        // User distribution from real profile data
        if (usersTypeRes.status === "fulfilled") {
          const rows: any[] = (usersTypeRes.value as any).data ?? [];
          const counts: Record<string, number> = {};
          rows.forEach((r: any) => { const t = r.user_type || "other"; counts[t] = (counts[t] || 0) + 1; });
          const colors = ["#1a3c8f", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
          const dist = Object.entries(counts).map(([name, value], i) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: colors[i % colors.length],
          }));
          setUserDist(dist);
        }

      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Total Opportunities", value: stats?.total_jobs ?? 0, icon: Briefcase, color: "text-purple-600 bg-purple-50" },
    { label: "Total Scholarships", value: stats?.total_scholarships ?? 0, icon: GraduationCap, color: "text-green-600 bg-green-50" },
    { label: "Total Trainings", value: stats?.total_trainings ?? 0, icon: BookOpen, color: "text-orange-600 bg-orange-50" },
    { label: "Campus Updates", value: stats?.total_campus_updates ?? 0, icon: Megaphone, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, Admin! Here&apos;s what&apos;s happening on StarzLink.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-[#1a3c8f] transition-colors">
            <Clock className="w-4 h-4" /> {dateRange} <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statsLoading
          ? Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live data
              </p>
            </div>
          ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Platform Overview</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">Last 7 Days</span>
          </div>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1a3c8f] rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#1a3c8f" strokeWidth={2} dot={false} name="Users" />
                <Line type="monotone" dataKey="opportunities" stroke="#10b981" strokeWidth={2} dot={false} name="Opportunities" />
                <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={2} dot={false} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity — from DB */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Link href="/admin/activity-logs" className="text-xs text-[#1a3c8f] hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="py-6 text-center">
              <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No activity logged yet.</p>
              <p className="text-[10px] text-gray-300 mt-1">Actions like adding jobs or scholarships will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 capitalize">{log.action} · {log.module?.replace("_", " ")}</p>
                    {log.details && <p className="text-xs text-gray-500 truncate">{log.details}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Latest Opportunities Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Latest Opportunities</h2>
            <Link href="/admin/jobs" className="text-xs text-[#1a3c8f] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Title", "Category", "Posted By", "Posted On", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : recentJobs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">No jobs yet</td></tr>
                ) : recentJobs.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.category || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.company}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(({ label, icon: Icon, href, color }) => (
                <Link key={href} href={href} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center hover:shadow-sm transition-all ${color}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Distribution Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">User Distribution</h2>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1a3c8f] rounded-full animate-spin" />
              </div>
            ) : userDist.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-xs text-gray-400">No user data yet.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={userDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {userDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {userDist.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        {name}
                      </div>
                      <span className="text-gray-500 font-medium">{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
