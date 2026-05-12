"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi, adminApi } from "@/lib/api";
import { Resource } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { Lock, Unlock, ImageIcon, ExternalLink } from "lucide-react";

export default function AdminResourcesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Resource[]>([]);
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
      const res = await resourcesApi.getAll(params);
      setItems(res.data?.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await resourcesApi.delete(id);
      await adminApi.logAction("delete", "resources", `Deleted resource ${id}`);
      toast.success("Resource deleted.");
      fetchData();
    } catch { toast.error("Delete failed."); }
  };

  const columns = [
    {
      key: "title",
      label: "Resource",
      render: (r: Resource) => (
        <div className="flex items-start gap-3">
          {/* Thumbnail preview */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            {r.image_url ? (
              <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-300" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (r: Resource) => (
        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{r.category}</span>
      ),
    },
    {
      key: "is_paid",
      label: "Pricing",
      render: (r: Resource) => (
        <div className="flex items-center gap-1.5">
          {r.is_paid ? (
            <>
              <Lock className="w-3.5 h-3.5 text-[#1a3c8f]" />
              <span className="text-sm font-bold text-[#1a3c8f]">
                {r.currency === "USD" ? "$" : r.currency}{Number(r.price || 0).toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-bold text-green-600">Free</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "file_url",
      label: "Has File/Link",
      render: (r: Resource) => (
        r.file_url ? (
          <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#1a3c8f] hover:underline">
            <ExternalLink className="w-3 h-3" /> View link
          </a>
        ) : (
          <span className="text-xs text-red-500 font-medium">⚠ No file/link</span>
        )
      ),
    },
    {
      key: "created_at",
      label: "Added",
      render: (r: Resource) => <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r: Resource) => (
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-full",
          r.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        )}>
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Resources Management</h1>
        <p className="text-gray-500 text-sm">
          Manage all downloadable resources, templates, and guides.
          <span className="ml-2 text-yellow-600 font-medium">⚠ All paid resources need a thumbnail and access link.</span>
        </p>
      </div>

      <AdminTable
        title="Resources"
        addHref="/admin/resources/new"
        columns={columns as any}
        data={items}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onDelete={handleDelete}
        onEdit={id => router.push(`/admin/resources/${id}/edit`)}
        onExport={() => {}}
        total={total}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
