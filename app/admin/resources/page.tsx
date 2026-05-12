"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi } from "@/lib/api";
import { Resource } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

export default function AdminResourcesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search) params.search = search;
      const res = await resourcesApi.getAll(params);
      setItems(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const columns = [
    { key: "title", label: "Resource Title", render: (r: Resource) => <div><p className="font-semibold text-gray-900">{r.title}</p><p className="text-xs text-gray-500 truncate max-w-xs">{r.description}</p></div> },
    { key: "category", label: "Category", render: (r: Resource) => <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.category}</span> },
    { key: "created_at", label: "Date Added", render: (r: Resource) => <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span> },
    { key: "status", label: "Status", render: (r: Resource) => <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", r.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{r.status}</span> },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Resources Management</h1><p className="text-gray-500 text-sm">Manage all downloadable resources and guides.</p></div>
      <AdminTable title="Resources" addHref="/admin/resources/new" columns={columns as any} data={items} loading={loading} search={search} onSearchChange={setSearch} onDelete={async id => { if (!confirm("Delete?")) return; try { await resourcesApi.delete(id); toast.success("Deleted!"); fetchData(); } catch { toast.error("Failed."); } }} onEdit={id => router.push(`/admin/resources/${id}/edit`)} total={items.length} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
