"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { campusApi } from "@/lib/api";
import { CampusUpdate } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

const catColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700", events: "bg-purple-100 text-purple-700",
  announcements: "bg-yellow-100 text-yellow-700", scholarships: "bg-green-100 text-green-700",
};

export default function AdminCampusUpdatesPage() {
  const router = useRouter();
  const [items, setItems] = useState<CampusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search) params.search = search;
      const res = await campusApi.getAll(params);
      setItems(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const columns = [
    { key: "title", label: "Title", render: (u: CampusUpdate) => <div><p className="font-semibold text-gray-900">{u.title}</p><p className="text-xs text-gray-500">{u.institution}</p></div> },
    { key: "category", label: "Category", render: (u: CampusUpdate) => <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", catColors[u.category] || "bg-gray-100 text-gray-600")}>{u.category}</span> },
    { key: "date", label: "Date", render: (u: CampusUpdate) => <span className="text-xs">{formatDate(u.date)}</span> },
    { key: "status", label: "Status", render: (u: CampusUpdate) => <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{u.status}</span> },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Campus Updates Management</h1><p className="text-gray-500 text-sm">Manage campus news, events and announcements.</p></div>
      <AdminTable title="Campus Updates" addHref="/admin/campus-updates/new" columns={columns as any} data={items} loading={loading} search={search} onSearchChange={setSearch} onDelete={async id => { if (!confirm("Delete?")) return; try { await campusApi.delete(id); toast.success("Deleted!"); fetchData(); } catch { toast.error("Failed."); } }} onEdit={id => router.push(`/admin/campus-updates/${id}/edit`)} total={items.length} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
