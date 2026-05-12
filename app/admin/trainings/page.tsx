"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trainingsApi } from "@/lib/api";
import { Training } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

export default function AdminTrainingsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Training[]>([]);
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
      const res = await trainingsApi.getAll(params);
      setItems(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const columns = [
    { key: "title", label: "Training Title", render: (t: Training) => <div><p className="font-semibold text-gray-900">{t.title}</p><p className="text-xs text-gray-500">{t.provider}</p></div> },
    { key: "mode", label: "Mode", render: (t: Training) => <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full capitalize">{t.mode}</span> },
    { key: "fee", label: "Fee" },
    { key: "duration", label: "Duration" },
    { key: "start_date", label: "Start Date", render: (t: Training) => <span className="text-xs">{formatDate(t.start_date)}</span> },
    { key: "status", label: "Status", render: (t: Training) => <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", getStatusColor(t.status))}>{t.status}</span> },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Trainings Management</h1><p className="text-gray-500 text-sm">Manage all training programs on StarzLink.</p></div>
      <AdminTable title="Trainings" addHref="/admin/trainings/new" columns={columns as any} data={items} loading={loading} search={search} onSearchChange={setSearch} onDelete={async id => { if (!confirm("Delete?")) return; try { await trainingsApi.delete(id); toast.success("Deleted!"); fetchData(); } catch { toast.error("Failed."); } }} onEdit={id => router.push(`/admin/trainings/${id}/edit`)} onToggle={async id => { try { await trainingsApi.toggleStatus(id); toast.success("Updated!"); fetchData(); } catch {} }} total={total} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
