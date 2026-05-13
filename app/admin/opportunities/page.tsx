"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { opportunitiesApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Globe } from "lucide-react";
import Link from "next/link";

const TYPES = [
  { key: "internship", label: "Internships" },
  { key: "grant", label: "Grants" },
  { key: "competition", label: "Competitions" },
  { key: "volunteer", label: "Volunteer" },
  { key: "study_abroad", label: "Study Abroad" },
  { key: "research", label: "Research" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-700 bg-green-50",
  expired: "text-red-700 bg-red-50",
  draft: "text-yellow-700 bg-yellow-50",
};

export default function AdminOpportunitiesPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState("internship");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { opportunity_type: activeType, page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await opportunitiesApi.getAll(params);
      const d = res.data;
      setItems(d?.data ?? []);
      setTotalPages(d?.total_pages ?? 1);
      setTotal(d?.total ?? 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeType, page, search, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this opportunity?")) return;
    await opportunitiesApi.delete(id);
    toast.success("Deleted successfully");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Opportunities Management</h1>
          <p className="text-gray-500 text-sm">Manage internships, grants, competitions and more.</p>
        </div>
        <Link href="/admin/opportunities/new" className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveType(t.key); setPage(1); }}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeType === t.key ? "bg-[#1a3c8f] text-white" : "text-gray-600 hover:bg-gray-100")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="expired">Expired</option>
        </select>
        <span className="self-center text-sm text-gray-500">{total} total</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Organizer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Deadline</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No {TYPES.find(t => t.key === activeType)?.label} found.</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                  {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{item.organizer}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{item.deadline ? formatDate(item.deadline) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[item.status] ?? "text-gray-500 bg-gray-50")}>{item.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => router.push(`/admin/opportunities/${item.id}/edit`)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
