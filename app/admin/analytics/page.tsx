"use client";

import { BarChart3, TrendingUp, Users, Briefcase, Eye, MousePointer } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const monthlyData = [
  { month: "Jan", users: 800, opportunities: 45, applications: 120 },
  { month: "Feb", users: 1100, opportunities: 62, applications: 180 },
  { month: "Mar", users: 1400, opportunities: 78, applications: 240 },
  { month: "Apr", users: 1800, opportunities: 95, applications: 310 },
  { month: "May", users: 2300, opportunities: 130, applications: 420 },
];

const categoryData = [
  { category: "Jobs", count: 186 }, { category: "Scholarships", count: 128 },
  { category: "Trainings", count: 84 }, { category: "Campus", count: 56 }, { category: "Resources", count: 234 },
];

const pieData = [
  { name: "Jobs", value: 35, color: "#1a3c8f" }, { name: "Scholarships", value: 28, color: "#7c3aed" },
  { name: "Trainings", value: 20, color: "#f59e0b" }, { name: "Campus Updates", value: 17, color: "#10b981" },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1><p className="text-gray-500 text-sm">Platform performance and user engagement metrics.</p></div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Page Views", value: "124,580", change: "+18.2%", icon: Eye, color: "text-blue-600 bg-blue-50" },
          { label: "Unique Visitors", value: "43,290", change: "+12.5%", icon: Users, color: "text-green-600 bg-green-50" },
          { label: "Opportunity Clicks", value: "28,740", change: "+22.8%", icon: MousePointer, color: "text-purple-600 bg-purple-50" },
          { label: "New Registrations", value: "3,412", change: "+9.3%", icon: Users, color: "text-orange-600 bg-orange-50" },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-green-600 font-medium flex items-center gap-0.5 mt-1"><TrendingUp className="w-3 h-3" /> {change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Monthly Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#1a3c8f" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="opportunities" stroke="#10b981" strokeWidth={2} name="Opportunities" />
              <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={2} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Content by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a3c8f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Opportunity Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Top Performing Content</h2>
          <div className="space-y-3">
            {[
              { title: "Software Engineer at Microsoft", views: 1240, category: "Job" },
              { title: "Future Leaders Scholarship 2025", views: 980, category: "Scholarship" },
              { title: "Python for Data Analysis", views: 875, category: "Training" },
              { title: "Annual Career Fair 2025", views: 720, category: "Campus" },
              { title: "How to Write a Winning CV", views: 650, category: "Resource" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-400 font-bold w-5">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#1a3c8f] flex-shrink-0">{item.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
