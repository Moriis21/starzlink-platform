"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { ActivityLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { Activity, Search, Filter } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

const moduleColors: Record<string, string> = {
  jobs: "bg-blue-100 text-blue-700", scholarships: "bg-purple-100 text-purple-700",
  trainings: "bg-orange-100 text-orange-700", users: "bg-green-100 text-green-700",
  campus_updates: "bg-yellow-100 text-yellow-700", newsletter: "bg-pink-100 text-pink-700",
  auth: "bg-gray-100 text-gray-600",
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getActivityLogs({ page: String(page), search });
        setLogs(res.data?.data || res.data || []);
        setTotalPages(res.data?.total_pages || 1);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [page, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Activity Logs</h1><p className="text-gray-500 text-sm">Track all admin and user actions on the platform.</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">All Activity</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none w-52" />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Module</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 capitalize">{log.action?.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${moduleColors[log.module] || "bg-gray-100 text-gray-600"}`}>{log.module?.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{log.details || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-gray-400"><Activity className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No activity logs yet</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
    </div>
  );
}
