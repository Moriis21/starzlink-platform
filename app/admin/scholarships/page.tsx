"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { scholarshipsApi, adminApi } from "@/lib/api";
import { Scholarship } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

export default function AdminScholarshipsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search) params.search = search;
      const res = await scholarshipsApi.getAll(params);
      setItems(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scholarship?")) return;
    try {
      await scholarshipsApi.delete(id);
      toast.success("Deleted successfully.");
      fetchData();
    } catch { toast.error("Failed to delete."); }
  };

  const handleToggle = async (id: string) => {
    try {
      await scholarshipsApi.toggleStatus(id);
      toast.success("Status updated.");
      fetchData();
    } catch { toast.error("Failed."); }
  };

  const columns = [
    { key: "title", label: "Scholarship Title", render: (s: Scholarship) => (<div><p className="font-semibold text-gray-900">{s.title}</p><p className="text-xs text-gray-500">{s.provider}</p></div>) },
    { key: "country", label: "Country" },
    { key: "study_level", label: "Level" },
    { key: "funding_type", label: "Funding", render: (s: Scholarship) => <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s.funding_type}</span> },
    { key: "deadline", label: "Deadline", render: (s: Scholarship) => <span className="text-xs">{formatDate(s.deadline)}</span> },
    { key: "status", label: "Status", render: (s: Scholarship) => <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", getStatusColor(s.status))}>{s.status}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Scholarships Management</h1>
        <p className="text-gray-500 text-sm">Manage all scholarship listings on StarzLink.</p>
      </div>
      <AdminTable title="Scholarships" addHref="/admin/scholarships/new" columns={columns as any} data={items} loading={loading} search={search} onSearchChange={setSearch} onDelete={handleDelete} onEdit={id => router.push(`/admin/scholarships/${id}/edit`)} onToggle={handleToggle} onExport={() => {}} total={total} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
