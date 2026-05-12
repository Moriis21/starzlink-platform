"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/types";
import { Users, Briefcase, GraduationCap, BookOpen, Megaphone, TrendingUp, Mail, Clock, Plus, ArrowUpRight, Activity } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const chartData = [
  { date: "May 18", users: 1200, opportunities: 85, applications: 240 },
  { date: "May 19", users: 1400, opportunities: 95, applications: 280 },
  { date: "May 20", users: 1600, opportunities: 110, applications: 320 },
  { date: "May 21", users: 1800, opportunities: 130, applications: 380 },
  { date: "May 22", users: 2200, opportunities: 155, applications: 420 },
  { date: "May 23", users: 2600, opportunities: 175, applications: 460 },
  { date: "May 24", users: 3000, opportunities: 200, applications: 510 },
];

const pieData = [
  { name: "Students", value: 62, color: "#1a3c8f" },
  { name: "Professionals", value: 20, color: "#3b82f6" },
  { name: "Institutions", value: 10, color: "#60a5fa" },
  { name: "Admins", value: 8, color: "#93c5fd" },
];

const quickActions = [
  { label: "Add Opportunity", icon: Briefcase, href: "/admin/jobs/new", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Add Scholarship", icon: GraduationCap, href: "/admin/scholarships/new", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { label: "Add Training", icon: BookOpen, href: "/admin/trainings/new", color: "bg-orange-50 text-orange-700 border-orange-100" },
  { label: "Post Update", icon: Megaphone, href: "/admin/campus-updates/new", color: "bg-green-50 text-green-700 border-green-100" },
  { label: "Send Newsletter", icon: Mail, href: "/admin/newsletter/compose", color: "bg-pink-50 text-pink-700 border-pink-100" },
];

const recentActivity = [
  { icon: Users, text: "New user registered", sub: "John Doe joined the platform.", time: "2 minutes ago", color: "bg-blue-100 text-blue-700" },
  { icon: Briefcase, text: "New opportunity posted", sub: "Senior Data Analyst at TechCorp", time: "15 minutes ago", color: "bg-purple-100 text-purple-700" },
  { icon: GraduationCap, text: "New scholarship added", sub: "Future Leaders Scholarship 2025", time: "1 hour ago", color: "bg-green-100 text-green-700" },
  { icon: BookOpen, text: "New training session added", sub: "UI/UX Design Bootcamp", time: "2 hours ago", color: "bg-orange-100 text-orange-700" },
  { icon: Megaphone, text: "Campus update published", sub: "Annual Career Fair 2025 Announced", time: "3 hours ago", color: "bg-pink-100 text-pink-700" },
];

const latestOpportunities = [
  { title: "Software Engineer", category: "IT & Software", posted_by: "TechCorp", date: "May 24, 2025", applications: 128, status: "Active" },
  { title: "Marketing Intern", category: "Marketing", posted_by: "BrandSphere", date: "May 23, 2025", applications: 96, status: "Active" },
  { title: "Data Analyst", category: "Data Science", posted_by: "DataWorks", date: "May 22, 2025", applications: 78, status: "Active" },
  { title: "Project Manager", category: "Management", posted_by: "Buildit Inc.", date: "May 21, 2025", applications: 64, status: "Active" },
  { title: "Graphic Designer", category: "Design", posted_by: "Creative Studio", date: "May 20, 2025", applications: 52, status: "Inactive" },
];

interface ActivityLog { id: string; action: string; module: string; details?: string; created_at: string; }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, logsRes, jobsRes] = await Promise.allSettled([
          adminApi.getStats(),
          insforge.database.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6),
          insforge.database.from("jobs").select("id,title,category,company,created_at,status").order("created_at", { ascending: false }).limit(5),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data || statsRes.value.data);
        if (logsRes.status === "fulfilled") setActivityLogs((logsRes.value as any).data ?? []);
        if (jobsRes.status === "fulfilled") setRecentJobs((jobsRes.value as any).data ?? []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats?.total_users || 18542, change: "+12.5%", icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Total Opportunities", value: stats?.total_jobs || 342, change: "+8.1%", icon: Briefcase, color: "text-purple-600 bg-purple-50" },
    { label: "Total Scholarships", value: stats?.total_scholarships || 128, change: "+15.3%", icon: GraduationCap, color: "text-green-600 bg-green-50" },
    { label: "Total Trainings", value: stats?.total_trainings || 84, change: "+6.7%", icon: BookOpen, color: "text-orange-600 bg-orange-50" },
    { label: "Campus Updates", value: stats?.total_campus_updates || 56, change: "+11.2%", icon: Megaphone, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, Admin! Here's what's happening on StarzLink.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-[#1a3c8f] transition-colors">
            <Clock className="w-4 h-4" /> {dateRange} <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> {change} from last week
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Platform Overview</h2>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
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
        </div>

        {/* Recent Activity — from DB */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Link href="/admin/activity-logs" className="text-xs text-[#1a3c8f] hover:underline">View All</Link>
          </div>
          {activityLogs.length === 0 ? (
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
                  {["Title", "Category", "Posted By", "Posted On", "Applications", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentJobs.length === 0 ? (
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
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />{name}</div>
                  <span className="text-gray-500 font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
