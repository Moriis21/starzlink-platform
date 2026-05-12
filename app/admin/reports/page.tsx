"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import {
  BarChart3, TrendingUp, Users, Briefcase, GraduationCap,
  BookOpen, Megaphone, FolderOpen, Download, Calendar,
  ArrowUp, ArrowDown, Minus, RefreshCw, Loader2
} from "lucide-react";

interface ReportData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalJobs: number;
  activeJobs: number;
  totalScholarships: number;
  activeScholarships: number;
  totalTrainings: number;
  activeTrainings: number;
  totalCampusUpdates: number;
  totalResources: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalMessages: number;
  unreadMessages: number;
  totalSubscribers: number;
}

interface MonthStat {
  month: string;
  value: number;
}

const EMPTY: ReportData = {
  totalUsers: 0, newUsersThisMonth: 0, totalJobs: 0, activeJobs: 0,
  totalScholarships: 0, activeScholarships: 0, totalTrainings: 0, activeTrainings: 0,
  totalCampusUpdates: 0, totalResources: 0, totalSubmissions: 0,
  pendingSubmissions: 0, approvedSubmissions: 0,
  totalMessages: 0, unreadMessages: 0, totalSubscribers: 0,
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState<"all" | "month" | "week">("all");

  const fetchStats = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true); else setLoading(true);

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const since = period === "month" ? monthStart : period === "week" ? weekStart : undefined;

      const queries = await Promise.allSettled([
        insforge.database.from("profiles").select("id", { count: "exact" }).limit(1),
        insforge.database.from("profiles").select("id", { count: "exact" }).gte("created_at", monthStart).limit(1),
        insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
        insforge.database.from("jobs").select("id", { count: "exact" }).eq("status", "active").limit(1),
        insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
        insforge.database.from("scholarships").select("id", { count: "exact" }).eq("status", "active").limit(1),
        insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
        insforge.database.from("trainings").select("id", { count: "exact" }).eq("status", "active").limit(1),
        insforge.database.from("campus_updates").select("id", { count: "exact" }).limit(1),
        insforge.database.from("resources").select("id", { count: "exact" }).limit(1),
        insforge.database.from("submissions").select("id", { count: "exact" }).limit(1),
        insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "pending").limit(1),
        insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "approved").limit(1),
        insforge.database.from("messages").select("id", { count: "exact" }).limit(1),
        insforge.database.from("messages").select("id", { count: "exact" }).eq("status", "unread").limit(1),
        insforge.database.from("newsletter_subscribers").select("id", { count: "exact" }).limit(1),
      ]);

      const get = (i: number) => (queries[i] as any)?.value?.count ?? 0;

      setData({
        totalUsers: get(0),
        newUsersThisMonth: get(1),
        totalJobs: get(2),
        activeJobs: get(3),
        totalScholarships: get(4),
        activeScholarships: get(5),
        totalTrainings: get(6),
        activeTrainings: get(7),
        totalCampusUpdates: get(8),
        totalResources: get(9),
        totalSubmissions: get(10),
        pendingSubmissions: get(11),
        approvedSubmissions: get(12),
        totalMessages: get(13),
        unreadMessages: get(14),
        totalSubscribers: get(15),
      });
      setLastUpdated(new Date());
    } catch {}

    if (showRefreshing) setRefreshing(false); else setLoading(false);
  };

  useEffect(() => { fetchStats(); }, [period]);

  const statCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      sub: `+${data.newUsersThisMonth} this month`,
      icon: Users,
      color: "bg-blue-500",
      light: "bg-blue-50 text-blue-700",
      trend: data.newUsersThisMonth > 0 ? "up" : "flat",
    },
    {
      title: "Active Jobs",
      value: data.activeJobs,
      sub: `${data.totalJobs} total posted`,
      icon: Briefcase,
      color: "bg-purple-500",
      light: "bg-purple-50 text-purple-700",
      trend: "flat",
    },
    {
      title: "Active Scholarships",
      value: data.activeScholarships,
      sub: `${data.totalScholarships} total posted`,
      icon: GraduationCap,
      color: "bg-green-500",
      light: "bg-green-50 text-green-700",
      trend: "flat",
    },
    {
      title: "Active Trainings",
      value: data.activeTrainings,
      sub: `${data.totalTrainings} total posted`,
      icon: BookOpen,
      color: "bg-orange-500",
      light: "bg-orange-50 text-orange-700",
      trend: "flat",
    },
    {
      title: "Campus Updates",
      value: data.totalCampusUpdates,
      sub: "All time published",
      icon: Megaphone,
      color: "bg-yellow-500",
      light: "bg-yellow-50 text-yellow-700",
      trend: "flat",
    },
    {
      title: "Resources",
      value: data.totalResources,
      sub: "Files & documents",
      icon: FolderOpen,
      color: "bg-teal-500",
      light: "bg-teal-50 text-teal-700",
      trend: "flat",
    },
    {
      title: "Newsletter Subscribers",
      value: data.totalSubscribers,
      sub: "Active subscribers",
      icon: TrendingUp,
      color: "bg-pink-500",
      light: "bg-pink-50 text-pink-700",
      trend: data.totalSubscribers > 0 ? "up" : "flat",
    },
    {
      title: "Unread Messages",
      value: data.unreadMessages,
      sub: `${data.totalMessages} total messages`,
      icon: BarChart3,
      color: "bg-red-500",
      light: "bg-red-50 text-red-700",
      trend: data.unreadMessages > 0 ? "up" : "flat",
    },
  ];

  const submissionBreakdown = [
    { label: "Total Submissions", value: data.totalSubmissions, pct: 100 },
    { label: "Pending Review", value: data.pendingSubmissions, pct: data.totalSubmissions ? Math.round(data.pendingSubmissions / data.totalSubmissions * 100) : 0, color: "bg-yellow-400" },
    { label: "Approved", value: data.approvedSubmissions, pct: data.totalSubmissions ? Math.round(data.approvedSubmissions / data.totalSubmissions * 100) : 0, color: "bg-green-400" },
    { label: "Rejected", value: data.totalSubmissions - data.pendingSubmissions - data.approvedSubmissions, pct: data.totalSubmissions ? Math.round((data.totalSubmissions - data.pendingSubmissions - data.approvedSubmissions) / data.totalSubmissions * 100) : 0, color: "bg-red-400" },
  ];

  const opportunityBreakdown = [
    { label: "Jobs", total: data.totalJobs, active: data.activeJobs, icon: Briefcase, color: "bg-purple-400" },
    { label: "Scholarships", total: data.totalScholarships, active: data.activeScholarships, icon: GraduationCap, color: "bg-green-400" },
    { label: "Trainings", total: data.totalTrainings, active: data.activeTrainings, icon: BookOpen, color: "bg-orange-400" },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">
            Platform performance overview
            {lastUpdated && <span className="ml-2 text-gray-400">· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "month", "week"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${period === p ? "bg-white text-[#1a3c8f] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {p === "all" ? "All Time" : p === "month" ? "This Month" : "This Week"}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.light} flex items-center gap-0.5`}>
                {card.trend === "up" ? <ArrowUp className="w-3 h-3" /> : card.trend === "down" ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{card.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Opportunities breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#1a3c8f]" /> Opportunities Breakdown
          </h2>
          <div className="space-y-4">
            {opportunityBreakdown.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{item.active} active</span>
                    <span className="text-xs text-gray-400 ml-1">/ {item.total} total</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all`}
                    style={{ width: item.total > 0 ? `${Math.round(item.active / item.total * 100)}%` : "0%" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.total > 0 ? Math.round(item.active / item.total * 100) : 0}% active rate
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1a3c8f]" /> Submissions Breakdown
          </h2>
          <div className="space-y-4">
            {submissionBreakdown.slice(1).map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value} <span className="text-xs text-gray-400 font-normal">({item.pct}%)</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Total Submissions</span>
              <span className="text-lg font-extrabold text-gray-900">{data.totalSubmissions}</span>
            </div>
          </div>
        </div>

        {/* Platform health */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1a3c8f]" /> Platform Summary
          </h2>
          <div className="space-y-3">
            {[
              { label: "Total Opportunities Posted", value: data.totalJobs + data.totalScholarships + data.totalTrainings },
              { label: "Currently Active Opportunities", value: data.activeJobs + data.activeScholarships + data.activeTrainings },
              { label: "Campus Updates Published", value: data.totalCampusUpdates },
              { label: "Resources Available", value: data.totalResources },
              { label: "Newsletter Subscribers", value: data.totalSubscribers },
              { label: "Messages Awaiting Reply", value: data.unreadMessages },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className="text-sm font-bold text-gray-900">{row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-6 text-white">
          <h2 className="font-extrabold text-lg mb-2">Quick Insights</h2>
          <p className="text-blue-200 text-sm mb-5">Key metrics at a glance for today.</p>
          <div className="space-y-3">
            {[
              { label: "Opportunities expiring this week", note: "Check expiry dates", urgent: false },
              { label: `${data.pendingSubmissions} submissions awaiting review`, note: "Review now", urgent: data.pendingSubmissions > 0 },
              { label: `${data.unreadMessages} unread contact messages`, note: "Reply to messages", urgent: data.unreadMessages > 0 },
              { label: `${data.newUsersThisMonth} new users this month`, note: "Growing audience", urgent: false },
            ].map(item => (
              <div key={item.label} className={`flex items-start gap-3 p-3 rounded-xl ${item.urgent ? "bg-white/20" : "bg-white/10"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.urgent ? "bg-yellow-400" : "bg-blue-300"}`} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-blue-300">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
